export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  

  const submission_id = sessionData?.form_data?.verification_status?.form_submission_id || sessionData?.verification_status
  const form_status = sessionData?.form_data?.verification_status?.idType;


  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
  }
  
  // Update order ID from session data if available
  // if (sessionData.order_id) {
  //   existingPayload.message = existingPayload.message || {};
  //   existingPayload.message.order = existingPayload.message.order || {};
  //   existingPayload.message.order.id = sessionData.order_id;
  // }

  // Update provider information from session data (carry-forward from on_select_2)
  // if (sessionData.provider_id) {
  //   existingPayload.message = existingPayload.message || {};
  //   existingPayload.message.order = existingPayload.message.order || {};
  //   existingPayload.message.order.provider = existingPayload.message.order.provider || {};
  //   existingPayload.message.order.provider.id = sessionData.provider_id;
  // }
  
  // Update item.id from session data (carry-forward from on_select_2)
  // const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  // if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
  //   existingPayload.message.order.items[0].id = selectedItem.id;
  //   console.log("Updated item.id:", selectedItem.id);
  // }
  
  
  // Update form ID to FO3 (carry-forward from on_select_2)
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
  //   existingPayload.message.order.items[0].xinput.form.id = "FO3";
  //   console.log("Updated form ID to FO3");
  // }

  // Update form response status - on_status_unsolicited uses APPROVED status
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
  //   const formResponse = existingPayload.message.order.items[0].xinput.form_response;
   
  //   // Update submission ID if provided
  //   if (sessionData.submission_id) {
  //     formResponse.submission_id = sessionData.submission_id;
  //   }
  // }

  // Update customer name in fulfillments if available from session data
  // if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
  //   existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
  //   console.log("Updated customer name:", sessionData.customer_name);
  // }



 

  // Carry forward provider.id from session data
  if (sessionData.selected_provider?.id || sessionData.provider_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = sessionData.selected_provider?.id || sessionData.provider_id;
  }

  // Carry forward child item ID and parent_item_id from session data
  const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (childItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = childItem.id;
    if (childItem.parent_item_id) {
      existingPayload.message.order.items[0].parent_item_id = childItem.parent_item_id;
    }

  }

  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Carry forward fulfillment.id from session data
  if (fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = fulfillmentId;
  }

  // Carry forward quote.id from session data
  if (sessionData.quote_id && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id;
  }

if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.form_id || "F04";
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
