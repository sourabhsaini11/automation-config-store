import { resolveSessionIds } from '../id-helper';

export async function cancelGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();

  }

  const ids = resolveSessionIds(sessionData);

  // Update order_id from session data (saved from on_confirm)
  const orderId = ids.orderId || sessionData.order?.id;
  if (orderId && existingPayload.message) {
    existingPayload.message.order_id = orderId;
  }

  return existingPayload;
}
