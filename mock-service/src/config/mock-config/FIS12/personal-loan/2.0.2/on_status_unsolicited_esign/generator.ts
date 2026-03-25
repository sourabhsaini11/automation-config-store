import { randomUUID } from 'crypto';

export async function onStatusUnsolicitedEsignGenerator(existingPayload: any, sessionData: any) {
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    console.log("sessionData for on_status_unsolicited_esign", sessionData);

    // Read submission_id from the loan agreement e-sign DYNAMIC_FORM
    const submission_id = sessionData?.form_data?.loan_agreement_esign_form?.form_submission_id;
    console.log("form_data loan_agreement_esign_form ------->", sessionData?.form_data?.loan_agreement_esign_form);
    const form_status = sessionData?.form_data?.loan_agreement_esign_form?.idType;
    const item = existingPayload.message.order.items[0];
    console.log("form_status", form_status);
    console.log("submission_id", submission_id);
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

    // Update order ID from session data if available
    if (sessionData.order_id) {
        existingPayload.message = existingPayload.message || {};
        existingPayload.message.order = existingPayload.message.order || {};
        existingPayload.message.order.id = sessionData.order_id;
    }

    // Update provider information from session data
    if (sessionData.provider_id) {
        existingPayload.message = existingPayload.message || {};
        existingPayload.message.order = existingPayload.message.order || {};
        existingPayload.message.order.provider = existingPayload.message.order.provider || {};
        existingPayload.message.order.provider.id = sessionData.provider_id;
    }

    // Update item.id from session data
    const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].id = selectedItem.id;
        console.log("Updated item.id:", selectedItem.id);
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

    // Update customer name in fulfillments if available
    if (sessionData.customer_name && existingPayload.message?.order?.fulfillments?.[0]?.customer?.person) {
        existingPayload.message.order.fulfillments[0].customer.person.name = sessionData.customer_name;
    }

    // Carry forward payments from session data (preserves dynamically generated installment IDs)
    const savedPayments = sessionData.order?.payments || sessionData.payments;
    if (Array.isArray(savedPayments) && savedPayments.length > 0 && existingPayload.message?.order) {
        existingPayload.message.order.payments = savedPayments;
        console.log("Carried forward payments from session (installment IDs preserved)");
    }

    // Update quote.id from session data
    if (existingPayload.message?.order?.quote) {
        if (sessionData.quote_id) {
            existingPayload.message.order.quote.id = sessionData.quote_id;
        } else if (sessionData.order?.quote?.id) {
            existingPayload.message.order.quote.id = sessionData.order.quote.id;
        }
    }

    // Update quote amount if provided
    if (sessionData.quote_amount && existingPayload.message?.order?.quote) {
        existingPayload.message.order.quote.price.value = sessionData.quote_amount;
    }

    // Update loan amount in items if provided
    if (sessionData.loan_amount && existingPayload.message?.order?.items?.[0]) {
        existingPayload.message.order.items[0].price.value = sessionData.loan_amount;
    }

    return existingPayload;
}
