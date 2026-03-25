/**
 * Init Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp and correct action
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward mapping)
 * 4. Update form_response with status and submission_id (preserve existing structure)
 */

export async function initDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for init", sessionData);
  
  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "init";
  }

  const submission_id = sessionData?.form_data?.kyc_verification_status?.form_submission_id;
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new UUID message_id for init (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
    console.log("Generated new UUID message_id for init:", existingPayload.context.message_id);
  }
  
  // Update provider.id if available from session data (carry-forward from previous flows)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  
  // Update item.id if available from session data (carry-forward from previous flows)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }
  
  // Update form ID from session data (carry-forward from previous flows)
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    // Use form ID from session data or default to FO3 (from on_select_2/on_status_unsolicited)
    const formId = sessionData.form_id || "FO3";
    existingPayload.message.order.items[0].xinput.form.id = formId;
    console.log("Updated form ID:", formId);
  }
  
  // Update form_response with status and submission_id (preserve existing structure)
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
    if (submission_id) {
      existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
    } else {
      existingPayload.message.order.items[0].xinput.form_response.submission_id = `F03_SUBMISSION_ID_${Date.now()}`;
    }
    console.log("Updated form_response with status and submission_id");
  }

  return existingPayload;
}
