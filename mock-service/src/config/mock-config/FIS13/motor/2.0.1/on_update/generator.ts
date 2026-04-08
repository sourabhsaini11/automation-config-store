import { resolveSessionIds, applyResolvedIdsToPayload, getBasePriceForVehicleType } from '../id-helper';

export async function onUpdateDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  const ids = resolveSessionIds(sessionData);

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Map order.id from resolved IDs
    if (ids.orderId) {
      order.id = ids.orderId;
    }

    // Apply all resolved IDs (provider, items, fulfillments, quote) to payload
    applyResolvedIdsToPayload(existingPayload, ids, sessionData);

      // Setupdated_at to current date
   if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    if (existingPayload.message.order.updated_at) {
      existingPayload.message.order.updated_at = now;
      existingPayload.message.order.created_at = sessionData.created_at;
    }
  }


  }

  
  // Update item price with base price for vehicle type
  if (existingPayload.message?.order?.items) {
    const basePrice = getBasePriceForVehicleType(sessionData);
    existingPayload.message.order.items.forEach((item: any) => {
      if (item.price) {
        item.price.value = basePrice;
      }
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
  }

  // Sync payment amount with total_price from session data (saved in on_select)
  if (existingPayload.message?.order?.payments?.[0]?.params) {
    const sessionTotalPrice = Array.isArray(sessionData.total_price) ? sessionData.total_price[0] : sessionData.total_price;
    if (sessionTotalPrice) {
      existingPayload.message.order.payments[0].params.amount = String(sessionTotalPrice);
    }
  }

  // Reuse settlement_amount from session data (calculated in init/on_init)
  if (sessionData.settlement_amount && existingPayload.message?.order?.payments?.[0]?.tags) {
    existingPayload.message.order.payments[0].tags.forEach((tag: any) => {
      if (tag.descriptor?.code === 'SETTLEMENT_TERMS' && tag.list) {
        tag.list.forEach((listItem: any) => {
          if (listItem.descriptor?.code === 'SETTLEMENT_AMOUNT') {
            listItem.value = String(sessionData.settlement_amount);
          }
        });
      }
    });
  }


  // Update document URLs to use dynamic form service URLs
  if (existingPayload.message?.order?.documents) {
    existingPayload.message.order.documents = existingPayload.message.order.documents.map((doc: any) => {
      if (doc.descriptor?.code === 'CLAIM_DOC' && doc.mime_type === 'application/html' && sessionData.claim_doc_url_motor) {
        doc.url = sessionData.claim_doc_url_motor;
      }
      if (doc.descriptor?.code === 'RENEW_DOC' && doc.mime_type === 'application/html') {
        doc.url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/renew_insurance_form_motor?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
      }
      return doc;
    });
  }

  return existingPayload;
}
