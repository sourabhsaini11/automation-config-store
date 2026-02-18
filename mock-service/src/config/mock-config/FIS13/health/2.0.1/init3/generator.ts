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


    const submission_id = sessionData?.form_data?.nominee_details_form?.form_submission_id || sessionData?.nominee_details_form
  const form_status = sessionData?.form_data?.nominee_details_form?.idType;

  
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
  
  // Carry forward item.id from session data
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
  }

  // Carry forward fulfillment.id from session data
  if (sessionData.fullfillment_ids?.[0] && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = sessionData.fullfillment_ids[0];
  }

  // Carry forward quote.id from session data
  if (sessionData.quote_id && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id;
  }

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.form_id || "F07";
      item.xinput.form.id = formId;
      console.log("Updated form ID:", formId);
    }
    
    // Set form status and submission_id
    if (item.xinput) {
      // Create form_response if it doesn't exist
      if (!item.xinput.form_response) {
        item.xinput.form_response = {};
      }
      if (form_status) {
        item.xinput.form_response.status = form_status;
      }
      if (submission_id) {
        item.xinput.form_response.submission_id = submission_id;
      }
    }
  }
  return existingPayload;
}
