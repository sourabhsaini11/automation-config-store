export async function onUpdateGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.message.order.created_at = sessionData?.created_at ?? new Date().toISOString()
  existingPayload.message.order.updated_at = existingPayload?.context?.timestamp ?? new Date().toISOString()
  if (sessionData?.order_id)
    existingPayload.message.order.id = sessionData.order_id;
  return existingPayload;
}
