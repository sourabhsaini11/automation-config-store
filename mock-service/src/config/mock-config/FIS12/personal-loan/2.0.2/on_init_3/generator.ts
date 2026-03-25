/**
 * On Init Generator for FIS12 Personal Loan
 *
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward mapping)
 * 4. Update customer name in fulfillments from session data
 * 5. Update form URL for loan_agreement_esign_form
 * 6. Generate unique payment/installment IDs — saved to session and carried forward unchanged
 *    to on_confirm, on_status, on_update so IDs stay consistent across the entire flow.
 */

import { randomUUID } from 'crypto';
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onInitDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_init_3", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as init (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from init:", sessionData.message_id);
  }

  // Update provider.id if available from session data (carry-forward from init)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from init)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update location_ids from session data (carry-forward from previous flows)
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Update customer contact information if available from session data
  if (sessionData.customer_phone && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.phone = sessionData.customer_phone;
    console.log("Updated customer phone:", sessionData.customer_phone);
  }

  if (sessionData.customer_email && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.email = sessionData.customer_email;
    console.log("Updated customer email:", sessionData.customer_email);
  }

  // Update form URL for loan_agreement_esign_form
  console.log("🔍 Checking payload structure for loan_agreement_esign_form in on_init_3:");
  console.log("  - Has items?", !!existingPayload.message?.order?.items);
  console.log("  - Has items[0]?", !!existingPayload.message?.order?.items?.[0]);
  console.log("  - Has xinput.form?", !!existingPayload.message?.order?.items?.[0]?.xinput?.form);

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const uniqueFormId = `esign_form_${randomUUID()}`;
    existingPayload.message.order.items[0].xinput.form.id = uniqueFormId;
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/loan_agreement_esign_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    console.log("✅ [on_init_3] form_id:", uniqueFormId, "URL:", url);
    existingPayload.message.order.items[0].xinput.form.url = url;
  } else {
    console.error("❌ [on_init_3] FAILED: no xinput.form in payload");
  }

  // ========== PAYMENT / INSTALLMENT ID GENERATION ==========
  // Generate unique IDs here in on_init_3 (first time in the flow).
  // Saved via save-data (payments key) → carried forward unchanged to on_confirm / on_status / on_update.
  if (Array.isArray(existingPayload.message?.order?.payments)) {
    const contextDate = existingPayload.context?.timestamp
      ? new Date(existingPayload.context.timestamp)
      : new Date();

    // First installment starts next month
    const base = new Date(Date.UTC(contextDate.getUTCFullYear(), contextDate.getUTCMonth() + 1, 1));

    const setMonthRange = (baseDate: Date, monthOffset: number) => {
      const start = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + monthOffset, 1));
      const end = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + monthOffset + 1, 0, 23, 59, 59, 999));
      return { start: start.toISOString(), end: end.toISOString() };
    };

    let installmentIndex = 0;
    let installmentCounter = 1;

    existingPayload.message.order.payments.forEach((payment: any) => {
      // Update installment date ranges
      if (payment?.type === "POST_FULFILLMENT" && payment?.time?.range) {
        const range = setMonthRange(base, installmentIndex);
        payment.time.range.start = range.start;
        payment.time.range.end = range.end;
        installmentIndex += 1;
        console.log(`Updated installment #${installmentIndex} range:`, range);
      }

      // Only generate ID if not already uniquely set (contains both _ and -)
      if (payment.id && payment.id.includes('_') && payment.id.includes('-')) {
        return; // already has a UUID-based ID
      }

      // Generate unique IDs based on payment type
      if (payment.type === 'POST_FULFILLMENT' && payment.time?.label === 'INSTALLMENT') {
        payment.id = `installment_${installmentCounter}_${randomUUID()}`;
        console.log(`Generated installment ID: ${payment.id}`);
        installmentCounter++;
      } else if (payment.type === 'ON_ORDER') {
        payment.id = sessionData.payments[0].id;
        console.log(`Generated on-order payment ID: ${payment.id}`);
      } else if (payment.time?.label === 'MISSED_EMI_PAYMENT') {
        payment.id = `missed_emi_${randomUUID()}`;
      } else if (payment.time?.label === 'PRE_PART_PAYMENT') {
        payment.id = `pre_part_${randomUUID()}`;
      } else if (payment.time?.label === 'FORECLOSURE') {
        payment.id = `foreclosure_${randomUUID()}`;
      } else if (!payment.id) {
        payment.id = `payment_${randomUUID()}`;
        console.log(`Generated generic payment ID: ${payment.id}`);
      }
    });

    console.log("✅ on_init_3: Payment/installment IDs generated — carried forward via session payments key");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }
  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}
