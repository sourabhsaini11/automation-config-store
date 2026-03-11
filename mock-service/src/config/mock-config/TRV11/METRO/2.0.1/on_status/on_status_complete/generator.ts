import { SessionData } from "../../../../session-types";
function markAllAuthorizationsClaimed(order: any): void {
	const fulfillments = order?.fulfillments;

	if (!Array.isArray(fulfillments)) return;

	for (let i = 0; i < fulfillments.length; i++) {
		const fulfillment = fulfillments[i];

		if (Array.isArray(fulfillment.stops)) {
			for (let j = 0; j < fulfillment.stops.length; j++) {
				const stop = fulfillment.stops[j];

				if (stop.authorization) {
					stop.authorization.status = "CLAIMED";
				}
			}
		}
	}
}
export async function onStatusCompleteGenerator(existingPayload: any, sessionData: SessionData) {
	if (sessionData.updated_payments.length > 0) {
		existingPayload.message.order.payments = sessionData.updated_payments;
		existingPayload.message.order.payments[0].params.amount = sessionData.price
	}

	if (sessionData.items.length > 0) {
		existingPayload.message.order.items = sessionData.items;
	}
	if (sessionData.billing) {
		existingPayload.message.order.billing = sessionData.billing;
	}
	if (sessionData.fulfillments.length > 0) {
		existingPayload.message.order.fulfillments = sessionData.fulfillments;
		markAllAuthorizationsClaimed(existingPayload.message.order)

	}
	if (sessionData.order_id) {
		existingPayload.message.order.id = sessionData.order_id;
	}
	if (sessionData.quote != null) {
		existingPayload.message.order.quote = sessionData.quote
	}
	if (sessionData.provider) {
		existingPayload.message.order.provider = sessionData.provider
	}
	existingPayload.message.order.status = "COMPLETED"
	const now = new Date().toISOString();
	existingPayload.message.order.created_at = sessionData.created_at
	existingPayload.message.order.updated_at = now
	return existingPayload;
}