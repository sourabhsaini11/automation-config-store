

import { resolveSessionIds } from '../id-helper';

export async function updateDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Gold Loan Update generator - Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    order_id: sessionData.order_id,
    update_target: sessionData.update_target,
    flow_id: sessionData.flow_id,
    user_inputs: sessionData.user_inputs
  });

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
   existingPayload.context.message_id = crypto.randomUUID();
  }

  const ids = resolveSessionIds(sessionData);

  // Load order_id into order.id (structure uses order.id)
  if (ids.orderId && existingPayload.message) {
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = ids.orderId;
  }

  // Update provider.id from session data
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
  }

  // Carry forward item.id and parent_item_id from session data
  if (ids.childItemId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = ids.childItemId;
    if (ids.parentItemId) {
      existingPayload.message.order.items[0].parent_item_id = ids.parentItemId;
    }
    if (ids.categoryIds?.length) {
      existingPayload.message.order.items[0].category_ids = ids.categoryIds;
    }
    if (ids.fulfillmentId) {
      existingPayload.message.order.items[0].fulfillment_ids = [ids.fulfillmentId];
    }
  }

  // Carry forward fulfillment.id from session data
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Carry forward quote.id from session data
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // Load update_target from session data
  if (sessionData.update_target && existingPayload.message) {
    existingPayload.message.update_target = sessionData.update_target;
  }

  return existingPayload;
}