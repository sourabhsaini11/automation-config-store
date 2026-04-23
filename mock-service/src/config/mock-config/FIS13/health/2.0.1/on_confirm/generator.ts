
import { resolveSessionIds, applyResolvedIdsToPayload, updateQuoteBreakupItemIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onConfirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for on_confirm", sessionData);

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Use the same message_id as confirm (matching pair)
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Using matching message_id from confirm:", sessionData.message_id);
  }

  // Generate dynamic order ID
  if (existingPayload.message?.order) {
    existingPayload.message.order.id = crypto.randomUUID();
    // Save generated order_id back to sessionData for downstream generators
    sessionData.order_id = existingPayload.message.order.id;
  }

  // Set created_at and updated_at to current date
   if (existingPayload.message?.order) {
     if (existingPayload.message.order.created_at) {
         delete existingPayload.message.order.created_at;
    }
    const now = new Date().toISOString();
      existingPayload.message.order.created_at = now;
      existingPayload.message.order.updated_at = now;
  }

  const ids = resolveSessionIds(sessionData);

  // Apply all resolved IDs (provider, child item + parent, fulfillment, quote) in one call
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);

  // Update quote breakup item references with dynamic child item ID
  updateQuoteBreakupItemIds(existingPayload, ids.childItemId);

  // Update PROPOSAL_ID tag value with dynamic quote ID
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

  // Generate dynamic payment form URL
  if (existingPayload.message?.order?.payments?.[0]) {
    const paymentUrl = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/payment_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
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
