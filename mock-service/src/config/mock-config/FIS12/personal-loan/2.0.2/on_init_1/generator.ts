/**
 * On Init_1 Generator for FIS12 Personal Loan
 */
import { randomUUID } from 'crypto';
import { injectSettlementAmount } from '../utils/settlement-utils';


export async function onInitDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_init", sessionData);

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

  // Update form URL for manadate_details_form (preserve existing structure)
  console.log("🔍 Checking payload structure for manadate_details_form:");
  console.log("  - Has items?", !!existingPayload.message?.order?.items);
  console.log("  - Has items[0]?", !!existingPayload.message?.order?.items?.[0]);
  console.log("  - Has xinput.form?", !!existingPayload.message?.order?.items?.[0]?.xinput?.form);

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const uniqueFormId = `manadate_details_${randomUUID()}`;
    existingPayload.message.order.items[0].xinput.form.id = uniqueFormId;
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/manadate_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    console.log("✅ [on_init_1] form_id:", uniqueFormId, "URL:", url);
    existingPayload.message.order.items[0].xinput.form.url = url;
  } else {
    console.error("❌ [on_init_1] FAILED: no xinput.form in payload");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }
  // ========== GENERATE UNIQUE PAYMENT IDs (first time in flow) ==========
  // on_init_1 is where the payment plan is first established.
  // Generate unique IDs now so they propagate consistently through on_init_2, on_init_3,
  // confirm, on_confirm, on_status, and all on_update flows.
  if (Array.isArray(existingPayload.message?.order?.payments)) {
    let installCounter = 1;
    existingPayload.message.order.payments.forEach((payment: any) => {
      // Only generate if it has a static placeholder ID
      if (!payment.id || payment.id === 'PAYMENT_ID_PERSONAL_LOAN' || payment.id === 'PAYMENT_ID_GOLD_LOAN' || !payment.id.includes('-')) {
        if (payment.type === 'POST_FULFILLMENT' && payment.time?.label === 'INSTALLMENT') {
          payment.id = `installment_${installCounter}_${randomUUID()}`;
          console.log(`[on_init_1] Generated installment payment ID: ${payment.id}`);
          installCounter++;
        } else if (payment.type === 'ON_ORDER') {
          payment.id = `on_order_${randomUUID()}`;
          console.log(`[on_init_1] Generated ON_ORDER payment ID: ${payment.id}`);
        } else if (payment.type === 'POST_FULFILLMENT') {
          payment.id = `payment_${randomUUID()}`;
          console.log(`[on_init_1] Generated payment ID: ${payment.id}`);
        }
      }
    });
    console.log(`[on_init_1] ✅ Payment IDs generated for ${existingPayload.message.order.payments.length} payments`);
  }

  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}
