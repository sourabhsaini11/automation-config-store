export async function onSearchDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("existingPayload on search", existingPayload);
  
  // Set payment_collected_by if present in session data
  if (sessionData.collected_by && existingPayload.message?.catalog?.providers?.[0]?.payments?.[0]) {
    existingPayload.message.catalog.providers[0].payments[0].collected_by = sessionData.collected_by;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  console.log("sessionData.message_id", sessionData);



  // Generate dynamic provider ID (replace hardcoded placeholder)
  if (existingPayload.message?.catalog?.providers?.[0]) {
    existingPayload.message.catalog.providers[0].id = sessionData.provider_id || sessionData.selected_provider.id;
  }

  // Carry forward parent item ID from session (saved in on_search)
  const parentItemId = sessionData.item?.id || (Array.isArray(sessionData.items) ? sessionData.items[0]?.id : undefined);

  // Generate dynamic item IDs - carry forward parent, generate new for children
  if (existingPayload.message?.catalog?.providers?.[0]?.items) {
    existingPayload.message.catalog.providers[0].items.forEach((item: any) => {
      if (!item.parent_item_id) {
        // Parent item — use carried-forward ID from session
        if (parentItemId) {
          item.id = parentItemId;
        } 
        // else {
        //   item.id = crypto.randomUUID();
        // }
      } else {
        // Child item — generate new UUID, update parent_item_id to match
        item.id = crypto.randomUUID();
        // item.id = crypto.randomUUID();
        if (parentItemId) {
          item.parent_item_id = parentItemId;
        }
      }
    });
  }

  // Generate dynamic fulfillment IDs (replace hardcoded placeholders)
  if (existingPayload.message?.catalog?.providers?.[0]?.fulfillments) {
    existingPayload.message.catalog.providers[0].fulfillments.forEach((f: any) => {
      f.id = crypto.randomUUID();
    });
  }

  return existingPayload;
}