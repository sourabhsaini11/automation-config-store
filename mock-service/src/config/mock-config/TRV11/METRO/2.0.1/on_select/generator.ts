import { SessionData } from "../../../session-types";

const createQuoteFromItems = (items: any): any => {
	let totalPrice = 0;

	const breakup = items.map((item: any) => {
		const itemTotalPrice =
			Number(item.price.value) * item.quantity.selected.count;
		totalPrice += itemTotalPrice;

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
			value: totalPrice.toFixed(2),
			currency: items[0]?.price.currency || "INR",
		},
		breakup,
	};
};

function createAndAppendFulfillments(items: any[], fulfillments: any[]): void {
	items.forEach((item) => {
		const originalFulfillmentIds = [...item.fulfillment_ids];

		originalFulfillmentIds.forEach((parentFulfillmentId: string) => {
			const parentFulfillment = fulfillments.find(
				(f) => f.id === parentFulfillmentId
			);

			if (parentFulfillment && parentFulfillment.type !== "TICKET") {
				const quantity = item.quantity.selected.count;

				for (let i = 0; i < quantity; i++) {
					const newFulfillment = {
						id: `F${Math.random().toString(36).substring(2, 9)}`,
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
										value: parentFulfillment.id,
									},
								],
							},
						],
					};

					fulfillments.push(newFulfillment);
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
	selectedItems: any[],
	fulfillments: any[]
): any[] {
	if (!Array.isArray(fulfillments)) {
		fulfillments = fulfillments ? [fulfillments] : [];
	}

	const fulfillmentIds = selectedItems
		.flatMap((item) => item.fulfillment_ids)
		.filter((value, index, self) => self.indexOf(value) === index);

	const filteredFulfillments = fulfillments.filter(
		(fulfillment) =>
			fulfillmentIds.includes(fulfillment.id) &&
			fulfillment.type !== "TICKET"
	);

	return filteredFulfillments;
}

const filterItemsBySelectedIds = (
	items: any[],
	selectedIds: string | string[]
): any[] => {
	const idsToFilter = Array.isArray(selectedIds) ? selectedIds : [selectedIds];
	return items.filter((item) => idsToFilter.includes(item.id));
};

export async function onSelectGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	existingPayload = updateProviderTimestamp(existingPayload);

	const ids_with_quantities = {
		items: sessionData.selected_items.reduce((acc: any, item: any) => {
			acc[item.id] = item.quantity.selected.count;
			return acc;
		}, {}),
	};

	const updatedItems = sessionData.items
		.map((item: any) => ({
			...item,
			fulfillment_ids: (item.fulfillment_ids as string[]).filter((fid) => {
				const f = (sessionData.fulfillments as any[]).find((fl) => fl.id === fid);
				return !f || f.type !== "TICKET";
			}),
			quantity: {
				selected: {
					count: ids_with_quantities["items"][item.id] ?? 0,
				},
			},
		}))
		.filter((item: any) => item.quantity.selected.count > 0);

	const fulfillments = getUniqueFulfillmentIdsAndFilterFulfillments(
		updatedItems,
		sessionData.fulfillments
	);

	createAndAppendFulfillments(updatedItems, fulfillments);

	const quote = createQuoteFromItems(updatedItems);

	fulfillments.forEach((fulfillment: any) => {
		if (fulfillment.type === "ROUTE") {
			fulfillment.type = "TRIP";
		}
	});

	existingPayload.message.order.items = updatedItems;
	existingPayload.message.order.fulfillments = fulfillments;
	existingPayload.message.order.quote = quote;
	return existingPayload;
}
