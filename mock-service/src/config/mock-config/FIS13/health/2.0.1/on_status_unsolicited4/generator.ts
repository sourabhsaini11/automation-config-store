import { resolveSessionIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }


  const submission_id = sessionData?.form_data?.Ekyc_details_form?.form_submission_id || sessionData?.Ekyc_details_form
  const form_status = sessionData?.form_data?.Ekyc_details_form?.idType;



  // const submission_id = sessionData?.form_data?.Ekyc_details_form?.form_submission_id;

  // const form_status = sessionData?.form_data?.Ekyc_details_form?.idType;

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
  }

  // Update order ID from session data if available
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider information from session data (carry-forward from on_select_2)
  // if (sessionData.provider_id) {
  //   existingPayload.message = existingPayload.message || {};
  //   existingPayload.message.order = existingPayload.message.order || {};
  //   existingPayload.message.order.provider = existingPayload.message.order.provider || {};
  //   existingPayload.message.order.provider.id = sessionData.provider_id;
  // }

  // Update item.id from session data (carry-forward from on_select_2)
  // const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  // if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
  //   existingPayload.message.order.items[0].id = selectedItem.id;
  //   console.log("Updated item.id:", selectedItem.id);
  // }


  // Update form ID to FO3 (carry-forward from on_select_2)
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
  //   existingPayload.message.order.items[0].xinput.form.id = "FO3";
  //   console.log("Updated form ID to FO3");
  // }

  // Update form response status - on_status_unsolicited uses APPROVED status
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
  //   const formResponse = existingPayload.message.order.items[0].xinput.form_response;

  //   // Update submission ID if provided
  //   if (sessionData.submission_id) {
  //     formResponse.submission_id = sessionData.submission_id;
  //   }
  // }

  // // Update customer name in fulfillments if available from session data
  // if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
  //   existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
  //   console.log("Updated customer name:", sessionData.customer_name);
  // }



  // // Update quote information if provided
  // if (sessionData.quote_amount && existingPayload.message?.order?.quote) {
  //   existingPayload.message.order.quote.price.value = sessionData.quote_amount;
  // }



  // if(existingPayload.message?.order?.items?.[0]?.xinput?.form_response){
  //   existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
  // }

  const ids = resolveSessionIds(sessionData);

  // Carry forward provider.id from session data
  if (ids.providerId) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = ids.providerId;
  }

  // Apply child item ID and parent_item_id
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

  // Apply fulfillment ID
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Apply quote ID
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.form_id || "F05";
      item.xinput.form.id = formId;
      console.log("Updated form ID:", formId);
    }

    // Set form status and submission_id
    if (item.xinput) {
      // Create form_response if it doesn't exist
      if (!item.xinput.form_response) {
        item.xinput.form_response = {};
      }
      if (form_status) {
        item.xinput.form_response.status = form_status;
      }
      if (submission_id) {
        item.xinput.form_response.submission_id = submission_id;
      }
    }
  }

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

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

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
