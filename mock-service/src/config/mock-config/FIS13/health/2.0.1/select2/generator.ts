import { resolveSessionIds, applyResolvedIdsToPayload } from '../id-helper';

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Select generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });

   const submission_id = sessionData?.form_data?.verification_status?.form_submission_id || sessionData?.verification_status
  const form_status = sessionData?.form_data?.verification_status?.idType;
  const ids = resolveSessionIds(sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Generate new UUID message_id for init (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
  }
  
  
  // Apply resolved IDs (provider, items, fulfillment, quote) to payload
  applyResolvedIdsToPayload(existingPayload, ids);

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    const preOrderFlows = [
    'Health_Insurance_Application(PRE-ORDER-Individual)',
    'Health_Insurance_Application(PRE-ORDER-Family)'
    ];
    // PRE-ORDER flows skip the manual_review_form step, so xinput should not be sent
    if (preOrderFlows.includes(sessionData.flow_id)) {
       delete item.xinput;
    } else {
      if (item.xinput?.form) {
        const formId = sessionData.form_id || "F04";
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
        console.log("Updated form_response:", item.xinput.form_response);
      }
    }
  }
  
  
  // // Update form_response with status and submission_id (preserve existing structure)
  // if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
  //   existingPayload.message.order.items[0].xinput.form_response.status = "SUCCESS";
  //   existingPayload.message.order.items[0].xinput.form_response.submission_id = `F01_SUBMISSION_ID_${Date.now()}`;
  //   console.log("Updated form_response with status and submission_id");
  // }
  
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