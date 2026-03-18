
import { resolveSessionIds, applyResolvedIdsToPayload } from '../id-helper';

export async function initDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for init", sessionData);

  const ids = resolveSessionIds(sessionData);


  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "init";
  }

   const submission_id = sessionData?.form_data?.vehicle_nominee_details_Form?.form_submission_id || sessionData?.vehicle_nominee_details_Form
  const form_status = sessionData?.form_data?.vehicle_nominee_details_Form?.idType;
  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Generate new UUID message_id for init (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
    console.log("Generated new UUID message_id for init:", existingPayload.context.message_id);
  }

  // Apply resolved IDs (provider, items, fulfillment, quote) to payload
  applyResolvedIdsToPayload(existingPayload, ids);

  // If flow is pre-order, set payment type to PRE-ORDER
  if (sessionData.flow_id === 'Motor_Insurance_Application(PRE-ORDER)' && existingPayload.message?.order?.payments?.[0]) {
    existingPayload.message.order.payments[0].type = "PRE-ORDER";
  }

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      // Use form ID from session data or default to FO3
      const formId = sessionData.form_id || "F06";
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
    const settlementBasePrice = parseFloat(rawTotalPrice) || 0;
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

  return existingPayload;
}
