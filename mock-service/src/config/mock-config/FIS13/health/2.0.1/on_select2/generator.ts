
import { resolveSessionIds, applyResolvedIdsToPayload, updateQuoteBreakupItemIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onSelectDefaultGenerator(existingPayload: any, sessionData: any) {
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

  const PRE_ORDER_FLOWS = [
  "Health_Insurance_Application(PRE-ORDER-Individual)",
  "Health_Insurance_Application(PRE-ORDER-Family)",
];

if (PRE_ORDER_FLOWS.includes(sessionData.flow_id)) {
  existingPayload?.message?.order?.items?.forEach((item: any) => {
    if (!item?.xinput?.head) return;

    item.xinput.head.index = { min: 0, cur: 0, max: 0 };
    item.xinput.head.headings = ["EKYC"];
  });
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

  // Apply all resolved IDs to payload (provider, items, fulfillment, quote)
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);
  if (ids.providerId) {
    console.log("Updated provider.id:", ids.providerId);
  }

  // Update quote breakup item references with dynamic child item ID
  updateQuoteBreakupItemIds(existingPayload, ids.childItemId);

  // Update PROPOSAL_ID tag value with dynamic quote ID
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

  // Generate dynamic form ID and URL
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = crypto.randomUUID();
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/Ekyc_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
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

let  totalPrice
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

  }


  return existingPayload;
}
