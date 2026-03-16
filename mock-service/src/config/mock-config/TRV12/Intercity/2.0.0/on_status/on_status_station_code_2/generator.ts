import { SessionData } from "../../../../session-types";

export async function onStatusGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.id = sessionData.order_id;
  existingPayload.message.order.status = "COMPLETED";
  existingPayload.message.order.items = [sessionData.on_select_items];
  existingPayload.message.order.provider = sessionData.on_init_provider;
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms?.[0];
  existingPayload.message.order.quote = sessionData.quote;
  existingPayload.message.order.payments = sessionData.payments;
  existingPayload.message.order.fulfillments = sessionData.fulfillments.map(
    (f: any) => {
      const updatedFulfillment: any = {
        ...f,
        state: {
          descriptor: {
            code: "COMPLETED",
          },
        },
      };

      if (f.type === "TRIP" && Array.isArray(f.stops)) {
        updatedFulfillment.stops = f.stops.map((stop: any) => ({
          ...stop,
          authorization: {
            ...stop.authorization,
            status: "CLAIMED",
          },
        }));
      }

      return updatedFulfillment;
    }
  );

  existingPayload.message.order.created_at = sessionData?.created_at ?? new Date().toISOString()
  existingPayload.message.order.updated_at = existingPayload?.context?.timestamp ?? new Date().toISOString()
  return existingPayload;
}
