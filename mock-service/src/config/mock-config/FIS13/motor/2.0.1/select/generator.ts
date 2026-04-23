

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
  const userInputs = sessionData.user_inputs || {};

  // Update provider — prefer user selection from insurance-select form
  const selectedProviderId = userInputs.provider_id || ids.providerId;
  if (selectedProviderId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = selectedProviderId;
    sessionData.provider_id = selectedProviderId;

    // Apply provider descriptor from user selection
    if (userInputs.provider_descriptor) {
      try {
        const providerDescriptor = JSON.parse(userInputs.provider_descriptor);
        if (providerDescriptor && Object.keys(providerDescriptor).length > 0) {
          existingPayload.message.order.provider.descriptor = providerDescriptor;
        }
      } catch (e) { /* ignore parse errors */ }
    }
    console.log("Updated provider.id:", selectedProviderId);
  }

  // Update item — prefer user selection from insurance-select form
  if (existingPayload.message?.order?.items?.[0]) {
    const item = existingPayload.message.order.items[0];

    if (userInputs.item_id) {
      // User selected a specific item from insurance-select form
      item.id = userInputs.item_id;
      item.parent_item_id = userInputs.parent_item_id || userInputs.item_id;

      // Apply full item descriptor from user selection
      if (userInputs.item_descriptor) {
        try {
          const itemDescriptor = JSON.parse(userInputs.item_descriptor);
          if (itemDescriptor && Object.keys(itemDescriptor).length > 0) {
            item.descriptor = { ...item.descriptor, ...itemDescriptor };
          }
        } catch (e) { /* ignore parse errors */ }
      }

      console.log("Using user-selected item:", userInputs.item_id, "parent:", item.parent_item_id);
    } else {
      // Fallback: use session items from on_search
      const parentItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
      if (parentItem?.id) {
        item.parent_item_id = parentItem.id;
        item.id = sessionData.items?.[1]?.id || crypto.randomUUID();
      }
    }

    // Update category_ids from user selection and derive vehicle_type
    // if (userInputs.category_ids) {
    //   try {
    //     const categoryIds = JSON.parse(userInputs.category_ids);
    //     if (Array.isArray(categoryIds) && categoryIds.length > 0) {
    //       item.category_ids = categoryIds;
    //       sessionData.selected_category_ids = categoryIds;

    //       // Derive vehicle_type from selected category_ids so downstream generators use correct overrides
    //       const fourWheelerCategories = ['C4', 'C5', 'C6'];
    //       const isFourWheeler = categoryIds.some((c: string) => fourWheelerCategories.includes(c));
    //       sessionData.vehicle_type = isFourWheeler ? '4-wheeler' : '2-wheeler';
    //       console.log("Derived vehicle_type from selection:", sessionData.vehicle_type);
    //     }
    //   } catch (e) { /* ignore parse errors */ }
    // }

    // Persist IDs to sessionData for downstream generators
    sessionData.child_item_id = item.id;
    sessionData.parent_item_id = item.parent_item_id;
  }

  // Update fulfillment.id — prefer user selection from insurance-select form
  const selectedFulfillmentId = userInputs.fulfillment_id || ids.fulfillmentId;
  if (selectedFulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = selectedFulfillmentId;
    sessionData.fulfillment_id = selectedFulfillmentId;
  }

  // Build add_ons from user-selected addon details or session data
  if (userInputs.addon_ids) {
    const addonIds = userInputs.addon_ids.split(",").map((id: string) => id.trim()).filter(Boolean);
    const addonQuantities = userInputs.addon_quantities
      ? userInputs.addon_quantities.split(",").map((q: string) => parseInt(q.trim()) || 1)
      : addonIds.map(() => 1);

    // Parse full add-on details from insurance-select form (preferred source)
    let addonDetailsFromForm: any[] = [];
    if (userInputs.selected_add_on_details) {
      try {
        addonDetailsFromForm = JSON.parse(userInputs.selected_add_on_details);
      } catch (e) { /* ignore parse errors */ }
    }

    if (addonIds.length > 0) {
      const selectedAddOns = addonIds.map((id: string, index: number) => {
        // Try full details from form first, then fall back to session selected_add_ons
        const addonFromForm = addonDetailsFromForm.find((a: any) => a.id === id);
        const addonFromSession = sessionData.selected_add_ons?.find((a: any) => a.id === id);
        const addon = addonFromForm || addonFromSession;
        const qty = addonQuantities[index] || 1;

        if (addon) {
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