import { v4 as uuidv4 } from "uuid";

export async function onStatusGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  if (sessionData.order_id)
    existingPayload.message.order.id = sessionData.order_id;
  existingPayload.message.order.status = "ACTIVE";
  existingPayload.message.order.items = [sessionData.on_select_items];
  existingPayload.message.order.provider = sessionData.on_init_provider;
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms[0];
  existingPayload.message.order.quote = sessionData.quote;
  existingPayload.message.order.payments = sessionData.payments;
  existingPayload.message.order.fulfillments = sessionData.fulfillments;
  existingPayload.message.order.created_at = sessionData?.created_at ?? new Date().toISOString()
  existingPayload.message.order.updated_at = existingPayload?.context?.timestamp ?? new Date().toISOString()

  return existingPayload;
}
