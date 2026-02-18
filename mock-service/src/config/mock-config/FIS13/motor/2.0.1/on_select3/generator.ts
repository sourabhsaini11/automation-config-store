

export async function onSelectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("On Select generator - Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    quote: !!sessionData.quote,
    items: !!sessionData.items
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
  
  // Update provider.id if available from session data (carry-forward from select)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  
  // Update item.id if available from session data (carry-forward from select)
  // if (sessionData.items && Array.isArray(sessionData.items) && sessionData.items.length > 0) {
  //   const selectedItem = sessionData.items[0];
  //   if (existingPayload.message?.order?.items?.[0]) {
  //     existingPayload.message.order.items[0].id = selectedItem.id;
  //     console.log("Updated item.id:", selectedItem.id);
  //   }
  // }
  // Carry forward item.id from session data
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
  }

  // Carry forward fulfillment.id from session data
  if (sessionData.fullfillment_ids?.[0] && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = sessionData.fullfillment_ids[0];
  }

  // Generate dynamic quote ID (replace hardcoded OFFER_ID/PROPOSAL_ID)
  if (existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = crypto.randomUUID();
  }

 if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/kyc_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
  }

  return existingPayload;
} 