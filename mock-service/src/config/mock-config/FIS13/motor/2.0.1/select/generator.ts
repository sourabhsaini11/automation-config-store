

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

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  const ids = resolveSessionIds(sessionData);

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
    if (sessionData.message_id && existingPayload.context) {
      existingPayload.context.message_id = randomUUID();
    }

  // Apply all resolved IDs (provider, items, fulfillments, quote) to payload
  applyResolvedIdsToPayload(existingPayload, ids);

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