
import { resolveSessionIds, applyResolvedIdsToPayload, updateQuoteBreakupItemIds, updateProposalIdTag } from '../id-helper';

export async function confirmDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("sessionData for confirm", sessionData);

  // Update context timestamp and action
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
    existingPayload.context.action = "confirm";
  }


   const submission_id = sessionData?.form_data?.consumer_information_form?.form_submission_id || sessionData?.consumer_information_form
  const form_status = sessionData?.form_data?.consumer_information_form?.idType;

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Generate new UUID message_id for confirm (new API call)
  if (existingPayload.context) {
    existingPayload.context.message_id = crypto.randomUUID();
    console.log("Generated new UUID message_id for confirm:", existingPayload.context.message_id);
  }

  const ids = resolveSessionIds(sessionData);

  // Apply all resolved IDs (provider, child item + parent, fulfillment, quote) in one call
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Update quote breakup item references with dynamic child item ID
  updateQuoteBreakupItemIds(existingPayload, ids.childItemId);

   if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
    if (item.xinput?.form) {
      const formId = sessionData.order?.items?.[0]?.xinput?.form?.id || sessionData.selected_items?.[0]?.xinput?.form?.id || sessionData.form_id || "F08";
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
