
import { resolveSessionIds, applyResolvedIdsToPayload, updateProposalIdTag, applyFlowTypeOverrides } from '../id-helper';

export async function onUpdateUnsolicitedDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Generate new message_id for unsolicited update
  if (existingPayload.context) {
 if (sessionData.message_id && existingPayload.context) {
     existingPayload.context.message_id = crypto.randomUUID();
  }
  }
    // Setupdated_at to current date
   if (existingPayload.message?.order) {
    const now = new Date().toISOString();
    if (existingPayload.message.order.updated_at) {
      existingPayload.message.order.updated_at = now;
      existingPayload.message.order.created_at = sessionData.created_at;
    }
  }

  // Helper function to generate UUID v4
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const ids = resolveSessionIds(sessionData);

  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Map order.id from session data (carry-forward from confirm)
    if (sessionData.order_id) {
      order.id = sessionData.order_id;
    }
  }

  // Apply all resolved IDs to payload (provider, items, fulfillment, quote)
  applyResolvedIdsToPayload(existingPayload, ids, sessionData);

  // Update PROPOSAL_ID tag value with dynamic quote ID from session
  updateProposalIdTag(existingPayload, ids.quoteId);

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

  // Use claim form submitted data to populate CLAIM fulfillment tags
  const claimFormData = sessionData.form_data?.claim_form;
  if (claimFormData && existingPayload.message?.order?.fulfillments) {
    const claimFulfillment = existingPayload.message.order.fulfillments.find(
      (f: any) => f.type === 'CLAIM'
    );
    if (claimFulfillment) {
      // Find or create INFO tag group
      if (!claimFulfillment.tags) {
        claimFulfillment.tags = [];
      }
      let infoTag = claimFulfillment.tags.find(
        (t: any) => t.descriptor?.code === 'INFO'
      );
      if (!infoTag) {
        infoTag = { descriptor: { code: 'INFO' }, display: true, list: [] };
        claimFulfillment.tags.push(infoTag);
      }
      if (!infoTag.list) {
        infoTag.list = [];
      }

      // Set REQUESTED_CLAIM_AMOUNT from claim form data
      if (claimFormData.claimAmount) {
        const amountEntry = infoTag.list.find(
          (item: any) => item.descriptor?.code === 'REQUESTED_CLAIM_AMOUNT'
        );
        if (amountEntry) {
          amountEntry.value = `${claimFormData.claimAmount} INR`;
        } else {
          infoTag.list.push({
            descriptor: { code: 'REQUESTED_CLAIM_AMOUNT' },
            value: `${claimFormData.claimAmount} INR`,
          });
        }
      }

      // Set CLAIM_TYPE from form idType
      if (claimFormData.idType) {
        const claimTypeEntry = infoTag.list.find(
          (item: any) => item.descriptor?.code === 'CLAIM_TYPE'
        );
        if (claimTypeEntry) {
          claimTypeEntry.value = claimFormData.idType;
        } else {
          infoTag.list.push({
            descriptor: { code: 'CLAIM_TYPE' },
            value: claimFormData.idType,
          });
        }
      }
    }
  }

  // Update document URLs from session data (use claim_doc_url/renew_doc_url to avoid overwrite by form submission_id)
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
