import { v4 as uuidv4 } from "uuid";
export async function onInitUnlimitedPassGenerator(
  existingPayload: any,
  sessionData: any,
) {
  existingPayload.context.location.city.code =
    sessionData?.select_city_code ?? "std:080";
  console.log(sessionData?.items, sessionData?.fulfillments);
  existingPayload.message.order.provider = sessionData.provider;
  existingPayload.message.order.items = sessionData?.items ?? [];
  existingPayload.message.order.fulfillments = sessionData?.fulfillments ?? [];
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms?.flat() ?? [];
  existingPayload.message.order.quote = sessionData?.quote ?? {};
  existingPayload.message.order.billing = sessionData?.billing ?? {};
  existingPayload.message.order.payments =
    sessionData?.payments?.flat()?.map((item: any) => {
      return {
        id: uuidv4(),
        ...item,
      };
    }) ?? [];

  existingPayload.message.order.tags = [
    {
      descriptor: {
        code: "BPP_TERMS",
        name: "BPP Terms of Engagement",
      },
      display: false,
      list: [
        ...(sessionData?.init_tags
          ?.flat()[0]
          ?.list?.filter(
            (item: any) => item?.descriptor?.code !== "DELAY_INTEREST",
          ) || []),

        {
          descriptor: { code: "SETTLEMENT_WINDOW" },
          value: "P30D",
        },
        {
          descriptor: { code: "SETTLEMENT_BASIS" },
          value: "INVOICE_RECEIPT",
        },
        {
          descriptor: { code: "SETTLEMENT_BANK_CODE" },
          value: "XXXXXXXX",
        },
        {
          descriptor: { code: "SETTLEMENT_BANK_ACCOUNT_NUMBER" },
          value: "xxxxxxxxxxxxxx",
        },
      ],
    },
    ...sessionData?.select_tags?.flat(),
  ];

  return existingPayload;
}
