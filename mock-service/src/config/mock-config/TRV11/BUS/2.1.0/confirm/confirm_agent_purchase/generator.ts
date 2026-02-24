import { SessionData } from "../../../../session-types";

export async function confirmGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  function createFulfillment(itemQuanity: number) {
    let fulfillment = [
      {
        type: "TRIP",
        stops: [
          {
            type: "START",
            location: {
              descriptor: {
                name: "MOCK_STATION_1",
                code: "MOCK_STATION_1",
              },
              gps: "28.666576, 77.233332",
            },
            id: "1",
          },
          {
            type: "INTERMEDIATE_STOP",
            instructions: {
              name: "Stop 1",
            },
            location: {
              descriptor: {
                name: "MOCK_STATION_2",
                code: "MOCK_STATION_2",
              },
              gps: "28.624097, 77.204991",
            },
            id: "2",
            parent_stop_id: "1",
          },
          {
            type: "INTERMEDIATE_STOP",
            instructions: {
              name: "Stop 2",
            },
            location: {
              descriptor: {
                name: "MOCK_STATION_3",
                code: "MOCK_STATION_3",
              },
              gps: "28.625972,77.209917",
            },
            id: "3",
            parent_stop_id: "2",
          },
          {
            type: "INTERMEDIATE_STOP",
            instructions: {
              name: "Stop 3",
            },
            location: {
              descriptor: {
                name: "MOCK_STATION_4",
                code: "MOCK_STATION_4",
              },
              gps: "28.610972,77.201717",
            },
            id: "4",
            parent_stop_id: "3",
          },
          {
            type: "INTERMEDIATE_STOP",
            instructions: {
              name: "Stop 4",
            },
            location: {
              descriptor: {
                name: "MOCK_STATION_5",
                code: "MOCK_STATION_5",
              },
              gps: "28.623097,77.209917",
            },
            id: "5",
            parent_stop_id: "4",
          },
          {
            type: "END",
            location: {
              descriptor: {
                name: "MOCK_STATION_6",
                code: "MOCK_STATION_6",
              },
              gps: "28.548230, 77.238039",
            },
            id: "6",
            parent_stop_id: "5",
          },
        ],
      },
    ];
    for (let i = 0; i < itemQuanity; i++) {
      fulfillment.push({
        type: "TICKET",
        tags: [
          {
            descriptor: {
              code: "TICKET_INFO",
            },
            list: [
              {
                descriptor: {
                  code: "NUMBER",
                },
                value: crypto.randomUUID().slice(0, 5).toString(),
              },
            ],
          },
        ],
      } as any);
    }
    return fulfillment;
  }
  existingPayload.message.order.items[0].quantity.selected.count = Number(
    sessionData?.user_inputs?.item_quantity ?? 0,
  );
  const gererateRef_id = crypto.randomUUID().slice(0, 8).toString();
  const gererateOrderId = crypto.randomUUID().slice(0, 7).toString();
  existingPayload.message.order.ref_order_ids = [gererateRef_id];
  existingPayload.message.order.id = gererateOrderId;
  const itemQuanity =
    existingPayload?.message?.order?.items[0]?.quantity?.selected?.count;
  existingPayload.message.order.fulfillments = createFulfillment(itemQuanity);

  let breakup = [
    {
      title: "BASE_FARE",
      item: {
        id: existingPayload?.message?.order?.items[0]?.id ?? "",
        price: {
          currency: "INR",
          value: existingPayload?.message?.order?.items[0]?.price?.value ?? "",
        },
        quantity: {
          selected: {
            count: Number(
              existingPayload?.message?.order?.items[0]?.quantity?.selected
                ?.count ?? "0",
            ),
          },
        },
      },
      price: {
        currency: "INR",
        value: String(
          Number(
            existingPayload?.message?.order?.items[0]?.quantity?.selected
              ?.count ?? "0",
          ) * Number(existingPayload?.message?.order?.items[0]?.price?.value),
        ),
      },
    },
    {
      title: "OFFER",
      price: {
        currency: "INR",
        value: "0",
      },
    },
    {
      title: "TOLL",
      price: {
        currency: "INR",
        value: "0",
      },
    },
    {
      title: "TAX",
      price: {
        currency: "INR",
        value: "0",
      },
      item: {
        tags: [
          {
            descriptor: {
              code: "TAX",
            },
            list: [
              {
                descriptor: {
                  code: "CGST",
                },
                value: "0",
              },
              {
                descriptor: {
                  code: "SGST",
                },
                value: "0",
              },
            ],
          },
        ],
      },
    },
    {
      title: "OTHER_CHARGES",
      price: {
        currency: "INR",
        value: "0",
      },
      item: {
        tags: [
          {
            descriptor: {
              code: "OTHER_CHARGES",
            },
            list: [
              {
                descriptor: {
                  code: "SURCHARGE",
                },
                value: "0",
              },
            ],
          },
        ],
      },
    },
  ];

  let quotePrice = 0;
  breakup.forEach((item: any) => {
    quotePrice += Number(item?.price?.value || 0);
  });

  const quote = {
    price: {
      value: String(quotePrice),
      currency: "INR",
    },
    breakup,
  };

  existingPayload.message.order.quote = quote;
  existingPayload.message.order.payments[0].id = crypto.randomUUID().toString();
  existingPayload.message.order.payments[0].params = {
    currency: "INR",
    amount: String(quotePrice),
  };

  return existingPayload;
}
