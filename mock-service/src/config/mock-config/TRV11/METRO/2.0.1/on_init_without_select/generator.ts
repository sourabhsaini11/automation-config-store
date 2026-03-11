import { SessionData } from "../../../session-types";

const generateRandomId = () => {
	return Math.random().toString(36).substring(2, 15);
};
const transformPayments = (payments: any) => {
	return payments.map((payment: any) => {
		return {
			id: generateRandomId(),
			collected_by: payment.collected_by,
			status: "NOT-PAID",
			type: "PRE-ORDER",
			params: {
				bank_code: "XXXXXXXX",
				bank_account_number: "xxxxxxxxxxxxxx",
			},
			tags: modifyTags(payment.tags),
		};
	});
};

const modifyTags = (tags: any) => {
	return tags.map((tag: any) => {
		if (tag.descriptor?.code === "SETTLEMENT_TERMS") {
			return {
				...tag,
				list: [
					...tag.list,
					{
						descriptor: {
							code: "SETTLEMENT_WINDOW"
						},
						value: "P30D"
					},
					{
						descriptor: {
							code: "SETTLEMENT_BASIS"
						},
						value: "INVOICE_RECEIPT"
					}
				]
			}
		}
		return tag
	})
}
const createQuoteFromItems = (items: any): any => {
	let totalPrice = 0; // Initialize total price

	const breakup = items.map((item: any) => {
		const itemTotalPrice =
			Number(item.price.value) * item.quantity.selected.count; // Calculate item total price
		totalPrice += itemTotalPrice; // Add to total price

		return {
			title: "BASE_FARE",
			item: {
				id: item.id,
				price: {
					currency: item.price.currency,
					value: item.price.value,
				},
				quantity: {
					selected: {
						count: item.quantity.selected.count,
					},
				},
			},
			price: {
				currency: item.price.currency,
				value: itemTotalPrice.toFixed(2),
			},
		};
	});

	return {
		price: {
			value: totalPrice.toFixed(2), // Total price as a string with two decimal places
			currency: items[0]?.price.currency || "INR", // Use currency from the first item or default to "INR"
		},
		breakup,
	};
};
function createAndAppendFulfillments(items: any[], fulfillments: any[]): void {
	items.forEach((item) => {

		// item.fulfillment_ids =
		item.fulfillment_ids.forEach((parentFulfillmentId: string) => {
			// Get the parent fulfillment object from the fulfillments array
			const parentFulfillment = fulfillments.find(
				(f) => f.id === parentFulfillmentId
			);
			if (parentFulfillment) {
				// Get the quantity based on the selected count
				const quantity = item.quantity.selected.count;

				for (let i = 0; i < quantity; i++) {
					// Create new fulfillment object
					const newFulfillment = {
						id: `F${Math.random().toString(36).substring(2, 9)}`, // Unique ID for new fulfillment
						type: "TICKET",
						tags: [
							{
								descriptor: {
									code: "INFO",
								},
								list: [
									{
										descriptor: {
											code: "PARENT_ID",
										},
										value: parentFulfillment.id, // Set parent ID
									},
								],
							},
						],
					};

					// Append the new fulfillment to the fulfillments array
					fulfillments.push(newFulfillment);

					// Append the new fulfillment's id to the item's fulfillment_ids
					item.fulfillment_ids.push(newFulfillment.id);
				}
			}
		});
	});
}
function updateProviderTimestamp(payload: any) {
	const now = new Date();
	const istNow = new Date(now.getTime());
	const y = istNow.getFullYear();
	const m = istNow.getMonth();
	const d = istNow.getDate();
	const startIST = new Date(Date.UTC(y, m, d, 5 - 5, 30, 0));
	const endIST = new Date(Date.UTC(y, m, d, 23 - 5, 30, 0));
	const provider = payload?.message?.order?.provider;
	provider.time.range.start = startIST.toISOString();
	provider.time.range.end = endIST.toISOString();
	return payload;
}

function getUniqueFulfillmentIdsAndFilterFulfillments(
	items: any[],
	fulfillments: any[]
): any[] {
	if (!Array.isArray(fulfillments)) {
		fulfillments = fulfillments ? [fulfillments] : [];
	}
	// Step 1: Get all unique fulfillment IDs from the items
	const fulfillmentIds = items
		.flatMap((item) => item.fulfillment_ids) // Flatten the fulfillment_ids arrays
		.filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

	// Step 2: Filter the fulfillments based on the unique fulfillment IDs
	const filteredFulfillments = fulfillments.filter(
		(fulfillment) => fulfillmentIds.includes(fulfillment.id) // Check if fulfillment.id is in the unique fulfillmentIds list
	);

	return filteredFulfillments;
}

const filterItemsBySelectedIds = (
	items: any[],
	selectedIds: string | string[]
): any[] => {
	// Convert selectedIds to an array if it's a string
	const idsToFilter = Array.isArray(selectedIds) ? selectedIds : [selectedIds];

	// Filter the items array based on the presence of ids in selectedIds
	return items.filter((item) => idsToFilter.includes(item.id));
};
export async function onInitGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	existingPayload = updateProviderTimestamp(existingPayload)
	let items = filterItemsBySelectedIds(
		sessionData.items,
		sessionData.selected_item_ids
	);
	let fulfillments = getUniqueFulfillmentIdsAndFilterFulfillments(
		sessionData.items,
		sessionData.fulfillments
	);
	const ids_with_quantities = {
		items: sessionData.selected_items.reduce((acc: any, item: any) => {
			acc[item.id] = item.quantity.selected.count;
			return acc;
		}, {}),
	};
	const updatedItems = sessionData.items.map((item: any) => ({
		...item,
		quantity: {
			selected: {
				count: ids_with_quantities["items"][item.id] ?? 0, // Default to 0 if not in the mapping
			},
		},
	})).filter((item) => item.quantity.selected.count > 0);
	items = updatedItems;
	createAndAppendFulfillments(updatedItems, fulfillments);
	const quote = createQuoteFromItems(updatedItems);
	const payments = transformPayments(sessionData.payments)
	existingPayload.message.order.payments = payments;
	if (sessionData.items.length > 0) {
		existingPayload.message.order.items = items;
	}
	if (sessionData.billing) {
		existingPayload.message.order.billing = sessionData.billing;
	}
	if (sessionData.fulfillments.length > 0) {
		existingPayload.message.order.fulfillments = fulfillments;
	}
	if (sessionData.provider) {
		existingPayload.message.order.provider = sessionData.provider
	}
	existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
		if (fulfillment.type === "ROUTE") {
			fulfillment.type = "TRIP";
		}
	})
	existingPayload.message.order.quote = quote

	return existingPayload;
}
