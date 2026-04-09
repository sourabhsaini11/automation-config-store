import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";
import { updateChecklist } from '../utils/updateChecklist';

export async function on_select_2DefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_select_2 Generator Start ===");

    // Update timestamp and IDs
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }


    // Update transaction_id and message_id from session
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = sessionData.message_id;
    }

    // Update provider and item from session
    const selectedProvider = sessionData.selected_provider || sessionData.provider_id;
    if (selectedProvider && existingPayload.message?.order?.provider) {
        if (typeof selectedProvider === 'string') {
            existingPayload.message.order.provider.id = selectedProvider;
        } else if (selectedProvider.id) {
            existingPayload.message.order.provider.id = selectedProvider.id;
        }
    }

    const selectedItem = sessionData.selected_item_id || sessionData.item;
    if (selectedItem && existingPayload.message?.order?.items?.[0]) {
        if (typeof selectedItem === 'string') {
            existingPayload.message.order.items[0].id = selectedItem;
        } else if (selectedItem.id) {
            existingPayload.message.order.items[0].id = selectedItem.id;
        }
    }

    // Generate quote ID
    if (existingPayload.message?.order?.quote) {
        if (!existingPayload.message.order.quote.id || existingPayload.message.order.quote.id.startsWith("QUOTE")) {
            existingPayload.message.order.quote.id = `quote_${randomUUID()}`;
            console.log("Generated quote.id:", existingPayload.message.order.quote.id);
        }
    }

    // Update submission_id from kyc_details_form
    // const submission_id = sessionData?.form_data?.kyc_details_form?.form_submission_id;
    // if (submission_id && existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    //     existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
    // }

    // if (existingPayload.message?.order?.items?.[0]?.xinput) {
    //     existingPayload.message.order.items[0].xinput.head.descriptor.name = "Kyc, enach & esign"
    //     existingPayload.message.order.items[0].xinput.head.headings[1] = "KYC_ENACH_ESIGN"
    // }
    // redirection to be done
    const submission_id = sessionData?.form_data?.E_sign_verification_status?.form_submission_id || sessionData?.E_sign_verification_status

    if (existingPayload.message?.order?.xinput?.form_response) {
        if (submission_id) {
            existingPayload.message.order.xinput.form_response.status = "SUCCESS"

            existingPayload.message.order.xinput.form_response.submission_id = submission_id;
            console.log("Updated form_response with submission_id:", submission_id);
        } else {
            console.warn("⚠️ No submission_id found for E_sign_verification_status");
        }
    }

    // Ensure form ID matches from on_select
    const formId = sessionData?.form_id || "E_sign_verification_status";
    if (existingPayload.message?.order?.xinput?.form) {
        existingPayload.message.order.xinput.form.id = formId
    }


    // Inject quantity.selected.measure from session (saved at select step)
    const lumpsumMeasure = (sessionData as any).lumpsum_measure;
    if (lumpsumMeasure && existingPayload.message?.order?.items?.[0]) {
        if (!existingPayload.message.order.items[0].quantity) {
            existingPayload.message.order.items[0].quantity = {};
        }
        existingPayload.message.order.items[0].quantity.selected = { measure: lumpsumMeasure };
    }

    // Inject fulfillment (with agent/customer creds) from session
    const lumpsumFulfillment = (sessionData as any).lumpsum_fulfillment;
    if (lumpsumFulfillment && existingPayload.message?.order?.fulfillments?.[0]) {
        existingPayload.message.order.fulfillments[0] = {
            ...existingPayload.message.order.fulfillments[0],
            ...lumpsumFulfillment,
        };
    }

    console.log("=== on_select_2 Generator End ===");
    const updates = {
        APPLICATION_FORM_WITH_KYC: sessionData?.kyc_details_form || "",
        KYC: sessionData.verification_status || "",
        ESIGN: sessionData.E_sign_verification_status || ""
    };

    const updatedOrder = updateChecklist(existingPayload.message.order, updates);
    existingPayload.message.order = updatedOrder
    return existingPayload;
}
