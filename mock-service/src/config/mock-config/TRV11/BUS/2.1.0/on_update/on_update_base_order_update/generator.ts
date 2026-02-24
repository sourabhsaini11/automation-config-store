import { SessionData } from "../../../../session-types";

export async function onUpdateGenerator(
  existingPayload: any,
  sessionData: any,
) {
  const routeFulfillmentId = "F1";
  const duration = "P2D";
  let validityEndDate = new Date();
  const daysMatch = duration.match(/P(?:T)?(\d+)D/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    validityEndDate.setDate(validityEndDate.getDate() + days);
  }
  const date = new Date().toISOString();
  existingPayload.context.message_id = sessionData.message_id;
  existingPayload.message.order.id = sessionData.update_order_id ?? "";
  const breakup = sessionData?.update_quote?.breakup?.map((breakup: any) => {
    if (breakup?.title === "BASE_FARE" && !breakup.item.price) {
      return {
        ...breakup,
        item: {
          ...breakup.item,
          price: {
            currency: "INR",
            value: String(
              Number(
                breakup?.price?.value /
                  breakup?.item?.quantity?.selected?.count,
              ),
            ),
          },
        },
      };
    }
    return breakup;
  });
  existingPayload.message.order.quote = {
    ...sessionData?.update_quote,
    breakup,
  };
  const createAgentTicketing = sessionData?.update_fulfillments
    ?.flat()
    ?.map((fulfillment: any) => {
      return {
        id: fulfillment?.id ?? "",
        type: fulfillment?.type ?? "",
        vehicle: {
          category: "BUS",
          registration: "DL 11A 123F",
        },
        agent: {
          person: {
            id: "emp:E52432",
          },
        },
        state: {
          descriptor: {
            code: "COMPLETED",
          },
        },
        tags: [
          ...fulfillment?.tags,
          {
            descriptor: {
              code: "INFO",
            },
            list: [
              {
                descriptor: {
                  code: "PARENT_ID",
                },
                value: routeFulfillmentId,
              },
            ],
          },
        ],
      };
    });
  existingPayload.message.order.fulfillments = [
    {
      id: routeFulfillmentId,
      type: "ROUTE",
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
      vehicle: {
        category: "BUS",
      },
      tags: [
        {
          descriptor: {
            code: "ROUTE_INFO",
          },
          list: [
            {
              descriptor: {
                code: "ROUTE_ID",
              },
              value: "242",
            },
            {
              descriptor: {
                code: "ROUTE_DIRECTION",
              },
              value: "UP",
            },
          ],
        },
      ],
    },
    ...createAgentTicketing,
  ];

  const fulfillment_ids = existingPayload?.message?.order.fulfillments?.map(
    (fulfillment: any) => fulfillment?.id,
  );
  existingPayload.message.order.items = [
    {
      id: "I10",
      descriptor: {
        name: "Agent Login",
        code: "AGENT_TICKETING",
        images: [
          {
            url: "https://dtc.delhi.gov.in/sites/default/files/DTC/logo/dtc_logo_2.png",
            size_type: "xs",
          },
        ],
      },
      category_ids: ["C1"],
      fulfillment_ids,
      price: {
        currency: "INR",
        value: "0",
      },
      time: {
        label: "Validity",
        duration: duration,
        timestamp: validityEndDate.toISOString(),
      },
    },
  ];

  //______SETTLEMENT_AMOUNT____________
  const tags = existingPayload?.message?.order?.tags;
  if (!tags) return;

  const collectedBy = "BAP";
  const price = Number(existingPayload?.message?.order?.quote?.price?.value);

  const buyerFinderFeesTag = tags?.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );

  const feePercentage = Number(
    buyerFinderFeesTag?.list?.find(
      (item: any) => item?.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE",
    )?.value ?? 0,
  );

  const feeAmount = (price * feePercentage) / 100;

  let settlementAmount = 0;
  if (collectedBy === "BAP") {
    settlementAmount = price - feeAmount;
  } else if (collectedBy === "BPP") {
    settlementAmount = feeAmount;
  } else {
    settlementAmount = price;
  }

  const settlementTermsTag = tags?.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );

  const settlementAmountItem = settlementTermsTag?.list?.find(
    (item: any) => item?.descriptor?.code === "SETTLEMENT_AMOUNT",
  );

  if (settlementAmountItem) {
    settlementAmountItem.value = settlementAmount.toString();
  }

  const bppTermsTag = existingPayload.message.order.tags?.find(
    (item: any) => item.descriptor.code === "BPP_TERMS",
  );

  if (bppTermsTag) {
    const bppSettlementAmountItem = bppTermsTag.list?.find(
      (i: any) => i.descriptor.code === "SETTLEMENT_AMOUNT",
    );

    if (bppSettlementAmountItem) {
      bppSettlementAmountItem.value = settlementAmount.toString();
    }
  }
  existingPayload.message.order.created_at = date;
  existingPayload.message.order.updated_at = date;
  return existingPayload;
}
