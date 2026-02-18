import { SessionData } from "../../../session-types";

export async function searchDefaultGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	// Remove BPP context fields (not needed in search)
	delete existingPayload.context.bpp_uri;
	delete existingPayload.context.bpp_id;

	// Set start and end date dynamically
	const now = new Date();
	const end = new Date(now);
	end.setDate(now.getDate() + 2);
	if (
		existingPayload.message?.intent?.fulfillment?.stops?.[0]?.time?.range
	) {
		existingPayload.message.intent.fulfillment.stops[0].time.range.start = now.toISOString();
		existingPayload.message.intent.fulfillment.stops[0].time.range.end = end.toISOString();
	}

	// Set city code from user inputs if available
	if (sessionData.user_inputs?.city_code) {
		existingPayload.context.location.city.code = sessionData.user_inputs.city_code;
	}




	const submissionId = sessionData.form_data?.form_submission_id
		|| sessionData.individual_information_form;

	  const form_status = sessionData?.form_data?.individual_information_form?.idType;	

	 
	// Carry forward provider.id from session data
	if (sessionData.selected_provider?.id && existingPayload.message?.intent?.provider) {
		existingPayload.message.intent.provider.id = sessionData.selected_provider.id;
	}

	// Carry forward item.id from session data
	const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
	if (selectedItem?.id && existingPayload.message?.intent?.provider?.items?.[0]) {
		existingPayload.message.intent.provider.items[0].id = selectedItem.id;
	}

	// Update the form_response submission_id in the payload
	if (submissionId && existingPayload.message?.intent?.provider?.items?.[0]?.xinput?.form_response) {
		existingPayload.message.intent.provider.items[0].xinput.form_response.submission_id = submissionId;
		existingPayload.message.intent.provider.items[0].xinput.form_response.status = form_status;
		existingPayload.message.intent.provider.items[0].xinput.form.id = sessionData.form_id || "F01";
	}


	return existingPayload;
} 