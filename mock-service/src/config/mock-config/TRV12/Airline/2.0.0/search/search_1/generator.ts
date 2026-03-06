import { SessionData } from "../../../../session-types";

export async function search_1_generator(
  existingPayload: any,
  sessionData: SessionData,
) {
  delete existingPayload.context.bpp_uri;
  delete existingPayload.context.bpp_id;

  const date = new Date(existingPayload?.context?.timestamp);
  const adultTicketCount = Number(
    sessionData?.user_inputs?.adult_ticket_count || 3,
  );
  const childTicketCount = Number(
    sessionData?.user_inputs?.child_ticket_count || 2,
  );
  // const journeyDate =
  //   sessionData?.user_inputs?.journey_date ?? new Date().toISOString();
  // date.setMonth(date.getMonth() + 2);
  const fulfillmentTimestamp = date.toISOString();

  existingPayload.message.intent.fulfillment.stops = [
    {
      type: "START",
      location: {
        descriptor: {
          code: "DEL",
        },
      },
      time: {
        label: "Date Of Journey",
        timestamp: fulfillmentTimestamp ?? new Date().toISOString(),
      },
    },
    {
      type: "END",
      location: {
        descriptor: {
          code: "BLR",
        },
      },
    },
  ];

  existingPayload.message.intent.provider.items = [
    {
      descriptor: {
        code: "ADULT_TICKET",
        name: "Adult Ticket",
      },
      quantity: {
        selected: {
          count: adultTicketCount,
        },
      },
    },
    ...(sessionData?.user_inputs?.child_ticket_count
      ? [
          {
            descriptor: {
              code: "CHILD_TICKET",
              name: "Child Ticket",
            },
            quantity: {
              selected: {
                count: childTicketCount,
              },
            },
          },
        ]
      : []),
  ];

  return existingPayload;
}
