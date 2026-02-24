import { SessionData } from "../../../../session-types";

export async function onInitGenerator(existingPayload: any, sessionData: any) {
  existingPayload.context.message_id = sessionData?.init_message_id;
  existingPayload.message.order.provider = sessionData?.on_select_provider;
  const fulfillment_ids = sessionData?.init_fulfillments
    ?.flat()
    ?.map((fulfillment: any) => fulfillment.id);
  const reCreateItem = sessionData?.on_select_items
    ?.flat()
    ?.map((item: any) => {
      return {
        ...item,
        fulfillment_ids,
        time: {
          label: "Validity",
          duration: "P2D",
        },
      };
    });

  const fulfillmentsMap = new Map(
    sessionData?.on_select_fulfillments?.flat()?.map((f: any) => [f.id, f]) ||
      [],
  );

  existingPayload.message.order.fulfillments = fulfillment_ids
    ?.map((id: any) => fulfillmentsMap.get(id))
    ?.filter(Boolean)
    ?.map((fulfillment: any) =>
      fulfillment.type === "ROUTE"
        ? { ...fulfillment, vehicle: { category: "BUS" } }
        : fulfillment,
    );
  existingPayload.message.order.items = reCreateItem;
  existingPayload.message.order.tags = [
    {
      descriptor: {
        code: "BPP_TERMS",
        name: "BPP Terms of Engagement",
      },
      display: false,
      list: [
        ...sessionData?.init_tags?.flat()[0]?.list,
        {
          descriptor: {
            code: "SETTLEMENT_BANK_CODE",
          },
          value: "XXXXXXXX",
        },
        {
          descriptor: {
            code: "SETTLEMENT_WINDOW",
          },
          value: "PT60M",
        },
        {
          descriptor: {
            code: "SETTLEMENT_BANK_ACCOUNT_NUMBER",
          },
          value: "xxxxxxxxxxxxxx",
        },
      ],
    },
  ];
  return existingPayload;
}
