
export async function onConfirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_confirm", sessionData);
  
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Use the same message_id as confirm (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from confirm:", sessionData.message_id);
  }

  // Generate dynamic order ID
  if (existingPayload.message?.order) {
    existingPayload.message.order.id = crypto.randomUUID();

  }

  // Set created_at and updated_at to current date
   if (existingPayload.message?.order) {
     if (existingPayload.message.order.created_at) {
         delete existingPayload.message.order.created_at;
    }
    const now = new Date().toISOString();
      existingPayload.message.order.created_at = now;
      existingPayload.message.order.updated_at = now;
  }
 
  
  
 
  
  // Update provider.id if available from session data (carry-forward from confirm)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
  }

  // Carry forward child item ID and parent_item_id from session
  const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (childItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = childItem.id;
    if (childItem.parent_item_id) {
      existingPayload.message.order.items[0].parent_item_id = childItem.parent_item_id;
    }

  }

  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Carry forward fulfillment.id from session data (dynamically generated in on_init)
  if (fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = fulfillmentId;

  }

  // Update fulfillment_ids reference in items if present
  if (existingPayload.message?.order?.items?.[0]?.fulfillment_ids && fulfillmentId) {
    existingPayload.message.order.items[0].fulfillment_ids = [fulfillmentId];
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
  }

  // Update PROPOSAL_ID tag value with dynamic quote ID
  if (existingPayload.message?.order?.items?.[0]?.tags) {
    const quoteId = existingPayload.message.order.quote?.id;
    existingPayload.message.order.items[0].tags.forEach((tag: any) => {
      if (tag.list) {
        tag.list.forEach((listItem: any) => {
          if (listItem.descriptor?.code === "PROPOSAL_ID" && quoteId) {
            listItem.value = quoteId;
          }
        });
      }
    });
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }

  // Update customer contact information if available from session data
  if (sessionData.customer_phone && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.phone = sessionData.customer_phone;
    console.log("Updated customer phone:", sessionData.customer_phone);
  }

  if (sessionData.customer_email && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.email = sessionData.customer_email;
    console.log("Updated customer email:", sessionData.customer_email);
  }


  // Carry forward or remove add_ons based on user selection from select step
  if (existingPayload.message?.order?.items?.[0]) {
    const userAddOns = sessionData.user_selected_add_ons;
    if (Array.isArray(userAddOns) && userAddOns.length > 0) {
      existingPayload.message.order.items[0].add_ons = userAddOns;
    } else {
      delete existingPayload.message.order.items[0].add_ons;
    }
  }

  return existingPayload;
}
