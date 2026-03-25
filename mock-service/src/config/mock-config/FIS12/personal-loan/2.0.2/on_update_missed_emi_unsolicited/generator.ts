import { randomUUID } from "crypto";
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onUpdateMissedEmiUnsolicitedDefaultGenerator(existingPayload: any, sessionData: any) {
    // Unsolicited MISSED EMI on_update generator (sent after main missed EMI on_update)
    existingPayload.context = existingPayload.context || {};
    existingPayload.context.timestamp = new Date().toISOString();
    if (sessionData?.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
    if (sessionData?.message_id) existingPayload.context.message_id = sessionData.message_id;

    // Read payment status from payment_url_form submission (same pattern as verification_status in on_status)
    const paymentStatus = sessionData?.form_data?.payment_url_form?.idType || 'PAID';
    const paymentSubmissionId = sessionData?.form_data?.payment_url_form?.form_submission_id;
    console.log('[missed_emi unsolicited] paymentStatus from form_data:', paymentStatus, 'submissionId:', paymentSubmissionId);

    existingPayload.message = existingPayload.message || {};
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    if (existingPayload.context) {
        existingPayload.context.message_id = generateUUID();
    }

    // If default.yaml doesn't have payments, try carrying forward from session
    if ((!Array.isArray(order.payments) || order.payments.length === 0) && sessionData?.order?.payments?.length) {
        order.payments = sessionData.order.payments;
    }

    // CRITICAL: Merge installments, MISSED_EMI_PAYMENT, AND ON_ORDER payment from session data
    // IMPORTANT: Maintain the correct payment order from default.yaml
    // Expected order: MISSED_EMI_PAYMENT, ON_ORDER payment, then installments
    if (sessionData?.order?.payments?.length > 0) {
        const sessionPayments = sessionData.order.payments;

        // Extract installments from session
        const installmentsFromSession = sessionPayments.filter(
            (p: any) => p.type === 'POST_FULFILLMENT' && p.time?.label === 'INSTALLMENT'
        );

        // Extract ON_ORDER payment from session (preserve unique ID from on_confirm)
        const onOrderFromSession = sessionPayments.find(
            (p: any) => p.type === 'ON_ORDER'
        );

        // Extract MISSED_EMI_PAYMENT from session (preserve unique ID from on_update_missed_emi)
        const missedEmiFromSession = sessionPayments.find(
            (p: any) => p.type === 'POST_FULFILLMENT' && p.time?.label === 'MISSED_EMI_PAYMENT'
        );

        // Rebuild payments array in correct order
        const rebuiltPayments: any[] = [];

        // 1. Add MISSED_EMI_PAYMENT (from session, use form-submitted status)
        if (missedEmiFromSession) {
            const { url, ...missedEmiWithoutUrl } = missedEmiFromSession;
            rebuiltPayments.push({
                ...missedEmiWithoutUrl,
                status: paymentStatus  // Dynamic: PAID or NOT-PAID from payment_url_form
            });
            console.log(`Preserved MISSED_EMI_PAYMENT, updated status to ${paymentStatus}, removed url`);
        }

        // 2. Add ON_ORDER payment (from session, with updated status)
        if (onOrderFromSession) {
            const updatedOnOrder = {
                ...onOrderFromSession,
                status: 'PAID'  // ON_ORDER is always PAID by the time we reach update flows
            };
            rebuiltPayments.push(updatedOnOrder);
            console.log('Preserved ON_ORDER payment from session with unique ID and updated status to PAID');
        }

        // 3. Add installments — only target the FIRST installment (the one that was DELAYED/missed)
        //    All other installments keep their existing status from session
        if (installmentsFromSession.length > 0) {
            console.log(`Found ${installmentsFromSession.length} installments for missed EMI unsolicited — updating index 0 only`);

            const updatedInstallments = installmentsFromSession.map((installment: any, index: number) => {
                if (index === 0) {
                    // Only the first installment (the one that was DELAYED) becomes DEFERRED
                    return { ...installment, status: 'DEFERRED' };
                }
                // All other installments remain exactly as they are from session (NOT-PAID etc.)
                return installment;
            });

            rebuiltPayments.push(...updatedInstallments);
            console.log('Updated installments: index 0 → DEFERRED, rest kept as-is from session');
        }

        // Replace the entire payments array with the correctly ordered one
        order.payments = rebuiltPayments;
    }

    // order.id
    if (sessionData?.order_id) order.id = sessionData.order_id;
    else if (!order.id || order.id === "LOAN_LEAD_ID_OR_SIMILAR_ORDER_ID" || String(order.id).startsWith("LOAN_LEAD_ID")) {
        order.id = `personal_loan_${randomUUID()}`;
    }

    // provider.id
    if (order.provider) {
        if (sessionData?.selected_provider?.id) order.provider.id = sessionData.selected_provider.id;
        else if (!order.provider.id || order.provider.id === "PROVIDER_ID" || String(order.provider.id).startsWith("PROVIDER_ID")) {
            order.provider.id = `personal_loan_provider_${randomUUID()}`;
        }
    }

    // item.id
    const selectedItem = sessionData?.item || (Array.isArray(sessionData?.items) ? sessionData.items[0] : undefined);
    if (order.items?.[0]) {
        order.items[0].price = sessionData.order.items[0].price
        if (selectedItem?.id) order.items[0].id = selectedItem.id;
        else if (!order.items[0].id || String(order.items[0].id).startsWith("ITEM_ID_PERSONAL_LOAN") || String(order.items[0].id).startsWith("ITEM_ID_GOLD_LOAN")) {
            order.items[0].id = `personal_loan_item_${randomUUID()}`;
        }
    }

    // quote.id
    if (order.quote) {
        order.quote.price = sessionData.order.quote.price;
        order.quote.id = sessionData?.quote_id || sessionData?.order?.quote?.id || sessionData?.quote?.id;
    }

    // Update fulfillment state to DISBURSED for unsolicited callback
    if (order.fulfillments?.[0]?.state?.descriptor) {
        order.fulfillments[0].state.descriptor.code = "DISBURSED";
    }

    // Set created_at and updated_at to current timestamp
    if (existingPayload.message?.order) {
        const now = new Date().toISOString();
        existingPayload.message.order.created_at = sessionData.order.created_at;
        existingPayload.message.order.updated_at = now;
        console.log("Set order.created_at and order.updated_at to:", now);
    }

    // Dynamically inject SETTLEMENT_AMOUNT derived from BAP_TERMS fee data
    injectSettlementAmount(existingPayload, sessionData);

    return existingPayload;
}


