import { SessionData } from "../../../../session-types";

export async function selectGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.fulfillments = [sessionData.fulfillment].map(
    (f: any) => ({
      id: f.id,
      stops: f.stops,
    })
  );
  // selected_item
  // if(sessionData?.user_inputs?.selected_item) {
  //   existingPayload.message.order.items = existingPayload.message.order.items.map((item: any) => {
  //     item.id = sessionData?.user_inputs?.selected_item || item?.id;
  //     return item;
  //   });
  // }

  // existingPayload.message.order.items = [
  //   {
  //     id: sessionData.item_ids[0],
  //     quantity: {
  //       selected: {
  //         count: Number(sessionData?.user_inputs?.seat_count) || 1,
  //       },
  //     },
  //   },
  // ];
  const userInputs =
    typeof sessionData?.user_inputs?.data === "string"
      ? JSON.parse(sessionData.user_inputs.data)
      : sessionData?.user_inputs?.data;

  const items =
    userInputs?.items?.map((i: { itemId?: string; count?: number }) => ({
      id: i.itemId ?? "I1",
      quantity: {
        selected: {
          count: i.count ?? 1,
        },
      },
    })) ?? [];

  existingPayload.message.order.items = items;

  existingPayload.message.order.provider = { id: sessionData.provider_id };

  return existingPayload;
}
