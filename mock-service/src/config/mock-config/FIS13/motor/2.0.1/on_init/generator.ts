
import { resolveSessionIds } from '../id-helper';

export async function onInitDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_init", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  const ids = resolveSessionIds(sessionData);

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as init (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from init:", sessionData.message_id);
  }

  // Update provider.id from resolved IDs
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
    console.log("Updated provider.id:", ids.providerId);
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
    if (ids.fulfillmentId) {
      existingPayload.message.order.items[0].fulfillment_ids = [ids.fulfillmentId];
    }
  }

  // Generate dynamic fulfillment ID (BPP assigns fulfillment ID in on_init)
  if (existingPayload.message?.order?.fulfillments?.[0]) {
    const newFulfillmentId = crypto.randomUUID();
    existingPayload.message.order.fulfillments[0].id = newFulfillmentId;
    sessionData.fulfillment_id = newFulfillmentId;
    // Sync items fulfillment_ids with the new fulfillment ID
    if (existingPayload.message?.order?.items?.[0]) {
      existingPayload.message.order.items[0].fulfillment_ids = [newFulfillmentId];
    }
  }

  // Apply quote.id from resolved IDs
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // If flow is pre-order, set payment type to PRE-ORDER
  if (sessionData.flow_id === 'Motor_Insurance_Application(PRE-ORDER)' && existingPayload.message?.order?.payments?.[0]) {
    existingPayload.message.order.payments[0].type = "PRE-ORDER";
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
    console.log("sessionData", sessionData);
  }
  
  if (sessionData.customer_email && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.email = sessionData.customer_email;
    console.log("Updated customer email:", sessionData.customer_email);
  }
  //  Update form URLs for items with session data (preserve existing structure)

  // Generate dynamic form ID and URL
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = crypto.randomUUID();
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/vehicle_nominee_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
    console.log("Generated dynamic form ID:", existingPayload.message.order.items[0].xinput.form.id);
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

  // Sync payment amount with total_price from session data (saved in on_select)
  if (existingPayload.message?.order?.payments?.[0]?.params) {
    const sessionTotalPrice = Array.isArray(sessionData.total_price) ? sessionData.total_price[0] : sessionData.total_price;
    if (sessionTotalPrice) {
      existingPayload.message.order.payments[0].params.amount = String(sessionTotalPrice);
      console.log("Updated payment amount from session total_price:", sessionTotalPrice);
    }
  }

    // Handle offline_contract: when true, set BFF to 0 and remove SETTLEMENT_AMOUNT/SETTLEMENT_BASIS
    if (existingPayload.message?.order?.payments?.[0]?.tags) {
      const paymentTags = existingPayload.message.order.payments[0].tags;
      const settlementTermsTag = paymentTags.find((t: any) => t.descriptor?.code === 'SETTLEMENT_TERMS');
      const offlineContract = settlementTermsTag?.list?.find((item: any) => item.descriptor?.code === 'OFFLINE_CONTRACT');
      if (offlineContract?.value === 'true') {
        const bffTag = paymentTags.find((t: any) => t.descriptor?.code === 'BUYER_FINDER_FEES');
        if (bffTag?.list) {
          bffTag.list.forEach((item: any) => {
            if (item.descriptor?.code === 'BUYER_FINDER_FEES_PERCENTAGE') item.value = '0';
            if (item.descriptor?.code === 'BUYER_FINDER_FEES_AMOUNT') item.value = '0';
          });
        }
        sessionData.settlement_amount = '0';
        if (settlementTermsTag?.list) {
          settlementTermsTag.list = settlementTermsTag.list.filter(
            (item: any) => item.descriptor?.code !== 'SETTLEMENT_AMOUNT' && item.descriptor?.code !== 'SETTLEMENT_BASIS'
          );
        }
      }
    }

  return existingPayload;
}
