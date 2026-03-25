/**
 * On Init_2 Generator for FIS12 Personal Loan
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

  // Update form URL for kyc_verification_status (preserve existing structure)
  console.log("🔍 Checking payload structure for verification_status_e_mandate:");
  console.log("  - Has items?", !!existingPayload.message?.order?.items);
  console.log("  - Has items[0]?", !!existingPayload.message?.order?.items?.[0]);
  console.log("  - Has xinput.form?", !!existingPayload.message?.order?.items?.[0]?.xinput?.form);

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const uniqueFormId = `verification_status_${randomUUID()}`;
    existingPayload.message.order.items[0].xinput.form.id = uniqueFormId;
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/verification_status?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    console.log("✅ [on_init_2] form_id:", uniqueFormId, "URL:", url);
    existingPayload.message.order.items[0].xinput.form.url = url;
  }


  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }
  // ========== CARRY FORWARD PAYMENT IDs FROM on_init_1 ==========
  // on_init_1 generated unique IDs for installments + ON_ORDER payment.
  // Stamp those session IDs onto this response's payments to keep them consistent.
  const sessionPayments: any[] = sessionData.payments || sessionData.order?.payments || [];
  if (Array.isArray(existingPayload.message?.order?.payments) && sessionPayments.length > 0) {
    const sessionIdMap = new Map<string, string>();
    sessionPayments.forEach((p: any) => {
      if (p?.id && p.id.includes('-')) {
        const key = `${p.type}::${p.time?.label || ''}`;
        sessionIdMap.set(key, p.id);
      }
    });
    existingPayload.message.order.payments.forEach((payment: any) => {
      const key = `${payment.type}::${payment.time?.label || ''}`;
      if (sessionIdMap.has(key) && (!payment.id || !payment.id.includes('-'))) {
        payment.id = sessionIdMap.get(key)!;
        console.log(`[on_init_2] Stamped session payment ID: ${payment.id}`);
      }
    });
  }
  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}
