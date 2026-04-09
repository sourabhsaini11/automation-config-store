import { randomUUID } from "crypto";
import { SessionData } from "../../../session-types";

export async function selectSIPDefaultGenerator(
    existingPayload: any,
    sessionData: SessionData
) {

    console.log("=== select_SIP Generator Start ===");
    if (existingPayload.context) {
        existingPayload.context.timestamp = new Date().toISOString();
    }

    if (sessionData.transaction_id && existingPayload.context) {
        existingPayload.context.transaction_id = sessionData.transaction_id;
    }
    if (sessionData.message_id && existingPayload.context) {
        existingPayload.context.message_id = randomUUID();
    }
    const rawData = sessionData?.user_inputs?.data;


    console.log("=== select_SIP Generator End ===");
    return existingPayload;
}
