import { SessionData } from "../../session-types";

export async function statusGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  if (sessionData.order_id) {
    existingPayload.message.order_id = sessionData.order_id;
  }
  if (sessionData?.flow_id === "Technical_cancellation_flow") {
    existingPayload.message = {
      ref_id: existingPayload.context.transaction_id,
    };
  }
  return existingPayload;
}
