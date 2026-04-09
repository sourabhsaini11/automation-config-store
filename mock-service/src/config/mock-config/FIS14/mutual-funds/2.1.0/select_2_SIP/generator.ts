import { randomUUID } from "crypto";
import { SessionData } from "../../../session-types";

export async function select_2SIPDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== select_2_SIP Generator Start ===");

    // Update timestamp
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    // Update transaction_id and message_id from session
    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = randomUUID();
    }

    // Map provider and item IDs from session
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
    console.log("=== select_2_SIP Generator End ===");
    return existingPayload;
}
