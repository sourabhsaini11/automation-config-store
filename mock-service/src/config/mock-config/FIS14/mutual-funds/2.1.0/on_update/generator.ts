import { randomUUID } from 'crypto';
import { SessionData } from "../../../session-types";

export async function on_updateDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== on_update Generator Start ===");

    // Generate unique order ID
    if (existingPayload.message?.order) {
        existingPayload.message.order.id = `mfpp_${randomUUID().substring(0, 13)}`;
    }

    // Generate folio number for new folio case
    if (existingPayload.message?.order?.fulfillments?.[0]?.customer?.person?.creds) {
        const creds = existingPayload.message.order.fulfillments[0].customer.person.creds;
        const folioCred = creds.find((c: any) => c.type === 'FOLIO');

        if (folioCred) {
            // Generate folio number or use from session
            folioCred.id = sessionData.folio_number || `${Math.floor(10000000 + Math.random() * 90000000)}/${Math.floor(10 + Math.random() * 90)}`;
        }
    }

    // Update payment IDs
    if (existingPayload.message?.order?.payments) {
        existingPayload.message.order.payments.forEach((payment: any) => {
            if (!payment.id || payment.id === 'pmt_123') {
                payment.id = `pmt_${randomUUID().substring(0, 10)}`;
            }
        });
    }


    // Update fulfillment type based on flow_id
    if (sessionData.flow_id && existingPayload.message?.order?.fulfillments?.[0]) {
        if (sessionData.flow_id.toLowerCase().includes('lumpsum')) {
            existingPayload.message.order.fulfillments[0].type = 'LUMPSUM';
            console.log("Updated fulfillment type to LUMPSUM based on flow_id");
        }
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

    console.log("=== on_update Generator End ===");
    return existingPayload;
}
