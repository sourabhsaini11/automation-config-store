import { randomUUID } from "crypto";
import { injectSettlementAmount } from '../utils/settlement-utils';

export async function onUpdateForeclosureUnsolicitedDefaultGenerator(existingPayload: any, sessionData: any) {
    // Unsolicited FORECLOSURE on_update generator (sent after main foreclosure on_update)
    existingPayload.context = existingPayload.context || {};
    existingPayload.context.timestamp = new Date().toISOString();
    if (sessionData?.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
    if (sessionData?.message_id) existingPayload.context.message_id = sessionData.message_id;

    // Read payment status from payment_url_form submission (same pattern as verification_status in on_status)
    const paymentStatus = sessionData?.form_data?.payment_url_form?.idType || 'PAID';
    const paymentSubmissionId = sessionData?.form_data?.payment_url_form?.form_submission_id;
    console.log('[foreclosure unsolicited] paymentStatus from form_data:', paymentStatus, 'submissionId:', paymentSubmissionId);

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

    // CRITICAL: Merge installments AND ON_ORDER payment from session data
    // IMPORTANT: Maintain the correct payment order from default.yaml
    // Expected order: FORECLOSURE payment, ON_ORDER payment, then installments
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

        // Extract FORECLOSURE payment from session (preserve unique ID from on_update_foreclosure)
        const foreclosureFromSession = sessionPayments.find(
            (p: any) => p.type === 'POST_FULFILLMENT' && p.time?.label === 'FORECLOSURE'
        );

        // Rebuild payments array in correct order
        const rebuiltPayments: any[] = [];

        // 1. Add FORECLOSURE payment (from session, use form-submitted status)
        if (foreclosureFromSession) {
            const { url, ...foreclosureWithoutUrl } = foreclosureFromSession;
            rebuiltPayments.push({
                ...foreclosureWithoutUrl,
                status: paymentStatus  // Dynamic: PAID or NOT-PAID from payment_url_form
            });
            console.log(`Preserved FORECLOSURE payment, updated status to ${paymentStatus}, removed url`);
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

        // 3. Add installments — for FORECLOSURE, ALL installments become DEFERRED
        //    (the loan is foreclosed, so all remaining installments are deferred)
        if (installmentsFromSession.length > 0) {
            console.log(`Found ${installmentsFromSession.length} installments for foreclosure unsolicited — marking ALL as DEFERRED`);

            const updatedInstallments = installmentsFromSession.map((installment: any) => ({
                ...installment,
                status: 'DEFERRED'  // Foreclosure: ALL installments deferred
            }));

            rebuiltPayments.push(...updatedInstallments);
            console.log('All installments marked as DEFERRED for foreclosure');
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

    // Update quote.id from session data
    if (existingPayload.message?.order?.quote) {
        order.quote.price = sessionData.order.quote.price;

        if (sessionData.quote_id) {
            existingPayload.message.order.quote.id = sessionData.quote_id;
        } else if (sessionData.order?.quote?.id) {
            existingPayload.message.order.quote.id = sessionData.order.quote.id;
        }
    }

    // Update fulfillment state to COMPLETED for unsolicited callback
    if (order.fulfillments?.[0]?.state?.descriptor) {
        order.fulfillments[0].state.descriptor.code = "COMPLETED";
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


