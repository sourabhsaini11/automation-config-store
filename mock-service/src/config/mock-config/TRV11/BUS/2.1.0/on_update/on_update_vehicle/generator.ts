import { SessionData } from "../../../../session-types";
function transformFulfillments(fulfillments: any[], sessionData: any): any[] {
  const generateTicketNumber = () => {
    return Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  };

  const buyerFulfillmentMap = new Map(
    (sessionData.buyer_side_fulfillment_ids || []).map((f: any) => [f.id, f]),
  );

  return fulfillments.map((fulfillment) => {
    if (fulfillment.type === "TRIP") {
      return {
        ...fulfillment,
        state: {
          descriptor: {
            code: "ACTIVE",
          },
        },
      };
    }

    if (fulfillment.type === "TICKET") {
      const matchedBuyerSide = buyerFulfillmentMap.get(fulfillment.id) as any;
      const authStatus = matchedBuyerSide?.vehicle ? "CLAIMED" : "UNCLAIMED";
      const buyerSideFulfillment = sessionData?.update_fulfillment.find(
        (f: any) => f.id === fulfillment.id,
      );

      const updatedStops = Array.isArray(fulfillment.stops)
        ? fulfillment.stops.map((stop: any) => {
            if (stop.authorization) {
              return {
                ...stop,
                authorization: {
                  ...stop.authorization,
                  status: "CLAIMED",
                },
              };
            }
            return stop;
          })
        : fulfillment.stops;

      const ticketNumber = generateTicketNumber();

      const updatedTags = Array.isArray(fulfillment.tags)
        ? [...fulfillment.tags]
        : [];

      const ticketInfoTagIndex = updatedTags.findIndex(
        (tag) => tag.descriptor?.code === "TICKET_INFO",
      );

      const ticketInfoEntry = {
        descriptor: {
          code: "NUMBER",
        },
        value: ticketNumber,
      };

      if (ticketInfoTagIndex !== -1) {
        updatedTags[ticketInfoTagIndex].list = [
          ...(updatedTags[ticketInfoTagIndex].list || []),
          ticketInfoEntry,
        ];
      } else {
        updatedTags.push({
          descriptor: {
            code: "TICKET_INFO",
          },
          list: [ticketInfoEntry],
        });
      }

      return {
        ...fulfillment,
        stops: updatedStops,
        tags: updatedTags,
      };
    }

    return fulfillment;
  });
}

export async function onUpdateVehConGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    let index = 0;
    const updateFulfillment = sessionData?.update_fulfillment
      ?.flat()
      ?.map((f: any) => {
        if (f.vehicle.registration) {
          return f.vehicle.registration;
        }
      });
    existingPayload.message.order.fulfillments = sessionData.fulfillments.map(
      (fulfillment) => {
        if (fulfillment.type === "TICKET") {
          const registration = updateFulfillment[index] ?? "GL90";
          index++;
          return {
            ...fulfillment,
            vehicle: {
              category: "BUS",
              registration: registration ?? "GL90",
            },
          };
        }
        return fulfillment;
      },
    );
    existingPayload.message.order.fulfillments = transformFulfillments(
      existingPayload.message.order.fulfillments,
      sessionData,
    );
  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  existingPayload.message.order.tags = sessionData.tags.flat();
  return existingPayload;
}
