
import { resolveSessionIds, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onUpdateDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  const ids = resolveSessionIds(sessionData);

    // Setupdated_at to current date
   if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    if (existingPayload.message.order.updated_at) {
      existingPayload.message.order.updated_at = now;
      existingPayload.message.order.created_at = sessionData.created_at;
    }
  }

  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Map order.id from session data (carry-forward from confirm)
    if (ids.orderId) {
      order.id = ids.orderId;
    }

    // Map provider.id from session data (carry-forward from confirm)
    if (ids.providerId && order.provider) {
      order.provider.id = ids.providerId;
    }

    // Map item.id and parent_item_id from session data
    if (ids.childItemId && order.items?.[0]) {
      order.items[0].id = ids.childItemId;
      if (ids.parentItemId) {
        order.items[0].parent_item_id = ids.parentItemId;
      }
      if (ids.categoryIds?.length) {
        order.items[0].category_ids = ids.categoryIds;
      }
      if (ids.fulfillmentId) {
        order.items[0].fulfillment_ids = [ids.fulfillmentId];
      }
    }

    // Map quote.id from session data (carry-forward from confirm)
    if (ids.quoteId && order.quote) {
      order.quote.id = ids.quoteId;
    }

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

    // Map fulfillment.id from session data
    if (ids.fulfillmentId && order.fulfillments?.[0]) {
      order.fulfillments[0].id = ids.fulfillmentId;
    }
  }

  // Update SETTLEMENT_AMOUNT from session data
  if (sessionData.settlement_amount && existingPayload.message?.order?.payments?.[0]?.tags) {
    existingPayload.message.order.payments[0].tags.forEach((tag: any) => {
      if (tag.descriptor?.code === 'SETTLEMENT_TERMS' && tag.list) {
        tag.list.forEach((listItem: any) => {
          if (listItem.descriptor?.code === 'SETTLEMENT_AMOUNT') {
            listItem.value = sessionData.settlement_amount;
          }
        });
      }
    });
  }

  // Apply flow-type overrides (Individual vs Family)
  applyFlowTypeOverrides(existingPayload, sessionData);

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
