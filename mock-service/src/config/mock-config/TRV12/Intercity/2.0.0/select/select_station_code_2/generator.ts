import { SessionData } from "../../../../session-types";

export async function selectGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;
  existingPayload.message.order.fulfillments = transformFulfillments(
    sessionData.on_select_fulfillments?.flat(),
    sessionData?.on_select_fulfillments_tags,
    sessionData
  );

  existingPayload.message.order.items = [sessionData.select_items];
  existingPayload.message.order.provider = { id: sessionData.provider_id };

  return existingPayload;
}

function transformFulfillments(
  fulfillments: any[],
  ticketTags: any[],
  sessionData: SessionData
) {
  const seatItems = Array.isArray(sessionData?.user_inputs?.items)
    ? sessionData.user_inputs.items
    : [];

  return fulfillments.map((f, index) => {
    if (f.type === "TRIP") {
      return sessionData.select_fulfillments;
    }

    if (f.type === "TICKET") {
      const filteredTags = [ticketTags].map((tag: any) => {
        if (tag?.descriptor?.code === "SEAT_GRID") {
          const filteredList = tag.list
            .filter(
              (item: any) =>
                item.descriptor.code === "NUMBER" ||
                item.descriptor.code === "ITEM_ID"
            )
            .map((item: any) => {
              if (item.descriptor.code === "NUMBER") {
                const seatData = seatItems[index - 1];
                return {
                  ...item,
                  value: seatData?.seatNumber || item.value,
                };
              }
              return item;
            });

          return {
            descriptor: tag.descriptor,
            list: [
              ...filteredList,
              {
                descriptor: { code: "SELECTED" },
                value: "true",
              },
            ],
          };
        }
        return tag;
      });

      return {
        id: f.id,
        tags: filteredTags,
      };
    }

    return f;
  });
}
