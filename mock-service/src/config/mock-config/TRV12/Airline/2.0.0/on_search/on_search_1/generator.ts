export async function onSearch_1_Generator(
  existingPayload: any,
  sessionData: any
) {

  const items = sessionData?.search_1_items ?? [];
  console.log("items", sessionData?.search_1_items);

  const category =
    existingPayload?.message?.catalog?.providers[0]?.categories?.find(
      (i: any) => {
        i.descriptor.code === sessionData?.search_1_descriptor_code;
      }
    );
  const on_search_items = items.flatMap((item: any, index: number) => {
    const baseItem = {
      id: `I${index + 1}`,
      descriptor: item?.descriptor ?? {},
      quantity: item?.quantity ?? {},
      category_ids: [String(category?.id ?? "C1")],
      time: {
        label: "JOURNEY_TIME",
        duration: "PT16H30M",
      },
      refund_terms: [
        {
          refund_eligible: true,
        },
      ],
      cancellation_terms: [
        {
          external_ref: {
            url: "https://api.example-bpp.com/pilot/bpp/v1/cancellation_terms.pdf",
            mimetype: "application/pdf",
          },
        },
      ],
      add_ons: [
        {
          id: "A1",
          descriptor: {
            name: "meals",
            code: "MEALS",
          },
          quantity: {
            available: {
              count: 1,
            },
          },
          price: {
            currency: "INR",
            value: "300",
          },
        },
        {
          id: "A2",
          descriptor: {
            name: "Delayed and Lost Baggage Protection",
            code: "BAGGAGE",
          },
          quantity: {
            available: {
              count: 1,
            },
          },
          price: {
            currency: "INR",
            value: "500",
          },
        },
        {
          id: "A3",
          descriptor: {
            name: "Fast Forward",
            code: "FAST_FORWARD",
            short_desc:
              "Get priority check-in & baggage handling services to save time.",
          },
          quantity: {
            available: {
              count: 1,
            },
          },
          price: {
            currency: "INR",
            value: "200",
          },
        },
        {
          id: "A4",
          descriptor: {
            name: "Travel Assistance",
            code: "TRAVEL_ASSISTANCE",
          },
          quantity: {
            available: {
              count: 1,
            },
          },
          price: {
            currency: "INR",
            value: "500",
          },
        },
        {
          id: "A7",
          descriptor: {
            name: "Free Cancellation",
            code: "FREE_CANCELLATION",
          },
          price: {
            currency: "INR",
            value: "500",
          },
        },
        {
          id: "A8",
          descriptor: {
            name: "Free Date Changes",
            code: "FREE_DATE_CHANGE",
          },
          price: {
            currency: "INR",
            value: "200",
          },
        },
      ],
      tags: [
        {
          descriptor: {
            code: "FARE_TYPE",
            name: "Fare Type",
          },
          display: true,
          list: [
            { descriptor: { code: "REGULAR" } },
            { descriptor: { code: "STUDENT" } },
            { descriptor: { code: "SENIOR_CITIZEN" } },
            { descriptor: { code: "ARMED_FORCES" } },
            { descriptor: { code: "DOCTORS_NURSES" } },
          ],
        },
        {
          descriptor: {
            code: "GENERAL_INFO",
            name: "General Info",
          },
          display: true,
          list: [
            {
              descriptor: {
                code: "CABIN_BAGGAGE",
                name: "Cabin Baggage",
                short_desc: "Allowed limit for cabin baggage",
              },
              value: "7 KG",
            },
            {
              descriptor: {
                code: "CHECK_IN_BAGGAGE",
                name: "Check-in Baggage",
                short_desc: "Allowed limit for checkin baggage",
              },
              value: "15 KG",
            },
            {
              descriptor: {
                code: "PROHIBITED_ITEMS",
                name: "Prohibited Items",
              },
              value: "list of items",
            },
          ],
        },
      ],
    };

    return [baseItem, { ...baseItem, id: `I${items.length + index + 1}` }];
  });

  existingPayload.message.catalog.providers[0].items = on_search_items;

  existingPayload.message.catalog.providers[0].payments[0] =
    sessionData?.search_1_payment ?? {};

  let payments = existingPayload.message.catalog.providers[0].payments[0];

  let settlementTag = payments.tags.find(
    (i: any) => i.descriptor.code === "SETTLEMENT_TERMS"
  );

  if (settlementTag) {
    settlementTag.list = [
      {
        descriptor: { code: "SETTLEMENT_WINDOW" },
        value: "P30D",
      },
      {
        descriptor: { code: "SETTLEMENT_BASIS" },
        value: "INVOICE_RECEIPT",
      },
      {
        descriptor: { code: "MANDATORY_ARBITRATION" },
        value: "TRUE",
      },
      {
        descriptor: { code: "COURT_JURISDICTION" },
        value: "New Delhi",
      },
      {
        descriptor: { code: "STATIC_TERMS" },
        value:
          settlementTag.list.find(
            (li: any) => li.descriptor.code === "STATIC_TERMS"
          )?.value ?? "https://api.example-bpp.com/booking/terms",
      },
    ];
  }

  return existingPayload;
}
