import { SessionData } from "../../../session-types";
import { resolveSessionIds } from '../id-helper';

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
		|| sessionData.family_information_form

	  const form_status = sessionData?.form_data?.pan_details_form?.idType;
	const ids = resolveSessionIds(sessionData);

	// Carry forward provider.id from session data
	if (ids.providerId && existingPayload.message?.intent?.provider) {
		existingPayload.message.intent.provider.id = ids.providerId;
	}

	// Carry forward item.id from session data
	if (ids.childItemId && existingPayload.message?.intent?.provider?.items?.[0]) {
		existingPayload.message.intent.provider.items[0].id = ids.childItemId;
	}

	// Update the form_response submission_id in the payload
	if (submissionId && existingPayload.message?.intent?.provider?.items?.[0]?.xinput?.form_response) {
		existingPayload.message.intent.provider.items[0].xinput.form_response.submission_id = submissionId;
	}


	return existingPayload;
} 