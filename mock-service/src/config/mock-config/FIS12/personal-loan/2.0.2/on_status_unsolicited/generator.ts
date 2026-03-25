import { randomUUID } from "crypto";

export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
  }

  // Update order ID from session data if available
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider information from session data
  const resolvedProviderId = sessionData.provider_id || sessionData.selected_provider?.id;
  if (resolvedProviderId) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = resolvedProviderId;
    console.log("Updated provider.id:", resolvedProviderId);
  }

  // Update item.id from session data (carry-forward from on_select_2)

  if (existingPayload.message.order.items) {
    existingPayload.message.order.items = sessionData.order.items || existingPayload.message.order.items
  }
  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Carry forward payments from session data (preserves dynamically generated installment IDs)
  const savedPayments = sessionData.order?.payments || sessionData.payments;
  if (Array.isArray(savedPayments) && savedPayments.length > 0 && existingPayload.message?.order) {
    existingPayload.message.order.payments = savedPayments;
    console.log("Carried forward payments from session (installment IDs preserved)");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote = sessionData?.quote || existingPayload.message.order.quote
  }


  // Update loan amount in items if provided
  if (sessionData.loan_amount && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].price.value = sessionData.loan_amount;
  }

  // Set created_at and updated_at to current timestamp
  if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    existingPayload.message.order.created_at = sessionData.order.created_at;
    existingPayload.message.order.updated_at = now;
    console.log("Set order.created_at and order.updated_at to:", now);
  }

  return existingPayload;
}
