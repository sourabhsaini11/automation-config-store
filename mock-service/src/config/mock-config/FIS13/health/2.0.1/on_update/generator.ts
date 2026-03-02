
export async function onUpdateDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  
    // Setupdated_at to current date
   if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    if (existingPayload.message.order.updated_at) {
      existingPayload.message.order.updated_at = now;
      existingPayload.message.order.created_at = sessionData.created_at;
    }
  }
  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Map order.id from session data (carry-forward from confirm)
    if (sessionData.order_id) {
      order.id = sessionData.order_id;
    }

    // Map provider.id from session data (carry-forward from confirm)
    if (sessionData.selected_provider?.id && order.provider) {
      order.provider.id = sessionData.selected_provider.id;
    }

    // Map item.id and parent_item_id from session data
    const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (childItem?.id && order.items?.[0]) {
      order.items[0].id = childItem.id;
      if (childItem.parent_item_id) {
        order.items[0].parent_item_id = childItem.parent_item_id;
      }
    }

    // Map quote.id from session data (carry-forward from confirm)
    if (sessionData.quote_id && order.quote) {
      order.quote.id = sessionData.quote_id;
    }

    // Map fulfillment.id from session data
    if (fulfillmentId && order.fulfillments?.[0]) {
      order.fulfillments[0].id = fulfillmentId;
    }
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

  // Update ADD_ONS entries in quote breakup with dynamic add-on IDs from session
  if (existingPayload.message?.order?.quote?.breakup) {
    // Remove existing hardcoded ADD_ONS entries
    existingPayload.message.order.quote.breakup = existingPayload.message.order.quote.breakup.filter(
      (b: any) => b.title !== 'ADD_ONS'
    );
    // Add back ADD_ONS entries with dynamic IDs and prices if add-ons are selected
    const selectedAddOns = sessionData.user_selected_add_ons;
    if (Array.isArray(selectedAddOns) && selectedAddOns.length > 0) {
      selectedAddOns.forEach((addon: any) => {
        existingPayload.message.order.quote.breakup.push({
          title: 'ADD_ONS',
          item: {
            id: addon.id,
          },
          price: addon.price || { value: "0", currency: "INR" }
        });
      });
    }
    // Recalculate total quote price from all breakup items
    const totalPrice = existingPayload.message.order.quote.breakup.reduce(
      (sum: number, b: any) => sum + (parseFloat(b.price?.value) || 0), 0
    );
    if (existingPayload.message.order.quote.price) {
      existingPayload.message.order.quote.price.value = String(totalPrice);
    }
  }

  return existingPayload;
}
