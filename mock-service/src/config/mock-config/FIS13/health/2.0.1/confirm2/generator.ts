
export async function confirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for confirm", sessionData);
  
  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "confirm";
  }


   const submission_id = sessionData?.form_data?.consumer_information_form?.form_submission_id || sessionData?.consumer_information_form
  const form_status = sessionData?.form_data?.consumer_information_form?.idType;

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
  
  // Carry forward child item ID and parent_item_id from session
  const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (childItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = childItem.id;
    if (childItem.parent_item_id) {
      existingPayload.message.order.items[0].parent_item_id = childItem.parent_item_id;
    }
    console.log("Carried forward child item:", childItem.id, "parent:", childItem.parent_item_id);
  }

  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Carry forward fulfillment.id from session data (dynamically generated in on_init)
  if (fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = fulfillmentId;
    console.log("Carried forward fulfillment ID:", fulfillmentId);
  }

  // Carry forward quote.id from session data
  if ((sessionData.quote_id || sessionData.quote?.id) && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id || sessionData.quote?.id;
  }

  // Update quote breakup item references with dynamic child item ID
  if (existingPayload.message?.order?.quote?.breakup && childItem?.id) {
    existingPayload.message.order.quote.breakup.forEach((b: any) => {
      if (b.item?.id) b.item.id = childItem.id;
    });
    console.log("Updated quote breakup item.id with:", childItem.id);
  }

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.order?.items?.[0]?.xinput?.form?.id || sessionData.selected_items?.[0]?.xinput?.form?.id || sessionData.form_id || "F08";
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
