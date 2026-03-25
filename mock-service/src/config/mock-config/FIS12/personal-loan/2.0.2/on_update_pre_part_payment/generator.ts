import { randomUUID } from "crypto";
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onUpdatePrePartPaymentDefaultGenerator(existingPayload: any, sessionData: any) {
  // Standalone PRE_PART_PAYMENT on_update generator
  existingPayload.context = existingPayload.context || {};
  existingPayload.context.timestamp = new Date().toISOString();
  if (sessionData?.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
  if (sessionData?.message_id) existingPayload.context.message_id = sessionData.message_id;

  existingPayload.message = existingPayload.message || {};
  const order = existingPayload.message.order || (existingPayload.message.order = {});

  // If default.yaml doesn't have payments, try carrying forward from session
  if ((!Array.isArray(order.payments) || order.payments.length === 0) && sessionData?.order?.payments?.length) {
    order.payments = sessionData.order.payments;
  }

  // CRITICAL: Merge installments AND ON_ORDER payment from session data
  // IMPORTANT: Maintain the correct payment order from default.yaml
  // Expected order: PRE_PART_PAYMENT, ON_ORDER payment, then installments
  if (sessionData?.order?.payments?.length > 0) {
    const sessionPayments = sessionData.order.payments;

    // Extract installments from session
    const installmentsFromSession = sessionPayments.filter(
      (p: any) => p.type === 'POST_FULFILLMENT' && p.time?.label === 'INSTALLMENT'
    );

    // Extract ON_ORDER payment from session (preserve unique ID from on_confirm)
    const onOrderFromSession = sessionPayments.find(
      (p: any) => p.type === 'ON_ORDER'
    );

    // Find the PRE_PART_PAYMENT payment from default.yaml (first payment)
    const prePartPayment = order.payments.find(
      (p: any) => p.type === 'POST_FULFILLMENT' &&
        (p.time?.label === 'PRE_PART_PAYMENT' || !p.time?.label)
    );

    // Rebuild payments array in correct order
    const rebuiltPayments: any[] = [];

    // 1. Add PRE_PART_PAYMENT (from default.yaml, but customize it)
    if (prePartPayment) {
      prePartPayment.time = prePartPayment.time || {};
      prePartPayment.time.label = "PRE_PART_PAYMENT";
      if (prePartPayment.time.range) delete prePartPayment.time.range;

      // Generate unique ID for this NEW pre-part payment
      // Format: pre_part_<uuid> to identify it as a pre-part payment
      if (!prePartPayment.id || prePartPayment.id === 'PAYMENT_ID_GOLD_LOAN' || prePartPayment.id === 'PAYMENT_ID_PERSONAL_LOAN') {
        prePartPayment.id = `pre_part_${randomUUID()}`;
        console.log(`Generated unique pre-part payment ID: ${prePartPayment.id}`);
      }

      // Prefer amount from flow/user input (config uses pre_part_payment)
      prePartPayment.params = prePartPayment.params || {};
      const userAmt = sessionData?.user_inputs?.pre_part_payment ?? sessionData?.user_inputs?.part_payment_amount;
      if (typeof userAmt === "number") prePartPayment.params.amount = String(userAmt);
      else if (typeof userAmt === "string" && userAmt.trim()) prePartPayment.params.amount = userAmt.trim();

      // Payment URL generation (FORM_SERVICE)
      const formService = process.env.FORM_SERVICE;
      const txId = existingPayload?.context?.transaction_id || sessionData?.transaction_id;
      if (formService && txId) {
        prePartPayment.url = `${formService}/forms/${sessionData.domain}/payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${txId}`;
      }

      rebuiltPayments.push(prePartPayment);
      console.log('Updated PRE_PART_PAYMENT payment with label, unique ID, and amount');
    }

    // 2. Add ON_ORDER payment (from session, with updated status)
    if (onOrderFromSession) {
      const updatedOnOrder = {
        ...onOrderFromSession,
        status: 'PAID'  // ON_ORDER is always PAID by the time we reach update flows
      };
      rebuiltPayments.push(updatedOnOrder);
      console.log('Preserved ON_ORDER payment from session with unique ID and updated status to PAID');
    }

    // 3. Add installments (from session, with updated statuses)
    if (installmentsFromSession.length > 0) {
      console.log(`Found ${installmentsFromSession.length} installments from session data`);

      // At on_update_pre_part_payment stage, the payment URL is just being issued.
      // No installments are settled yet — all remain NOT-PAID.
      // DEFERRED transition happens in the unsolicited callback after payment is confirmed.
      const updatedInstallments = installmentsFromSession.map((installment: any) => {
        return {
          ...installment,
          status: 'NOT-PAID'
        };
      });

      rebuiltPayments.push(...updatedInstallments);
      console.log('Merged installments — all NOT-PAID (payment not yet confirmed at this stage)');
    }

    // Replace the entire payments array with the correctly ordered one
    order.payments = rebuiltPayments;
  }

  // order.id
  if (sessionData?.order_id) order.id = sessionData.order_id;
  else if (!order.id || order.id === "LOAN_LEAD_ID_OR_SIMILAR_ORDER_ID" || String(order.id).startsWith("LOAN_LEAD_ID")) {
    order.id = `personal_loan_${randomUUID()}`;
  }

  // provider.id
  if (order.provider) {
    if (sessionData?.selected_provider?.id) order.provider.id = sessionData.selected_provider.id;
    else if (!order.provider.id || order.provider.id === "PROVIDER_ID" || String(order.provider.id).startsWith("PROVIDER_ID")) {
      order.provider.id = `personal_loan_provider_${randomUUID()}`;
    }
  }

  // item.id
  const selectedItem = sessionData?.item || (Array.isArray(sessionData?.items) ? sessionData.items[0] : undefined);
  if (order.items?.[0]) {
    if (selectedItem?.id) {
      order.items[0].id = selectedItem.id
      order.items[0].price = sessionData.order.items[0].price
    }
    else if (!order.items[0].id || String(order.items[0].id).startsWith("ITEM_ID_PERSONAL_LOAN") || String(order.items[0].id).startsWith("ITEM_ID_GOLD_LOAN")) {
      order.items[0].id = `personal_loan_item_${randomUUID()}`;
    }
  }

  // quote.id
  if (order.quote) {
    const quoteId = sessionData?.quote_id || sessionData?.order?.quote?.id || sessionData?.quote?.id;
    order.quote.price = sessionData.order.quote.price;
    if (quoteId) order.quote.id = quoteId;
    else if (!order.quote.id || order.quote.id === "bcaa0931-47d7-42c9-aa83-3fb2b5048551" || String(order.quote.id).startsWith("LOAN_LEAD_ID")) {
      order.quote.id = `personal_loan_quote_${randomUUID()}`;
    }
  }

  // Set created_at and updated_at to current timestamp
  if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    existingPayload.message.order.created_at = sessionData.order.created_at;
    existingPayload.message.order.updated_at = now;
    console.log("Set order.created_at and order.updated_at to:", now);
  }

  // Dynamically inject SETTLEMENT_AMOUNT derived from BAP_TERMS fee data
  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}


