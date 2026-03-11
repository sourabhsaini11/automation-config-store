

export async function onInitDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_init", sessionData);
  
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Use the same message_id as init (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from init:", sessionData.message_id);
  }
  
  // Update provider.id if available from session data (carry-forward from init)
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

  }

  // Generate dynamic fulfillment ID (BPP assigns fulfillment ID in on_init)
  if (existingPayload.message?.order?.fulfillments?.[0]) {
    const dynamicFulfillmentId = crypto.randomUUID();
    existingPayload.message.order.fulfillments[0].id = dynamicFulfillmentId;

  }

  // Carry forward quote.id from session data
  if ((sessionData.quote_id || sessionData.quote?.id) && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id || sessionData.quote?.id;
  }

  // If flow is pre-order, set payment type to PRE-ORDER
  const preOrderFlows = ['Health_Insurance_Application(PRE-ORDER-Individual)', 'Health_Insurance_Application(PRE-ORDER-Family)'];
  if (preOrderFlows.includes(sessionData.flow_id) && existingPayload.message?.order?.payments?.[0]) {
    existingPayload.message.order.payments[0].type = "PRE-ORDER";
  }

  // Update quote breakup item references with dynamic child item ID
  if (existingPayload.message?.order?.quote?.breakup && childItem?.id) {
    existingPayload.message.order.quote.breakup.forEach((b: any) => {
      if (b.item?.id && b.title !== 'ADD_ONS') b.item.id = childItem.id;
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

  // Update form URLs and generate dynamic form IDs for items
  if (existingPayload.message?.order?.items) {
    existingPayload.message.order.items = existingPayload.message.order.items.map((item: any) => {
      if (item.xinput?.form) {
        item.xinput.form.id = crypto.randomUUID();
        const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/Proposer_Details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
        console.log("Form URL generated:", url, "Form ID:", item.xinput.form.id);
        item.xinput.form.url = url;
      }
      return item;
    });
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
    // Sync payment amount with calculated quote price
    if (existingPayload.message?.order?.payments?.[0]?.params) {
      existingPayload.message.order.payments[0].params.amount = String(totalPrice);
    }
  }

  return existingPayload;
}
