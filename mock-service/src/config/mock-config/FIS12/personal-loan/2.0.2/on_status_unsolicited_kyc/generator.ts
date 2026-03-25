import { randomUUID } from 'crypto';

export async function onStatusUnsolicitedKYCGenerator(existingPayload: any, sessionData: any) {
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }
    existingPayload.message.order = sessionData.order
    console.log("sessionData for on_status_unsolicited_esign", sessionData);

    // Read submission_id from the loan agreement e-sign DYNAMIC_FORM
    const submission_id = sessionData?.form_data?.Ekyc_details_form?.form_submission_id;
    console.log("form_data loan_agreement_esign_form ------->", sessionData?.form_data?.Ekyc_details_form);
    const form_status = sessionData?.form_data?.Ekyc_details_form?.idType;
    const item = existingPayload.message.order.items[0];
    console.log("form_status", form_status);
    console.log("submission_id", submission_id);
    item.xinput = {
        "form": {
            "id": "ekyc_details_da5c79a5-3348-4942-9154-eb571f847ad8"
        },
        "form_response": {
            "status": "APPROVED",
            "submission_id": "e9764f76-27e1-4be5-894e-e228407b683d"
        }
    }
    if (item.xinput?.form_response) {
        if (form_status) {
            item.xinput.form_response.status = "APPROVED";
        }
        if (submission_id) {
            item.xinput.form_response.submission_id = submission_id;
        }
    }
    // Update transaction_id from session data (carry-forward mapping)
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }

    // Generate NEW message_id for unsolicited response (must be unique)
    if (existingPayload.context) {
        existingPayload.context.message_id = randomUUID();
        console.log("Generated new message_id for unsolicited on_status (esign):", existingPayload.context.message_id);
    }

    // Set form ID from session — on_init_3 generates esign_form_<uuid> and saves it as form_id
    if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
        const esignFormId = sessionData.form_id || "F06"; // fallback to F06 if not saved
        existingPayload.message.order.items[0].xinput.form.id = esignFormId;
        console.log("[on_status_unsolicited_esign] Updated form.id:", esignFormId);
    }

    // Only override submission_id if we have a real value from the esign form submission
    if (submission_id && existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
        existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
        console.log("[on_status_unsolicited_esign] Updated submission_id:", submission_id);
    }

    // Carry forward payments from session data (preserves dynamically generated installment IDs)
    const savedPayments = sessionData.order?.payments || sessionData.payments;
    if (Array.isArray(savedPayments) && savedPayments.length > 0 && existingPayload.message?.order) {
        existingPayload.message.order.payments = savedPayments;
        console.log("Carried forward payments from session (installment IDs preserved)");
    }

    return existingPayload;
}
