const getRandomItemsWithQuantities = (items: any): any => {
	// Shuffle the array to select random items
	const shuffledItems = items.sort(() => Math.random() - 0.5);

	// Determine a random number of items to pick
	const randomItemCount = Math.floor(Math.random() * items.length) + 1;

	// Pick a random subset of items
	const selectedItems = shuffledItems.slice(0, randomItemCount);

	// Assign random quantities within the minimum and maximum range
	return selectedItems.map((item: any) => {
		const min = item.quantity.minimum.count;
		const max = item.quantity.maximum.count;

		return {
			id: item.id,
			quantity: {
				selected: {
					count: Math.floor(Math.random() * (max - min + 1)) + min, // Random number between min and max (inclusive)
				},
			},
		};
	});
};

const transformToItemFormat = (userInputItems: any[]): any => {
	try {
		return userInputItems.map((item) => ({
			id: item.itemId,
			quantity: {
				selected: {
					count: item.count,
				}
			},
		}));
	} catch (e: any) {
		console.error(e.message);
	}
};
export async function selectGenerator(existingPayload: any, sessionData: any) {
// Note: commits should be uncommits
	const userInputItems = sessionData?.user_inputs?.items;
	const items_min_max = transformToItemFormat(userInputItems);
	const items_chosen = items_min_max;
	if(items_chosen){
		existingPayload.message.order.items = items_chosen;
	}
	if(sessionData.provider_id){
		existingPayload.message.order.provider.id = sessionData.provider_id
	  }
	  const chosenItemsIds = items_min_max.map((item:any) => item.id);
	  const filteredItems = sessionData.items.filter((item:any) => 
		chosenItemsIds.includes(item.id)
	  );
	  const uniqueFulfillmentIds = [
		...new Set(
			filteredItems.flatMap((item:any) => item.fulfillment_ids || [])
		)
	  ];
	  const formattedFulfillmentIds = uniqueFulfillmentIds.map(id => ({ id }));
	  existingPayload.message.order.fulfillments = formattedFulfillmentIds
	return existingPayload;
}
