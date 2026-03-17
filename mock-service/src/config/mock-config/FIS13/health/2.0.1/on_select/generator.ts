

import { resolveSessionIds, updateQuoteBreakupItemIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onSelectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log('sessionData>>>', sessionData)
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

  const ids = resolveSessionIds(sessionData);

  // Update provider.id if available from session data (carry-forward from select)
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
    console.log("Updated provider.id:", ids.providerId);
  }

  // Generate NEW child item ID (BPP creates a child item in on_select)
  // The parent item ID comes from on_search (sessionData.item.id)
  const parentItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  const selectedItem = sessionData.selected_items?.[0];
  const childItem = selectedItem || parentItem;

  if (existingPayload.message?.order?.items?.[0]) {
    // Generate a new child item ID (distinct from parent)
    existingPayload.message.order.items[0].id = sessionData.items[1].id;

    // Set parent_item_id to the parent item's dynamic ID from on_search
    const parentItemId = parentItem?.id || selectedItem?.id;
    if (parentItemId) {
      existingPayload.message.order.items[0].parent_item_id = parentItemId;
    }

    // Save resolved IDs back to sessionData for downstream generators
    sessionData.child_item_id = existingPayload.message.order.items[0].id;
    sessionData.parent_item_id = parentItemId;
  }

  // Apply flow-type overrides (Individual vs Family) — updates category_ids and descriptor
  applyFlowTypeOverrides(existingPayload, sessionData);

  // Carry forward fulfillment.id from session data
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Generate dynamic quote ID (replace hardcoded OFFER_ID/PROPOSAL_ID)
  if (existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = crypto.randomUUID();
    // Save generated quote_id back to sessionData for downstream generators
    sessionData.quote_id = existingPayload.message.order.quote.id;
  }

  // Update quote breakup item references with dynamic child item ID
  updateQuoteBreakupItemIds(existingPayload, childItem?.id);

  // Update PROPOSAL_ID tag value with dynamic quote ID
  updateProposalIdTag(existingPayload, existingPayload.message?.order?.quote?.id);

  // Generate dynamic form ID and URL
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = crypto.randomUUID();
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/verification_status?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
  }

  const preOrderFlows = ['Health_Insurance_Application(PRE-ORDER-Individual)', 'Health_Insurance_Application(PRE-ORDER-Family)'];

  if (preOrderFlows.includes(sessionData.flow_id) && existingPayload.message?.order?.payments?.[0]) {
     delete existingPayload.message.order.items[0].xinput
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
  }

  return existingPayload;
}