/**
 * On Update Personal Loan Fulfillment Generator for FIS12
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data
 * 3. Map quote.id, provider.id, order.id, and item.id from session data
 * 4. Handle three payment types: MISSED_EMI_PAYMENT, FORECLOSURE, PRE_PART_PAYMENT
 * 5. Set time ranges based on context timestamp for MISSED_EMI_PAYMENT
 * 6. Update payment statuses based on flow:
 *    - MISSED_EMI_PAYMENT: Mark delayed installment as PAID
 *    - FORECLOSURE: Mark all installments as PAID
 *    - PRE_PART_PAYMENT: Add deferred installments with PAID status for some
 */

import { randomUUID } from 'crypto';
import {
  upsertBreakup,
  generateTimeRangeFromContext,
  updateForeclosurePaymentStatus,
  updateMissedEMIStatus,
  updatePrePartPaymentStatus
} from '../generator-utils';
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onUpdatePersonalLoanFulfillmentGenerator(existingPayload: any, sessionData: any) {
  try {
    console.log("=== On Update Personal Loan Fulfillment Generator Start ===");
    console.log("Session data keys:", Object.keys(sessionData || {}));

    // Validate required data
    if (!existingPayload) {
      throw new Error("existingPayload is required");
    }
    if (!sessionData) {
      throw new Error("sessionData is required");
    }

    // Update context timestamp
    if (existingPayload.context) {
      existingPayload.context.timestamp = new Date().toISOString();
    } else {
      console.warn("⚠️ existingPayload.context is missing");
    }

    // Update transaction_id from session data
    if (sessionData.transaction_id && existingPayload.context) {
      existingPayload.context.transaction_id = sessionData.transaction_id;
      console.log("✓ Updated transaction_id:", sessionData.transaction_id);
    } else {
      console.warn("⚠️ transaction_id not found in session data");
    }

    // Generate new message_id for unsolicited update
    if (existingPayload.context) {
      existingPayload.context.message_id = randomUUID();
      console.log("✓ Generated new UUID for personal loan fulfillment update:", existingPayload.context.message_id);
    }

    // Load order from session data
    if (existingPayload.message) {
      const order = existingPayload.message.order || (existingPayload.message.order = {});

      // Map order.id from session data (carry-forward from confirm)
      if (sessionData.order_id) {
        order.id = sessionData.order_id;
        console.log("✓ Updated order.id:", sessionData.order_id);
      } else {
        console.warn("⚠️ order_id not found in session data");
      }

      // Map provider.id from session data (carry-forward from confirm)
      if (sessionData.selected_provider?.id) {
        if (order.provider) {
          order.provider.id = sessionData.selected_provider.id;
          console.log("✓ Updated provider.id:", sessionData.selected_provider.id);
        } else {
          console.warn("⚠️ order.provider structure missing in payload");
        }
      } else {
        console.warn("⚠️ selected_provider.id not found in session data");
      }

      // Map item.id from session data (carry-forward from confirm)
      const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
      if (selectedItem?.id) {
        if (order.items?.[0]) {
          order.items[0].id = selectedItem.id;
          console.log("✓ Updated item.id:", selectedItem.id);
        } else {
          console.warn("⚠️ order.items[0] structure missing in payload");
        }
      } else {
        console.warn("⚠️ item.id not found in session data");
      }

      // Map quote.id from session data (carry-forward from confirm)
      // Try sessionData.quote_id first, fallback to order.quote.id from saved order object
      const quoteId = sessionData.quote_id || sessionData.order?.quote?.id;
      if (quoteId) {
        if (order.quote) {
          order.quote.id = quoteId;
          console.log("✓ Updated quote.id:", quoteId);
        } else {
          console.warn("⚠️ order.quote structure missing in payload");
        }
      } else {
        console.warn("⚠️ quote_id not found in session data (tried quote_id and order.quote.id)");
      }

      // Carry forward all payments from session (preserves installment IDs from on_init_1)
      const savedPayments = sessionData.payments || sessionData.order?.payments;
      if (Array.isArray(savedPayments) && savedPayments.length > 0) {
        order.payments = savedPayments.map((p: any) => ({ ...p })); // clone to avoid mutation
        console.log(`[on_update_personal_loan_fulfillment] ✅ Carried forward ${order.payments.length} payments from session`);
      } else {
        // Fallback: at minimum stamp payments[0].id from session if available
        const paymentId = sessionData.payment_id || sessionData.order?.payments?.[0]?.id;
        if (paymentId && order.payments?.[0]) {
          order.payments[0].id = paymentId;
          console.log('✓ Updated payment.id (fallback):', paymentId);
        }
      }
    } else {
      console.warn("⚠️ existingPayload.message is missing");
    }
    // Branch by update label
    const orderRef = existingPayload.message?.order || {};
    const label = sessionData.update_label
      || orderRef?.payments?.[0]?.time?.label
      || sessionData.user_inputs?.foreclosure_amount && 'FORECLOSURE'
      || sessionData.user_inputs?.missed_emi_amount && 'MISSED_EMI_PAYMENT'
      || sessionData.user_inputs?.part_payment_amount && 'PRE_PART_PAYMENT'
      || 'FORECLOSURE';

    // Ensure payments structure exists
    orderRef.payments = orderRef.payments || [{}];
    const firstPayment = orderRef.payments[0];
    firstPayment.time = firstPayment.time || {};


    if (label === 'MISSED_EMI_PAYMENT') {
      // Set payment params for missed EMI (matching on_confirm installment amount)
      firstPayment.params = firstPayment.params || {};
      firstPayment.params.amount = "46360"; // Matches INSTALLMENT_AMOUNT from on_confirm
      firstPayment.params.currency = "INR";

      // Set time range based on context timestamp
      const contextTimestamp = existingPayload.context?.timestamp || new Date().toISOString();
      firstPayment.time.range = generateTimeRangeFromContext(contextTimestamp);

      // Mark the specific delayed installment as PAID (based on current month)
      updateMissedEMIStatus(orderRef.payments, contextTimestamp);

      // Set payment URL using form service
      const missedEmiFormService = process.env.FORM_SERVICE;
      const missedEmiTxId = existingPayload.context?.transaction_id || sessionData.transaction_id;
      firstPayment.url = `${missedEmiFormService}/forms/${sessionData.domain}/payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${missedEmiTxId}`;
    }

    if (label === 'FORECLOSURE') {
      // Add foreclosure charges to quote.breakup
      upsertBreakup(orderRef, 'FORCLOSUER_CHARGES', '9536');

      // Calculate foreclosure amount: Outstanding Principal + Outstanding Interest + Foreclosure Charges
      const outstandingPrincipal = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_PRINCIPAL')?.price?.value || '139080';
      const outstandingInterest = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_INTEREST')?.price?.value || '0';
      const foreclosureCharges = '9536';
      const foreclosureAmount = String(parseInt(outstandingPrincipal) + parseInt(outstandingInterest) + parseInt(foreclosureCharges));

      // Set payment params for foreclosure
      firstPayment.params = firstPayment.params || {};
      firstPayment.params.amount = foreclosureAmount;
      firstPayment.params.currency = "INR";
      const foreclosureContextTimestamp = existingPayload.context?.timestamp || new Date().toISOString();

      // Mark unpaid installments as DEFERRED (already paid ones stay PAID)
      updateForeclosurePaymentStatus(orderRef.payments);
      // Update time ranges for installments
      orderRef.payments.forEach((payment: any) => {
        if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT') {
          payment.time.range = generateTimeRangeFromContext(foreclosureContextTimestamp);
        }
      });
      if (firstPayment.time.range) delete firstPayment.time.range;

      // Set payment URL using form service
      const foreclosureFormService = process.env.FORM_SERVICE;
      const foreclosureTxId = existingPayload.context?.transaction_id || sessionData.transaction_id;
      firstPayment.url = `${foreclosureFormService}/forms/${sessionData.domain}/payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${foreclosureTxId}`;
    }

    if (label === 'PRE_PART_PAYMENT') {
      // Add pre payment charge to quote.breakup
      upsertBreakup(orderRef, 'PRE_PAYMENT_CHARGE', '4500');

      // Set payment params for pre part payment (installment amount + pre payment charge)
      firstPayment.params = firstPayment.params || {};
      firstPayment.params.amount = "50860"; // 46360 (installment) + 4500 (pre payment charge)
      firstPayment.params.currency = "INR";

      // Update payment statuses: some PAID, some DEFERRED
      const prePartContextTimestamp = existingPayload.context?.timestamp || new Date().toISOString();
      updatePrePartPaymentStatus(orderRef.payments, prePartContextTimestamp);

      // Remove time range for pre part payment
      if (firstPayment.time.range) delete firstPayment.time.range;

      // Set payment URL using form service
      const prePartFormService = process.env.FORM_SERVICE;
      const prePartTxId = existingPayload.context?.transaction_id || sessionData.transaction_id;
      firstPayment.url = `${prePartFormService}/forms/${sessionData.domain}/payment_url_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${prePartTxId}`;
    }

    console.log("=== On Update Personal Loan Fulfillment Generator Complete ===");

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

  } catch (error: any) {
    console.error("❌ Error in on_update_personal_loan_fulfillment generator:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Session data:", JSON.stringify(sessionData, null, 2));
    throw new Error(`on_update_personal_loan_fulfillment generator failed: ${error.message}`);
  }
}
