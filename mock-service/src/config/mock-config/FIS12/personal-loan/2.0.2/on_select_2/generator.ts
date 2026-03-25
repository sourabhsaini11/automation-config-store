export async function onSelect2Generator(existingPayload: any, sessionData: any) {
  console.log("On Select2 generator - Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    selected_provider: !!sessionData.selected_provider,
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
  
  // Ensure provider is an object (not an array)
  if (Array.isArray(existingPayload.message?.order?.provider)) {
    // Convert array to object (take first element)
    existingPayload.message.order.provider = existingPayload.message.order.provider[0] || {};
  }

  // Update provider.id if available from session data (carry-forward from select_2)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from select_2)
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

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/loan_amount_adjustment_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    console.log("✅ URL for loan_amount_adjustment_form in on_select_2:", url);
    existingPayload.message.order.items[0].xinput.form.url = url;
    console.log("✅ Form URL successfully set in payload");
  } else {
    console.error("❌ FAILED: Payload structure doesn't match expected path for form URL!");
    console.log("Actual payload structure:", JSON.stringify(existingPayload.message?.order, null, 2));
  }

  console.log("session data on_select_2-->",sessionData)
  
  return existingPayload;
}

