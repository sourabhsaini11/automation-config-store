import { resolveSessionIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onStatusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status", sessionData);

  const submission_id = sessionData?.form_data?.kyc_verification_status?.form_submission_id;

  const form_status = sessionData?.form_data?.kyc_verification_status?.idType;

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  const ids = resolveSessionIds(sessionData);

  // Update order ID from session data
  if (ids.orderId) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = ids.orderId;
  }

  // Update provider information from session data (carry-forward from previous flows)
  if (ids.providerId) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = ids.providerId;
  }
  

  // Carry forward fulfillment.id from session data
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Generate dynamic ID for 2nd fulfillment if present (claim/renewal flows)
  if (existingPayload.message?.order?.fulfillments?.[1]) {
    const secondFulfillmentId = sessionData.second_fulfillment_id || crypto.randomUUID();
    existingPayload.message.order.fulfillments[1].id = secondFulfillmentId;
    sessionData.second_fulfillment_id = secondFulfillmentId;
    if (existingPayload.message?.order?.items?.[0]?.fulfillment_ids) {
      if (!existingPayload.message.order.items[0].fulfillment_ids.includes(secondFulfillmentId)) {
        existingPayload.message.order.items[0].fulfillment_ids.push(secondFulfillmentId);
      }
    }
  }

  // Carry forward quote.id from session data
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Fix items: ensure ID consistency and form status
  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];

    // Ensure item ID matches previous calls (carry-forward from previous flows)
    if (ids.childItemId) {
      item.id = ids.childItemId;
      if (ids.parentItemId) {
        item.parent_item_id = ids.parentItemId;
      }
      if (ids.categoryIds?.length) {
        item.category_ids = ids.categoryIds;
      }
      if (ids.fulfillmentId) {
        item.fulfillment_ids = [ids.fulfillmentId];
      }
    } else if (sessionData.item_id) {
      item.id = sessionData.item_id;
    }

    // Update location_ids from session data (carry-forward from previous flows)
    const selectedLocationId = sessionData.selected_location_id;
    if (selectedLocationId) {
      item.location_ids = [selectedLocationId];
      console.log("Updated location_ids:", selectedLocationId);
    }

    // Update form ID from session data (carry-forward from previous flows)
    if (item.xinput?.form) {
      // Use form ID from session data or default to FO3 (from on_select_2/on_status_unsolicited)
      const formId = sessionData.form_id || "FO3";
      item.xinput.form.id = formId;
      console.log("Updated form ID:", formId);
    }

    // Set form status to OFFLINE_PENDING
    if (item.xinput?.form_response) {
      item.xinput.form_response.status = form_status;
      if (submission_id) {
        item.xinput.form_response.submission_id = submission_id;
      }
    }
  }

  // Fix fulfillments: remove customer details and state
  if (existingPayload.message?.order?.fulfillments) {
    existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
      // Remove customer details
      delete fulfillment.customer;
      // Remove state
      delete fulfillment.state;
    });
  }

  // Remove documents section completely
  if (existingPayload.message?.order?.documents) {
    delete existingPayload.message.order.documents;
  }

  // Update quote information if provided
  if (sessionData.quote_amount && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.price.value = sessionData.quote_amount;
  }

  // Update loan amount in items if provided
  if (sessionData.loan_amount && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].price.value = sessionData.loan_amount;
  }

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

  // Update SETTLEMENT_AMOUNT from session data
  if (sessionData.settlement_amount && existingPayload.message?.order?.payments?.[0]?.tags) {
    existingPayload.message.order.payments[0].tags.forEach((tag: any) => {
      if (tag.descriptor?.code === 'SETTLEMENT_TERMS' && tag.list) {
        tag.list.forEach((listItem: any) => {
          if (listItem.descriptor?.code === 'SETTLEMENT_AMOUNT') {
            listItem.value = sessionData.settlement_amount;
          }
        });
      }
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
