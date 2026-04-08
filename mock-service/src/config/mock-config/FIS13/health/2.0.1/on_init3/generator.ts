
import { resolveSessionIds, applyResolvedIdsToPayload, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

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

  // Apply all resolved IDs to payload (provider, items, fulfillment, quote)
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

  // If flow is pre-order, set payment type to PRE-ORDER
  const preOrderFlows = ['Health_Insurance_Application(PRE-ORDER-Individual)', 'Health_Insurance_Application(PRE-ORDER-Family)'];
  if (preOrderFlows.includes(sessionData.flow_id) && existingPayload.message?.order?.payments?.[0]) {
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
  }

  if (sessionData.customer_email && existingPayload.message?.order?.fulfillments?.[0]?.customer?.contact) {
    existingPayload.message.order.fulfillments[0].customer.contact.email = sessionData.customer_email;
    console.log("Updated customer email:", sessionData.customer_email);
  }

   if (existingPayload.message?.order?.items) {
    console.log("check for form +++")
    existingPayload.message.order.items = existingPayload.message.order.items.map((item: any) => {
      if (item.xinput?.form) {
        // Generate dynamic form ID
        item.xinput.form.id = crypto.randomUUID();
        const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/consumer_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
        console.log("Form URL generated:", url);
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
    if (existingPayload.message?.order?.payments) {
      existingPayload.message.order.payments[0].params.amount = String(totalPrice);
    }

    // Calculate and update SETTLEMENT_AMOUNT dynamically
    if (existingPayload.message?.order?.payments?.[0]?.tags) {
      let buyerFeeType = 'percent-annualized';
      let buyerFeePercentage = 0;
      let buyerFeeAmount = 0;
      // Get payment_tags: prefer session (from search), fallback to payload's own payment tags
      const rawPaymentTags = sessionData.payment_tags || existingPayload.message.order.payments[0].tags;
      // Unwrap from JSONPath array wrapper if needed: [[tag1,tag2]] → [tag1,tag2]
      const paymentTags = Array.isArray(rawPaymentTags?.[0]) && Array.isArray(rawPaymentTags[0]) ? rawPaymentTags[0] : rawPaymentTags;
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
