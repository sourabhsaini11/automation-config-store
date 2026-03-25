/**
 * Confirm Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and correct action
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward mapping)
 * 4. Preserve existing structure from default.yaml
 */

export async function confirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for confirm0008080", sessionData);
  
  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "confirm";
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new UUID message_id for confirm (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
    console.log("Generated new UUID message_id for confirm:", existingPayload.context.message_id);
  }
  
  // Update provider.id if available from session data (carry-forward from previous flows)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  const submission_id = sessionData?.form_data?.kyc_verification_status?.form_submission_id;
  if(existingPayload.message?.order?.items?.[0]?.xinput?.form_response){
    existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
  } 
  // Update item.id if available from session data (carry-forward from previous flows)
  const selectedItem =Array.isArray(sessionData.selected_items) ? sessionData.selected_items[0] : undefined ;
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }
  
  console.log("existingPayload for confirm -----------", existingPayload);
  return existingPayload;
}
