/**
 * On Confirm Generator for FIS12 Personal Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Generate order.id (first time order ID is created)
 * 4. Update provider.id and item.id from session data (carry-forward mapping)
 * 5. Update customer information in fulfillments from session data
 * 6. Carry forward payments from session and generate unique installment IDs
 */

import { randomUUID } from 'crypto';
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onConfirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_confirm", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as confirm (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from confirm:", sessionData.message_id);
  }

  // Generate order.id (first time order ID is created in the flow)
  if (existingPayload.message?.order) {
    existingPayload.message.order.id = `LOAN_ORDER_${Date.now()}_${sessionData.transaction_id?.slice(-8) || 'DEFAULT'}`;
    console.log("Generated order.id:", existingPayload.message.order.id);
  }

  // Update provider.id if available from session data (carry-forward from confirm)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from confirm)
  // const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  // if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
  //   existingPayload.message.order.items[0].id = selectedItem.id;
  //   existingPayload.message.order.items[0].price = selectedItem.price;

  //   console.log("Updated item.id:", selectedItem.id);
  // }

  const selectedItemId = Array.isArray(sessionData.selected_items_1)
    ? sessionData.selected_items_1?.[0]?.id
    : undefined;
  const selectedItem = (selectedItemId && Array.isArray(sessionData.items))
    ? sessionData.items.find((i: any) => i.id === selectedItemId)
    : sessionData.item || (Array.isArray(sessionData.items) ? (sessionData.items?.[1] ?? sessionData.items?.[0]) : undefined);

  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    existingPayload.message.order.items[0].price = selectedItem.price;
  }
  // // Update location_ids from session data (carry-forward from previous flows)
  // const selectedLocationId = sessionData.selected_location_id;
  // if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
  //   existingPayload.message.order.items[0].location_ids = [selectedLocationId];
  //   console.log("Updated location_ids:", selectedLocationId);
  // }

  // if (sessionData?.order?.items) {
  //   existingPayload.message.order.items = sessionData?.order?.items || existingPayload.message.order.items
  // }
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

  // Update fulfillment state to DISBURSED (loan has been confirmed and disbursed)
  if (existingPayload.message?.order?.fulfillments?.[0]?.state?.descriptor) {
    existingPayload.message.order.fulfillments[0].state.descriptor.name = "Loan Disbursed";
    console.log("Updated fulfillment state to DISBURSED");
  }

  // Update quote.id from session data
  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }

  // Carry forward payments — merge session IDs into payload payments.
  // on_init_3 only saves ON_ORDER payment (its own default), so session.payments
  // may be missing the installments that on_confirm/default.yaml defines.
  // Strategy: use the LONGER payments array as base, then stamp any pre-generated IDs from session.

  // Set created_at and updated_at to current timestamp
  if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    existingPayload.message.order.created_at = now;
    existingPayload.message.order.updated_at = now;
    console.log("Set order.created_at and order.updated_at to:", now);
  }
  //update payment for all init 
  const sessionPayments: any[] = sessionData.payments || sessionData.order?.payments || [];
  existingPayload.message.order.payments = sessionPayments
  // Dynamically inject SETTLEMENT_AMOUNT derived from BAP_TERMS fee data
  injectSettlementAmount(existingPayload, sessionData);

  return existingPayload;
}

