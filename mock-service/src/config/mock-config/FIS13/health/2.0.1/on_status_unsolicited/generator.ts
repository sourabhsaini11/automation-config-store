import { resolveSessionIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onStatusUnsolicitedGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status_unsolicited", sessionData);

  const submission_id = sessionData?.form_data?.kyc_verification_status?.form_submission_id;
  console.log("form_data ------->", sessionData?.form_data?.kyc_verification_status);

  const form_status = sessionData?.form_data?.kyc_verification_status?.idType;

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
     existingPayload.context.message_id = crypto.randomUUID();
  }

  const ids = resolveSessionIds(sessionData);

  // Update order ID from session data if available
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider information from session data (carry-forward from on_select_2)
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

  // Apply quote ID
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

  // Update form ID to FO3 (carry-forward from on_select_2)
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = sessionData.form_id || "FO3";
    console.log("Updated form ID to FO3");
  }

  // Update form response status - on_status_unsolicited uses APPROVED status
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    const formResponse = existingPayload.message.order.items[0].xinput.form_response;
    // if (sessionData.form_status) {
    //   formResponse.status = sessionData.form_status;
    // } else {
    //   formResponse.status = "APPROVED";
    // }

    // Update submission ID if provided
    if (sessionData.submission_id) {
      formResponse.submission_id = sessionData.submission_id;
    }
  }

  // Update customer name in fulfillments if available from session data
  if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
    existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    console.log("Updated customer name:", sessionData.customer_name);
  }


  if(existingPayload.message?.order?.items?.[0]?.xinput?.form_response){
    existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
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


  // Update document URLs from session data
  if (existingPayload.message?.order?.documents) {
    existingPayload.message.order.documents = existingPayload.message.order.documents.map((doc: any) => {
      if (doc.descriptor?.code === 'CLAIM_DOC' && doc.mime_type === 'application/html' && sessionData.claim_doc_url) {
        doc.url = sessionData.claim_doc_url;
      }
      if (doc.descriptor?.code === 'RENEW_DOC' && doc.mime_type === 'application/html' && sessionData.renew_doc_url) {
        doc.url = sessionData.renew_doc_url;
      }
      return doc;
    });
  }

  return existingPayload;
}
