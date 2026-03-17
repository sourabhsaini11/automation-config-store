
import { resolveSessionIds } from '../id-helper';

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
   existingPayload.context.message_id = crypto.randomUUID();
  }

  const ids = resolveSessionIds(sessionData);

  // Update provider.id if available from session data (carry-forward from on_search)
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
    console.log("Updated provider.id:", ids.providerId);
  }

  // Generate child item ID and set parent_item_id from on_search item
  const parentItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (parentItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].parent_item_id = parentItem.id;
    // existingPayload.message.order.items[0].id = crypto.randomUUID();
    existingPayload.message.order.items[0].id = sessionData.items[1].id;
    console.log("Generated child item ID:", existingPayload.message.order.items[0].id, "parent_item_id:", parentItem.id);

    // Save resolved IDs back to sessionData for downstream generators
    sessionData.child_item_id = existingPayload.message.order.items[0].id;
    sessionData.parent_item_id = parentItem.id;
  }

  // Carry forward fulfillment.id from session data
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Carry forward quote.id from session data
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
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
        const qty = addonQuantities[index] || 1;
        if (addon) {
          // Calculate total price based on selected quantity
          const unitPrice = parseFloat(addon.price?.value) || 0;
          const totalPrice = unitPrice * qty;
          return {
            id: addon.id,
            descriptor: addon.descriptor,
            quantity: {
              selected: {
                count: qty,
              },
            },
            price: {
              value: String(totalPrice),
              currency: addon.price?.currency || "INR"
            }
          };
        }
        return {
          id,
          quantity: { selected: { count: qty } },
          price: { value: "0", currency: "INR" }
        };
      });

      if (existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].add_ons = selectedAddOns;

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