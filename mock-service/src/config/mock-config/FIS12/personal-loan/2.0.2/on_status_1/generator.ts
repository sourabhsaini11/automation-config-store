export async function onStatusGenerator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  console.log("sessionData for on_status", sessionData);

  // on_status_1 comes after confirm which used loan_agreement_esign_form (on_init_3)
  const submission_id = (sessionData as any)?.form_data?.loan_agreement_esign_form?.form_submission_id;
  const form_status = (sessionData as any)?.form_data?.loan_agreement_esign_form?.idType;

  // Update transaction_id and message_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Update order ID from session data
  if (sessionData.order_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update provider information from session data (carry-forward from previous flows)
  if (sessionData.provider_id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = sessionData.provider_id;
  }

  // Fix items: ensure ID consistency and form status
  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];

    // Update item.id from session data (carry-forward from previous flows)
    const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (selectedItem?.id) {
      item.id = selectedItem.id;
      console.log("Updated item.id:", selectedItem.id);
    } else if (sessionData.item_id) {
      item.id = sessionData.item_id;
      console.log("Updated item.id from item_id:", sessionData.item_id);
    }

    // Update location_ids from session data (carry-forward from previous flows)
    const selectedLocationId = sessionData.selected_location_id;
    if (selectedLocationId) {
      item.location_ids = [selectedLocationId];
      console.log("Updated location_ids:", selectedLocationId);
    }

    // Use form ID from session data (saved by on_init_3 for esign form)
    if (item.xinput?.form) {
      const formId = sessionData.form_id;
      if (formId) {
        item.xinput.form.id = formId;
        console.log("[on_status_1] Carried forward form.id:", formId);
      }
    }

    // Only override status/submission_id if we have real values from session
    if (item.xinput?.form_response) {
      if (form_status) {
        item.xinput.form_response.status = form_status;
      }
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

  // Carry forward payments from session data (preserves dynamically generated installment IDs)
  const savedPayments = sessionData.order?.payments || sessionData.payments;
  if (Array.isArray(savedPayments) && savedPayments.length > 0 && existingPayload.message?.order) {
    existingPayload.message.order.payments = savedPayments;
    console.log("Carried forward payments from session (installment IDs preserved)");
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
      console.log("Updated quote.id from session:", sessionData.quote_id);
    }
  }

  // Update quote information if provided
  if (sessionData.quote_amount && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.price.value = sessionData.quote_amount;
  }

  // Update loan amount in items if provided
  if (sessionData.loan_amount && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].price.value = sessionData.loan_amount;
  }

  //update payment for all init 
  const sessionPayments: any[] = sessionData.payments || sessionData.order?.payments || [];
  existingPayload.message.order.payments[0].id = sessionPayments[0].id
  return existingPayload;
}
