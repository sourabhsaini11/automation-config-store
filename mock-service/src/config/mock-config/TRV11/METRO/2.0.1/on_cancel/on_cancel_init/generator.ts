export async function onCancelInitGenerator(existingPayload: any, sessionData: any) {
	const now = new Date().toISOString();
	if (sessionData.updated_payments.length > 0) {
		existingPayload.message.order.payments = sessionData.updated_payments;
	}

	if (sessionData.items.length > 0) {
		existingPayload.message.order.items = sessionData.items;
	}

	if (sessionData.fulfillments.length > 0) {
		existingPayload.message.order.fulfillments = sessionData.fulfillments;
	}
	if (sessionData.billing) {
		existingPayload.message.order.billing = sessionData.billing;
	}
	if (sessionData.order_id) {
		existingPayload.message.order.id = sessionData.order_id;
	}
	if (sessionData.quote != null) {
		existingPayload.message.order.quote = sessionData.quote
	}
	existingPayload.message.order.cancellation = {
		cancelled_by: "CONSUMER",
		time: now,
		reason: {
			descriptor: {
				"code": sessionData.cancellation_reason_id
			}
		}
	}
	if (sessionData.provider) {
		existingPayload.message.order.provider = sessionData.provider
	}
	existingPayload.message.order.status = "CANCELLATION_INITIATED"
	existingPayload.message.order.created_at = sessionData.created_at
	existingPayload.message.order.updated_at = now
	return existingPayload;
}