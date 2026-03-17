import { randomUUID } from "crypto";
import { resolveSessionIds, applyResolvedIdsToPayload } from '../id-helper';

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

  const ids = resolveSessionIds(sessionData);

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

   if (sessionData.message_id && existingPayload.context) {
      existingPayload.context.message_id = randomUUID();
    }

  // Load order_id into order.id (structure uses order.id)
  if (ids.orderId && existingPayload.message) {
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = ids.orderId;
  }

  // Apply all resolved IDs (provider, items, fulfillments, quote) to payload
  applyResolvedIdsToPayload(existingPayload, ids);

  return existingPayload;
} 