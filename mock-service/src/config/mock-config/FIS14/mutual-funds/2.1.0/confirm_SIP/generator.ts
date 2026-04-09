import { randomUUID } from "crypto";
import { SessionData } from "../../../session-types";

export async function confirmSIPDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {
    console.log("=== confirm_SIP Generator Start ===");

    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
        if (sessionData.transaction_id) existingPayload.context.transaction_id = sessionData.transaction_id;
        if (sessionData.message_id) existingPayload.context.message_id = sessionData.message_id;
    }

    console.log("=== confirm_SIP Generator End ===");
    return existingPayload;
}
