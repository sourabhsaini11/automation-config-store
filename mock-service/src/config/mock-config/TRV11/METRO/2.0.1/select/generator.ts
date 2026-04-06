

export async function selectGenerator(existingPayload: any, sessionData: any) {
	const userInput = sessionData.user_inputs


	sessionData.selected_ids = Array.isArray(sessionData.selected_ids)
		? sessionData.selected_ids
		: [sessionData.selected_ids || "I1"];


	if (userInput.items?.length > 0) {
		existingPayload.message.order.items = userInput?.items;
	}
	if (sessionData.provider_id) {
		existingPayload.message.order.provider.id = sessionData.provider_id
	}
	return existingPayload;
}
