/**
 * Select Generator for TRV14 using user_inputs structure
 * 
 * Logic:
 * 1. Process items from sessionData.user_inputs.items
 * 2. Use count from each item or default to 1
 * 3. Include add-ons if they exist on the item
 * 4. Use fulfillment from user_inputs
 * 5. Use provider from user_inputs
 * 6. Update fulfillment timestamps to match context timestamp
 */

/**
 * Creates item payload with quantity and add-ons from user_inputs structure
 * @param userInputItem - The item object from sessionData.user_inputs.items
 * @returns Formatted item payload for the select request
 */
function createItemPayload(userInputItem: any): any {
  const itemPayload: any = {
    id: userInputItem.itemId,
    quantity: {
      selected: {
        count: userInputItem.quantity || userInputItem.count || 1
      }
    }
  };

  // Add parent_item_id if it exists
  if (userInputItem.parentItemId) {
    itemPayload.parent_item_id = userInputItem.parentItemId;
  }

  // Add add-ons if they exist
  if (userInputItem.addOns && Array.isArray(userInputItem.addOns) && userInputItem.addOns.length > 0) {
    itemPayload.add_ons = userInputItem.addOns.map((addOnId: string) => ({
      id: addOnId,
      quantity: {
        selected: {
          count: userInputItem?.addOnsQuantity
        }
      }
    }));
  }

  return itemPayload;
}

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {

  const userInputs = sessionData.user_inputs;

  const itemPayloads = userInputs.items.map((item: any) => createItemPayload(item));

  existingPayload.message.order.items = itemPayloads;

  existingPayload.message.order.provider.id = userInputs.provider;

  existingPayload.message.order.fulfillments = userInputs?.fulfillments


  return existingPayload;
}

