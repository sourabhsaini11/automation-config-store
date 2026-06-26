export async function onCancelConfirmUserCancellationGenerator(existingPayload: any, sessionData: any) {
  if(sessionData.order){
    existingPayload.message.order = sessionData.order;
  }

  existingPayload.message.order.status = "CANCELLED";

  // Ensure created_at and updated_at are set for confirm cancellation (on_cancel2)
  const createdAt = sessionData.created_at || sessionData.order?.created_at || existingPayload.context.timestamp;
  existingPayload.message.order.created_at = createdAt;
  existingPayload.message.order.updated_at = existingPayload.context.timestamp;

  if(sessionData.cancellation_reason_id){
    existingPayload.message.order.cancellation = {
      "cancelled_by": "CONSUMER",
      "reason": {
        "descriptor": {
          "code": sessionData.cancellation_reason_id
        }
      }
    }
  }

  return existingPayload;} 