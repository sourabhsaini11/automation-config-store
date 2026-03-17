import { resolveSessionIds } from '../id-helper';

export async function onConfirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_confirm", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  const ids = resolveSessionIds(sessionData);

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as confirm (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from confirm:", sessionData.message_id);
  }


  // Set created_at and updated_at to current date only if they exist in the payload
  if (existingPayload.message?.order) {
     if (existingPayload.message.order.created_at) {
         delete existingPayload.message.order.created_at;
    }
    const now = new Date().toISOString();
      existingPayload.message.order.created_at = now;
      existingPayload.message.order.updated_at = now;
  }

  // Generate dynamic order ID
  if (existingPayload.message?.order) {
    const newOrderId = crypto.randomUUID();
    existingPayload.message.order.id = newOrderId;
    sessionData.order_id = newOrderId;
  }

  // Update provider.id from resolved IDs
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
  }

  // Apply child item ID and parent_item_id from resolved IDs
  if (ids.childItemId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = ids.childItemId;
    if (ids.parentItemId) {
      existingPayload.message.order.items[0].parent_item_id = ids.parentItemId;
    }
    if (ids.categoryIds?.length) {
      existingPayload.message.order.items[0].category_ids = ids.categoryIds;
    }
    if (ids.fulfillmentId && existingPayload.message.order.items[0].fulfillment_ids) {
      existingPayload.message.order.items[0].fulfillment_ids = [ids.fulfillmentId];
    }
    console.log("Updated item.id:", ids.childItemId, "parent_item_id:", ids.parentItemId);
  }

  // Apply fulfillment ID from resolved IDs
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Apply quote.id from resolved IDs
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // Update location_ids from session data (carry-forward from previous flows)
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }
  
  // Generate dynamic payment form URL
  if (existingPayload.message?.order?.payments?.[0]) {
    const paymentUrl = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/payment_form_motor?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.payments[0].url = paymentUrl;
    console.log("Generated payment form URL:", paymentUrl);
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
    if (existingPayload.message?.order?.payments) {
      existingPayload.message.order.payments[0].params.amount = String(totalPrice);
    }

    // Calculate and update SETTLEMENT_AMOUNT dynamically
    if (existingPayload.message?.order?.payments?.[0]?.tags) {
      let buyerFeeType = 'percent-annualized';
      let buyerFeePercentage = 0;
      let buyerFeeAmount = 0;
      // Unwrap payment_tags from JSONPath array wrapper: [[tag1,tag2]] → [tag1,tag2]
      const paymentTags = Array.isArray(sessionData.payment_tags?.[0]) ? sessionData.payment_tags[0] : sessionData.payment_tags;
      if (Array.isArray(paymentTags)) {
        const buyerFeesTag = paymentTags.find((t: any) => t.descriptor?.code === 'BUYER_FINDER_FEES');
        if (buyerFeesTag?.list) {
          buyerFeesTag.list.forEach((item: any) => {
            if (item.descriptor?.code === 'BUYER_FINDER_FEES_TYPE') buyerFeeType = item.value;
            if (item.descriptor?.code === 'BUYER_FINDER_FEES_PERCENTAGE') buyerFeePercentage = parseFloat(item.value) || 0;
            if (item.descriptor?.code === 'BUYER_FINDER_FEES_AMOUNT') buyerFeeAmount = parseFloat(item.value) || 0;
          });
        }
      }
      // Use total_price from session (saved in on_select); unwrap JSONPath array if needed
      const rawTotalPrice = Array.isArray(sessionData.total_price) ? sessionData.total_price[0] : sessionData.total_price;
      const settlementBasePrice = parseFloat(rawTotalPrice) || totalPrice;
      const buyerFee = buyerFeeType === 'amount' ? buyerFeeAmount : (buyerFeePercentage / 100) * settlementBasePrice;
      // Unwrap collected_by from JSONPath array wrapper: ["BAP"] → "BAP"
      const collectedBy = (Array.isArray(sessionData.collected_by) ? sessionData.collected_by[0] : sessionData.collected_by) || existingPayload.message.order.payments[0].collected_by;
      const settlementAmount = sessionData.settlement_amount
        ? parseFloat(sessionData.settlement_amount)
        : (collectedBy === 'BAP' ? (settlementBasePrice - buyerFee) : buyerFee);
      // Save settlement_amount to session for downstream generators
      sessionData.settlement_amount = String(Math.round(settlementAmount * 100) / 100);
      existingPayload.message.order.payments[0].tags.forEach((tag: any) => {
        if (tag.descriptor?.code === 'SETTLEMENT_TERMS' && tag.list) {
          tag.list.forEach((listItem: any) => {
            if (listItem.descriptor?.code === 'SETTLEMENT_AMOUNT') {
              listItem.value = String(Math.round(settlementAmount * 100) / 100);
            }
          });
        }
      });
    }
  }

  return existingPayload;
}
