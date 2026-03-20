/**
 * Shared ID resolution helper for flow generators.
 * Resolves commonly used IDs from session data and caches them as flat fields.
 * Call resolveSessionIds() at the start of each generator to avoid repeated lookups.
 * Once resolved, IDs are cached on sessionData so subsequent generators can use them directly.
 */

export interface ResolvedIds {
  providerId: string | undefined;
  childItemId: string | undefined;
  parentItemId: string | undefined;
  fulfillmentId: string | undefined;
  quoteId: string | undefined;
  orderId: string | undefined;
  categoryIds: string[] | undefined;
}

/**
 * Resolves and caches commonly used IDs from various session data sources.
 * Priority order for child item: order.items[0] > selected_items[0] > item > items[0]
 * Once resolved, values are saved back to sessionData as flat fields so that
 * future generators can access them directly without re-doing the lookup.
 */
export function resolveSessionIds(sessionData: any): ResolvedIds {
  // Resolve provider_id: prefer flat field, fallback to nested object
  if (!sessionData.provider_id) {
    sessionData.provider_id = sessionData.selected_provider?.id;
  }

  // Resolve fulfillment_id: prefer flat field, fallback to array
  if (!sessionData.fulfillment_id) {
    sessionData.fulfillment_id = Array.isArray(sessionData.fullfillment_ids)
      ? sessionData.fullfillment_ids[0]
      : sessionData.fullfillment_ids;
  }

  // Resolve quote_id: prefer flat field, fallback to nested quote object
  if (!sessionData.quote_id) {
    sessionData.quote_id = sessionData.quote?.id;
  }

  // Resolve child_item_id, parent_item_id, and selected_category_ids from various session sources
  if (!sessionData.child_item_id) {
    const childItem =
      sessionData.order?.items?.[0] ||
      sessionData.selected_items?.[0] ||
      sessionData.item ||
      (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);

    if (childItem?.id) {
      sessionData.child_item_id = childItem.id;
    }
    if (childItem?.parent_item_id && !sessionData.parent_item_id) {
      sessionData.parent_item_id = childItem.parent_item_id;
    }
    if (childItem?.category_ids && !sessionData.selected_category_ids?.length) {
      sessionData.selected_category_ids = normalizeCategoryIds(childItem.category_ids);
    }
  }

  // Resolve selected_category_ids from category_ids session field if not yet set
  if (!sessionData.selected_category_ids?.length && sessionData.category_ids?.length) {
    sessionData.selected_category_ids = normalizeCategoryIds(sessionData.category_ids);
  }

  // Normalize in case JSONPath extraction wrapped it as [["C1","C3"]]
  if (sessionData.selected_category_ids?.length) {
    sessionData.selected_category_ids = normalizeCategoryIds(sessionData.selected_category_ids);
  }

  return {
    providerId: sessionData.provider_id,
    fulfillmentId: sessionData.fulfillment_id,
    quoteId: sessionData.quote_id,
    childItemId: sessionData.child_item_id,
    parentItemId: sessionData.parent_item_id,
    orderId: sessionData.order_id,
    categoryIds: sessionData.selected_category_ids,
  };
}

/**
 * Applies resolved IDs to the common payload fields.
 * Handles provider, items (child + parent), fulfillments, and quote ID mapping.
 */
export function applyResolvedIdsToPayload(
  existingPayload: any,
  ids: ResolvedIds
): void {
  // Apply provider ID
  if (ids.providerId && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = ids.providerId;
  }

  // Apply child item ID, parent_item_id, category_ids, and fulfillment_ids in items
  if (ids.childItemId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = ids.childItemId;
    if (ids.parentItemId) {
      existingPayload.message.order.items[0].parent_item_id = ids.parentItemId;
    }
    if (ids.categoryIds?.length) {
      existingPayload.message.order.items[0].category_ids = ids.categoryIds;
    }
    if (ids.fulfillmentId) {
      existingPayload.message.order.items[0].fulfillment_ids = [ids.fulfillmentId];
    }
  }

  // Apply fulfillment ID
  if (ids.fulfillmentId && existingPayload.message?.order?.fulfillments?.[0]) {
    existingPayload.message.order.fulfillments[0].id = ids.fulfillmentId;
  }

  // Apply quote ID
  if (ids.quoteId && existingPayload.message?.order?.quote) {
    existingPayload.message.order.quote.id = ids.quoteId;
  }
}

