export async function onCancelGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.id = sessionData.order_id;
  existingPayload.message.order.cancellation = sessionData.cancellation;
  existingPayload.message.order.status = "CANCELLED";
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms;
  existingPayload.message.order.quote = sessionData.quote;
  existingPayload.message.order.payments = sessionData.payments;
  existingPayload.message.order.fulfillments = sessionData.fulfillments;

    existingPayload.message.order.created_at = sessionData?.created_at ?? new Date().toISOString()
  existingPayload.message.order.updated_at = existingPayload?.context?.timestamp ?? new Date().toISOString()
  return existingPayload;
}
