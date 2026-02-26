

import { randomUUID } from "crypto";

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Select generator - Available session data:", {
    selected_provider: !!sessionData.selected_provider,
    selected_items: !!sessionData.selected_items,
    items: !!sessionData.items,
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id
  });

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
  // Update provider.id if available from session data (carry-forward from on_search)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }
  
  // Carry forward item.id from session data
  const childItem = sessionData.order?.items?.[0] || sessionData.selected_items?.[0] || sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (childItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = childItem.id;
    if (childItem.parent_item_id) {
      existingPayload.message.order.items[0].parent_item_id = childItem.parent_item_id;
    }

  }

  // Resolve fulfillment ID (handle both string and array from session)
  const fulfillmentId = Array.isArray(sessionData.fullfillment_ids) ? sessionData.fullfillment_ids[0] : sessionData.fullfillment_ids;

  // Carry forward fulfillment.id from session data
  if (fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = fulfillmentId;
  }

  // Carry forward quote.id from session data
  if (sessionData.quote_id && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = sessionData.quote_id;
  }

  // Build add_ons from user-selected addon IDs and session data
  if (sessionData.user_inputs?.addon_ids && sessionData.selected_add_ons?.length > 0) {
    const addonIds = sessionData.user_inputs.addon_ids.split(",").map((id: string) => id.trim()).filter(Boolean);
    const addonQuantities = sessionData.user_inputs.addon_quantities
      ? sessionData.user_inputs.addon_quantities.split(",").map((q: string) => parseInt(q.trim()) || 1)
      : addonIds.map(() => 1);

    if (addonIds.length > 0) {
      const selectedAddOns = addonIds.map((id: string, index: number) => {
        const addon = sessionData.selected_add_ons.find((a: any) => a.id === id);
        if (addon) {
          return {
            id: addon.id,
            quantity: {
              selected: {
                count: addonQuantities[index] || 1,
              },
            },
          };
        }
        return { id, quantity: { selected: { count: addonQuantities[index] || 1 } } };
      });

      if (existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].add_ons = selectedAddOns;
        console.log("Added user-selected add_ons:", JSON.stringify(selectedAddOns));
      }
    } else {
      // Remove add_ons if none selected
      if (existingPayload.message?.order?.items?.[0]?.add_ons) {
        delete existingPayload.message.order.items[0].add_ons;
        console.log("Removed add_ons - none selected");
      }
    }
  } else {
    // Remove add_ons from default payload if no addon input provided
    if (existingPayload.message?.order?.items?.[0]?.add_ons) {
      delete existingPayload.message.order.items[0].add_ons;
      console.log("Removed add_ons - no addon input provided");
    }
  }

  return existingPayload;
} 