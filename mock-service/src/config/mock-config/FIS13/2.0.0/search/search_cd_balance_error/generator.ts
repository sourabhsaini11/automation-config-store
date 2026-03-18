import { SessionData } from "../../../session-types";
import { v4 as uuidv4 } from "uuid";
export async function search_cd_balance_error_generator(
    existingPayload: any,
    sessionData: SessionData
) {
    delete existingPayload.context.bpp_uri;
    delete existingPayload.context.bpp_id;
    existingPayload.message.intent.provider.id = uuidv4();

    return existingPayload;
}
