import { resolveSessionIds } from '../id-helper';

export async function onSearchDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("existingPayload on search", existingPayload);
  const ids = resolveSessionIds(sessionData);

  // Set payment_collected_by if present in session data
  if (sessionData.collected_by && existingPayload.message?.catalog?.providers?.[0]?.payments?.[0]) {
    existingPayload.message.catalog.providers[0].payments[0].collected_by = sessionData.collected_by;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  console.log("sessionData.message_id", sessionData);

  // Update form URLs for items with session data (preserve existing structure)
   if (existingPayload.message?.catalog?.providers?.[0]?.items) {
    console.log("check for form +++")
    existingPayload.message.catalog.providers[0].items = existingPayload.message.catalog.providers[0].items.map((item: any) => {
      if (item.xinput?.form) {
        // Generate dynamic form ID
        item.xinput.form.id = crypto.randomUUID();
        // Generate dynamic form URL with session data
        const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/family_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
        console.log("Form URL generated:", url);
        item.xinput.form.url = url;
      }
      return item;
    });
  }

  // Carry forward provider ID from session (from on_search)
  if (existingPayload.message?.catalog?.providers?.[0]) {
    if (ids.providerId) {
      existingPayload.message.catalog.providers[0].id = ids.providerId;
    } else {
      existingPayload.message.catalog.providers[0].id = crypto.randomUUID();
    }
  }

  // Carry forward parent item ID from session and generate new child item ID
  const parentItemId = sessionData.item?.id;
  if (existingPayload.message?.catalog?.providers?.[0]?.items) {
    existingPayload.message.catalog.providers[0].items.forEach((item: any) => {
      if (item.parent_item_id) {
        // This is a child item: generate new UUID and set parent_item_id to dynamic parent ID
        item.id = crypto.randomUUID();
        if (parentItemId) {
          item.parent_item_id = parentItemId;
        }
      } else {
        // This is the parent item: reuse ID from on_search session
        if (parentItemId) {
          item.id = parentItemId;
        } else {
          item.id = crypto.randomUUID();
        }
      }
    });
  }

  // Carry forward fulfillment IDs from session (from on_search)
  if (existingPayload.message?.catalog?.providers?.[0]?.fulfillments) {
    const sessionFulfillmentIds = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids : [];
    existingPayload.message.catalog.providers[0].fulfillments.forEach((f: any, index: number) => {
      if (sessionFulfillmentIds[index]) {
        f.id = sessionFulfillmentIds[index];
      } else {
        f.id = crypto.randomUUID();
      }
    });
  }

  return existingPayload;
}