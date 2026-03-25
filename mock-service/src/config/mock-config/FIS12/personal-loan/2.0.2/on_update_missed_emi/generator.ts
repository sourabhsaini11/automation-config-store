import { randomUUID } from "crypto";
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onUpdateMissedEmiDefaultGenerator(existingPayload: any, sessionData: any) {
  // Standalone MISSED_EMI_PAYMENT on_update generator
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
  // Expected order: MISSED_EMI_PAYMENT, ON_ORDER payment, then installments
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

    // Find the MISSED_EMI_PAYMENT payment from default.yaml (first payment)
    const missedEmiPayment = order.payments.find(
      (p: any) => p.type === 'POST_FULFILLMENT' &&
        (p.time?.label === 'MISSED_EMI_PAYMENT' || !p.time?.label)
    );

    // Rebuild payments array in correct order
    const rebuiltPayments: any[] = [];

    // 1. Add MISSED_EMI_PAYMENT (from default.yaml, but customize it)
    if (missedEmiPayment) {
      missedEmiPayment.time = missedEmiPayment.time || {};
      missedEmiPayment.time.label = "MISSED_EMI_PAYMENT";

      // Generate unique ID for this NEW missed EMI payment
      // Format: missed_emi_<uuid> to identify it as a missed EMI payment
      if (!missedEmiPayment.id || missedEmiPayment.id === 'PAYMENT_ID_GOLD_LOAN' || missedEmiPayment.id === 'PAYMENT_ID_PERSONAL_LOAN') {
        missedEmiPayment.id = `missed_emi_${randomUUID()}`;
        console.log(`Generated unique missed EMI payment ID: ${missedEmiPayment.id}`);
      }

      // Amount override
      missedEmiPayment.params = missedEmiPayment.params || {};
      const userAmt = sessionData?.user_inputs?.missed_emi_amount;
      if (typeof userAmt === "number") missedEmiPayment.params.amount = String(userAmt);
      else if (typeof userAmt === "string" && userAmt.trim()) missedEmiPayment.params.amount = userAmt.trim();

      // ALWAYS generate current date range for missed EMI payment (don't use 2023 dates from default.yaml)
      // This represents the month when the EMI is being missed (current month)
      const ts = existingPayload?.context?.timestamp || new Date().toISOString();
      const d = new Date(ts);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      missedEmiPayment.time.range = { start: start.toISOString(), end: end.toISOString() };
      console.log(`Set MISSED_EMI_PAYMENT date range to current month: ${start.toISOString().substring(0, 7)}`);

      // Payment URL generation (FORM_SERVICE)
      const formService = process.env.FORM_SERVICE;
      const txId = existingPayload?.context?.transaction_id || sessionData?.transaction_id;
      if (formService && txId) {
        missedEmiPayment.url = `${formService}/forms/${sessionData.domain}/payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${txId}`;
      }

      rebuiltPayments.push(missedEmiPayment);
      console.log('Updated MISSED_EMI_PAYMENT payment with label, unique ID, date range, and amount');
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

    // 3. Add installments (from session, with updated statuses for missed EMI)
    if (installmentsFromSession.length > 0) {
      console.log(`Found ${installmentsFromSession.length} installments from session data for missed EMI`);

      // Update installment statuses for missed EMI scenario
      // First installment: DELAYED (the missed one), rest: NOT-PAID
      const updatedInstallments = installmentsFromSession.map((installment: any, index: number) => {
        let status = 'NOT-PAID';
        if (index === 0) {
          status = 'DELAYED'; // First installment is delayed (the missed EMI)
        }
        return {
          ...installment,
          status
        };
      });

      rebuiltPayments.push(...updatedInstallments);
      console.log('Merged installments with updated statuses (1st DELAYED, rest NOT-PAID)');
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
    order.items[0].price = sessionData.order.items[0].price
    if (selectedItem?.id) order.items[0].id = selectedItem.id;
    else if (!order.items[0].id || String(order.items[0].id).startsWith("ITEM_ID_PERSONAL_LOAN") || String(order.items[0].id).startsWith("ITEM_ID_GOLD_LOAN")) {
      order.items[0].id = `personal_loan_item_${randomUUID()}`;
    }
  }

  // quote.id
  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    order.quote.price = sessionData.order.quote.price;

    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
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


