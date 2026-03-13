import { SessionData } from "../../../../session-types";

export async function onStatusCancelGenerator(existingPayload: any, sessionData: SessionData) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
    existingPayload.message.order.payments[0].params.amount = sessionData.price
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }
  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData?.fulfillments
    existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
      if (fulfillment.type == "TICKET") {
        fulfillment.stops?.forEach((stop: any) => {
          if (stop.authorization) {
            stop.authorization.status = "CLAIMED";
          }
        });
      }
    });

  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote
  }
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider
  }

  if (sessionData.flow_id === "DELAYED_CANCELLATION_FLOW_REJECTED" || sessionData.flow_id === "DELAYED_CANCELLATION_FLOW_REJECTED (W/O Select)") {
    existingPayload.message.order.cancellation = {
      ...existingPayload.message.order.cancellation,
      additional_description: {
        short_desc:
          "Cancellation was rejected by the provider due to some reason.",
      },
    };
  }

  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at
  existingPayload.message.order.updated_at = now
  existingPayload.message.order.status = "COMPLETED"
  return existingPayload;
}