/**
 * Updates quote breakup item references with the resolved child item ID.
 */
export function updateQuoteBreakupItemIds(
  existingPayload: any,
  childItemId: string | undefined
): void {
  if (existingPayload.message?.order?.quote?.breakup && childItemId) {
    existingPayload.message.order.quote.breakup.forEach((b: any) => {
      if (b.item?.id && b.title !== 'ADD_ONS') b.item.id = childItemId;
    });
  }
}

/**
 * Normalizes category_ids to a flat string array ["C1", "C3"].
 * JSONPath extraction may wrap it as [["C1", "C3"]] — this unwraps the inner array.
 * If already flat like ["C1", "C3"], returns as-is.
 */
function normalizeCategoryIds(categoryIds: any): string[] | undefined {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return undefined;
  // If first element is an array, it's wrapped like [["C1","C3"]] — unwrap it
  if (Array.isArray(categoryIds[0])) {
    return categoryIds[0];
  }
  // Already flat like ["C1", "C3"]
  return categoryIds;
}

/**
 * Checks if the selected vehicle type is 4-wheeler.
 * Reads from sessionData.vehicle_type (set by user in search modal) or user_inputs.
 */
export function isFourWheeler(sessionData: any): boolean {
  const vehicleType = sessionData.vehicle_type || sessionData.user_inputs?.vehicle_type;
  return vehicleType === '4-wheeler';
}

/**
 * Returns the correct category_ids based on vehicle type.
 * 2-wheeler: ["C1", "C2", "C3"], 4-wheeler: ["C4", "C5", "C6"]
 */
export function getCategoryIdsForVehicleType(sessionData: any): string[] {
  return isFourWheeler(sessionData) ? ['C4', 'C5', 'C6'] : ['C1', 'C2', 'C3'];
}

/**
 * Returns the item descriptor based on vehicle type.
 */
export function getItemDescriptorForVehicleType(sessionData: any): { name: string; short_desc: string } {
  return isFourWheeler(sessionData)
    ? {
        name: '4-Wheeler 3rd Party Motor Insurance',
        short_desc: '4-Wheeler 3rd Party Motor Insurance by ABC Insurance Provider',
      }
    : {
        name: '2-Wheeler 3rd Party Motor Insurance',
        short_desc: '2-Wheeler 3rd Party Motor Insurance by ABC Insurance Provider',
      };
}

/**
 * Returns the base price for the vehicle type.
 * 4-wheeler has higher premium than 2-wheeler.
 */
export function getBasePriceForVehicleType(sessionData: any): string {
  return isFourWheeler(sessionData) ? '18750' : '12531';
}

/**
 * Applies vehicle-type overrides (2-wheeler vs 4-wheeler) to all items in the payload.
 * Updates category_ids, descriptor (name, short_desc), and price based on vehicle_type.
 * Works for both catalog items (on_search) and order items (on_select, init, etc.)
 */
export function applyFlowTypeOverrides(existingPayload: any, sessionData: any): void {
  const flowCategoryIds = getCategoryIdsForVehicleType(sessionData);
  const descriptor = getItemDescriptorForVehicleType(sessionData);
  const basePrice = getBasePriceForVehicleType(sessionData);

  // Handle order items (on_select, init, on_init, confirm, etc.)
  const orderItems = existingPayload.message?.order?.items;
  if (orderItems) {
    orderItems.forEach((item: any) => {
      item.category_ids = flowCategoryIds;
      if (item.descriptor) {
        item.descriptor.name = descriptor.name;
        item.descriptor.short_desc = descriptor.short_desc;
      }
      if (item.price) {
        item.price.value = basePrice;
      }
    });
  }

  // Note: catalog items (on_search) are NOT overridden here — the catalog should
  // return both 2-wheeler and 4-wheeler items as-is from the default YAML.

  // Save to session for downstream
  sessionData.selected_category_ids = flowCategoryIds;
}

/**
 * Updates PROPOSAL_ID tag value in items with the given quote ID.
 */
export function updateProposalIdTag(
  existingPayload: any,
  quoteId: string | undefined
): void {
  if (!quoteId) return;
  const items = existingPayload.message?.order?.items;
  if (items) {
    items.forEach((item: any) => {
      item.tags?.forEach((tag: any) => {
        tag.list?.forEach((listItem: any) => {
          if (listItem.descriptor?.code === 'PROPOSAL_ID') {
            listItem.value = quoteId;
          }
        });
      });
    });
  }
}
