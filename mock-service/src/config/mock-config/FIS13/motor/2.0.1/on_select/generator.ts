

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
  // Generate dynamic child item ID and set parent_item_id from parent item in session
  const parentItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = crypto.randomUUID();
    if (parentItem?.id) {
      existingPayload.message.order.items[0].parent_item_id = parentItem.id;
    }

  }

  // Generate dynamic quote ID (replace hardcoded OFFER_ID/PROPOSAL_ID)
  if (existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = crypto.randomUUID();
  }

  // Generate dynamic form ID and URL
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = crypto.randomUUID();
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/manual_review_form_motor?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
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