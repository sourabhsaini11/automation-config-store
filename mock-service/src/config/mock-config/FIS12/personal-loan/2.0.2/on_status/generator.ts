export async function onStatusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }


  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  if (sessionData.order) {
    existingPayload.message.order = sessionData.order
  }

  if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    existingPayload.message.order.updated_at = now;
    console.log("Set order.created_at and order.updated_at to:", now);
  }
  return existingPayload;
}
