import { SessionData } from "../../../session-types";

const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};
const transformPayments = (payments: any) => {
  return payments.map((payment: any) => {
    return {
      id: generateRandomId(),
      collected_by: payment.collected_by,
      status: "NOT-PAID",
      type: "PRE-ORDER",
      // params: {
      // 	bank_code: "XXXXXXXX",
      // 	bank_account_number: "xxxxxxxxxxxxxx",
      // },
      tags: payment.tags,
    };
  });
};
export async function onInitGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  const payments = transformPayments(sessionData.payments);
  existingPayload.message.order.payments = payments;
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }
  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  // 	const fulfillmentType= sessionData.fulfillments.find((fulfillment:any)=> fulfillment.type ==="PASS").type

  //      if(fulfillmentType === "PASS"){
  //      existingPayload.message.order.fulfillments = [sessionData.onselect_fulfillments ]

  //    }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  const bap_tags_list = sessionData?.init_tags
    ?.flat()
    ?.find((item: any) => item?.descriptor?.code === "BAP_TERMS");
  existingPayload.message.order.tags = [
    {
      descriptor: {
        code: "BPP_TERMS",
        name: "BPP Terms of Engagement",
      },
      display: false,
      list: [
        ...bap_tags_list.list,
        {
          descriptor: {
            code: "SETTLEMENT_WINDOW",
          },
          value: "PT60M",
        },
        {
          descriptor: {
            code: "SETTLEMENT_BANK_CODE",
          },
          value: "XXXXXXXX",
        },
        {
          descriptor: {
            code: "SETTLEMENT_BANK_ACCOUNT_NUMBER",
          },
          value: "xxxxxxxxxxxxxx",
        },
      ],
    },
    ...sessionData.on_select_tags.flat(),
  ];
  return existingPayload;
}
