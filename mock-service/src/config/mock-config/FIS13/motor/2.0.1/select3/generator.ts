import { randomUUID } from "crypto";
import { resolveSessionIds, applyResolvedIdsToPayload } from '../id-helper';

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Select generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });


   const submission_id = sessionData?.form_data?.pan_details_form?.form_submission_id || sessionData?.pan_details_form;
  const form_status = sessionData?.form_data?.pan_details_form?.idType;
  const ids = resolveSessionIds(sessionData);
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
    existingPayload.context.message_id = randomUUID();
  }
  
  // Apply resolved IDs (provider, items, fulfillment, quote) to payload
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);

  // category_ids are optional in select payloads — remove if added by applyResolvedIdsToPayload
  delete existingPayload.message?.order?.items?.[0]?.category_ids;

  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];
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
  
  // Update form_response with status and submission_id (preserve existing structure)
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
  }

  // Sync payment amount with total_price from session data (saved in on_select)
  if (existingPayload.message?.order?.payments?.[0]?.params) {
    const sessionTotalPrice = Array.isArray(sessionData.total_price) ? sessionData.total_price[0] : sessionData.total_price;
    if (sessionTotalPrice) {
      existingPayload.message.order.payments[0].params.amount = String(sessionTotalPrice);
    }
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
      if (settlementTermsTag?.list) {
        settlementTermsTag.list = settlementTermsTag.list.filter(
          (item: any) => item.descriptor?.code !== 'SETTLEMENT_AMOUNT' && item.descriptor?.code !== 'SETTLEMENT_BASIS'
        );
      }
    }
  }

  return existingPayload;
}