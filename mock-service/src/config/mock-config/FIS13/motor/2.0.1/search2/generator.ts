import { SessionData } from "../../../session-types";

export async function searchDefaultGenerator(
	existingPayload: any,
	sessionData: SessionData
) {
	// Remove BPP context fields (not needed in search)
	delete existingPayload.context.bpp_uri;
	delete existingPayload.context.bpp_id;

	// Set city code from user inputs if available
	if (sessionData.user_inputs?.city_code) {
		existingPayload.context.location.city.code = sessionData.user_inputs.city_code;
	}

	// Get vehicle_details_form submission_id from session data
	const submissionId = sessionData.form_data?.vehicle_details_form?.form_submission_id
		|| sessionData.vehicle_details_form;


  const form_status = sessionData?.form_data?.verification_status?.idType;

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
		const item = existingPayload.message.intent.provider.items[0];
		 if (item.xinput?.form) {
         const formId = sessionData.form_id || "F01";
         item.xinput.form.id = formId;
         item.xinput.form_response.status = form_status;
    }
	}

  


	return existingPayload;
} 