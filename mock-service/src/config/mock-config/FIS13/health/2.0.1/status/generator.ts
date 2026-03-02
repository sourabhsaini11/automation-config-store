export async function statusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for status", sessionData);

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

 if (sessionData.message_id && existingPayload.context) {
   existingPayload.context.message_id = crypto.randomUUID();
  }

  if (existingPayload.context?.transaction_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.ref_id = existingPayload.context.transaction_id;
    delete existingPayload.message.transaction_id;
  } 
  

  return existingPayload;
}
