

import { resolveSessionIds, applyResolvedIdsToPayload, updateQuoteBreakupItemIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

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

  const ids = resolveSessionIds(sessionData);

  // Apply provider and child item + parent IDs
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
    console.log("Updated provider.id:", ids.providerId);
  }

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
    const dynamicFulfillmentId = crypto.randomUUID();
    existingPayload.message.order.fulfillments[0].id = dynamicFulfillmentId;
    // Save generated fulfillment_id back to sessionData for downstream generators
    sessionData.fulfillment_id = dynamicFulfillmentId;
    // Sync items fulfillment_ids with the new fulfillment ID
    if (existingPayload.message?.order?.items?.[0]) {
      existingPayload.message.order.items[0].fulfillment_ids = [dynamicFulfillmentId];
    }
  }

  // Apply quote ID
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // If flow is pre-order, set payment type to PRE-ORDER
  const preOrderFlows = ['Health_Insurance_Application(PRE-ORDER-Individual)', 'Health_Insurance_Application(PRE-ORDER-Family)'];
  if (preOrderFlows.includes(sessionData.flow_id) && existingPayload.message?.order?.payments?.[0]) {
    existingPayload.message.order.payments[0].type = "PRE-ORDER";
  }

  // Update quote breakup item references with dynamic child item ID
  updateQuoteBreakupItemIds(existingPayload, ids.childItemId);

  // Update PROPOSAL_ID tag value with dynamic quote ID
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

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
 let totalPrice
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
    totalPrice = existingPayload.message.order.quote.breakup.reduce(
      (sum: number, b: any) => sum + (parseFloat(b.price?.value) || 0), 0
    );
    if (existingPayload.message.order.quote.price) {
      existingPayload.message.order.quote.price.value = String(totalPrice);
    }
    // Sync payment amount with calculated quote price
    if (existingPayload.message?.order?.payments) {
      existingPayload.message.order.payments[0].params.amount = String(totalPrice);
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
  }

  return existingPayload;
}
