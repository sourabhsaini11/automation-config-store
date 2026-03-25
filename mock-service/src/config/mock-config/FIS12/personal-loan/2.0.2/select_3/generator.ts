/**
 * Select2 Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update provider.id and item.id from session data (carry-forward mapping)
 * 4. Update form_response with status and submission_id (preserve existing structure)
 */

import { randomUUID } from 'crypto';

export async function select2Generator(existingPayload: any, sessionData: any) {
  console.log("Select2 generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("existing payloa-->",JSON.stringify(existingPayload))
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate a new message_id as UUID
  if (existingPayload.context) {
    existingPayload.context.message_id = randomUUID();
  }
  
  // Update provider.id if available from session data (carry-forward from on_search)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  
  // Update item.id if available from session data (carry-forward from on_search)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }
  
  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }
  
  // Update form_response with status and submission_id (preserve existing structure)
  const submission_id = sessionData?.form_data?.loan_amount_adjustment_form?.form_submission_id;

  console.log("checking form data", sessionData.form_data.consumer_information_form)

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
    if (submission_id) {
      existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
    } else {
      existingPayload.message.order.items[0].xinput.form_response.submission_id = `F01_SUBMISSION_ID_${Date.now()}`;
    }
    console.log("Updated form_response with status and submission_id");
  }
  
  return existingPayload;
}

