/**
 * Select Generator for FIS12 Gold Loan
 * 
 * Logic:
 * 1. Update context with current timestamp
 * 2. Update transaction_id and message_id from session data (carry-forward mapping)
 * 3. Update form_response with status and submission_id (preserve existing structure)
 */

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Select generator - Available session data:", {
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

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Update provider.id if available from session data (carry-forward from on_search)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from on_search)
  if (sessionData.items && Array.isArray(sessionData.items) && sessionData.items.length > 0) {
    const selectedItem = sessionData.items[0];
    if (existingPayload.message?.order?.items?.[0]) {
      existingPayload.message.order.items[0].id = selectedItem.id;
      console.log("Updated item.id:", selectedItem.id);
    }
  }

  // Update form_response with status and submission_id (preserve existing structure)
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
  //   existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
  //   existingPayload.message.order.items[0].xinput.form_response.submission_id = `F01_SUBMISSION_ID_${Date.now()}`;
  //   console.log("Updated form_response with status and submission_id");
  // }

  // Ensure xinput.form.id matches the one from on_search (avoid hardcoding F01)
  const formId = sessionData.items[0]?.xinput?.form?.id || sessionData?.form_id;
  if (formId && existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = formId;
  }

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    const submission_id = sessionData?.form_data?.personal_loan_information_form?.form_submission_id;

    if (submission_id) {
      // Use the actual UUID submission_id from form service (not a static placeholder)
      existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
      existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
      console.log("Updated form_response with submission_id from form service:", submission_id);
    } else {
      console.warn("⚠️ No submission_id found for personal_loan_information_form - form may not have been submitted yet");
    }
  }

  return existingPayload;
} 