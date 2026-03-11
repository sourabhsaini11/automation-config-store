import { randomUUID } from "crypto";


export async function updateDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Available session data:", {
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
      existingPayload.context.message_id = randomUUID();
    }
  
  // Load order_id into order.id (structure uses order.id)
  if (sessionData.order_id && existingPayload.message) {
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider.id from session data
  if ((sessionData.selected_provider?.id || sessionData.provider_id) && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider?.id || sessionData.provider_id;
  }

  // Carry forward item.id and parent_item_id from session data
  const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (childItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = childItem.id;
    if (childItem.parent_item_id) {
      existingPayload.message.order.items[0].parent_item_id = childItem.parent_item_id;
    }
  }

  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Carry forward fulfillment.id from session data
  if (fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = fulfillmentId;
  }

  // Carry forward quote.id from session data
  if (sessionData.quote_id && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id;
  }

  return existingPayload;
} 