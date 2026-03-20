import { SessionData } from "../../../../session-types";

export async function updateGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;
  existingPayload.message.update_target = "order.fulfillments";
  existingPayload.message.order.id = sessionData.order_id;
  const ticketFulfillment = sessionData.fulfillments?.find(
    (f: any) => f.type === "TICKET"
  );
  existingPayload.message.order.fulfillments = [
    {
      id: ticketFulfillment?.id ?? sessionData.fulfillment_id_on_confirm,
      type: "TICKET",
      state: {
        descriptor: {
          code: "CONFIRM_CANCEL",
        },
      },
    },
  ];
  return existingPayload;
}
