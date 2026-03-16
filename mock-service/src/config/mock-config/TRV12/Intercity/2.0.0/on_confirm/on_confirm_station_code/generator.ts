import { SessionData } from "../../../../session-types";

export async function onConfirmGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;
  const randomId = Math.random().toString(36).substring(2, 15);
  existingPayload.message.order.id = randomId;
  existingPayload.message.order.status = "ACTIVE";
  existingPayload.message.order.items = [sessionData.on_select_items];
  existingPayload.message.order.provider = sessionData.on_init_provider;
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms?.flat();
  existingPayload.message.order.quote = sessionData.quote;
  existingPayload.message.order.payments = sessionData.payments?.map(
    (p: any) => ({
      ...p,
      status: "PAID",
    })
  );

  existingPayload.message.order.fulfillments =
    sessionData.on_init_fulfillments?.flat().map((f: any) => {
      const updatedFulfillment: any = {
        ...f,
        state: {
          descriptor: {
            code: "CONFIRMED",
          },
        },
      };

      if (f.type === "TRIP" && Array.isArray(f.stops)) {
        updatedFulfillment.stops = f.stops.map((stop: any) => ({
          ...stop,
          authorization: {
            type: "PNR",
            token: "RB3F9K7H",
            status: "UNCLAIMED",
          },
        }));
      }

      return updatedFulfillment;
    });

  const now = new Date().toISOString();
  existingPayload.message.order.created_at = now;
  existingPayload.message.order.updated_at = now;

  return existingPayload;
}
