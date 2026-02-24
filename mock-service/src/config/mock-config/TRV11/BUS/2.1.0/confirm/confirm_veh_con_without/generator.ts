import { SessionData } from "../../../../session-types";

const { v4: uuidv4 } = require("uuid");

function getRandomFourDigitInt() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const transformPaymentsToPaid = (
  payments: any[],
  amount: any,
  currency = "INR",
) => {
  return payments.map((p: any) => {
    // if the payment is wrapped like {0: {...}}, unwrap it
    const payment = Array.isArray(p) ? p[0] : (p[0] ?? p);

    return {
      ...payment,
      status: "PAID",
      params: {
        transaction_id: uuidv4(),
        currency,
        amount,
      },
    };
  });
};
export async function confirmVehConWithoutUpdateGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  if (sessionData.billing && Object.keys(sessionData.billing).length > 0) {
    existingPayload.message.order.billing = sessionData.billing;
  }

  if (sessionData.selected_items && sessionData.selected_items.length > 0) {
    existingPayload.message.order.items = sessionData.selected_items;
  }
  if (sessionData.provider_id) {
    existingPayload.message.order.provider.id = sessionData.provider_id;
  }

  if (sessionData.fulfillments) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments
      ?.flat()
      ?.map((f: any) => {
        if (f.type === "TRIP") {
          return {
            id: f.id,
            type: f.type,
          };
        }
        if (f.type === "TICKET") {
          const randomInt = getRandomFourDigitInt();
          return {
            id: f.id,
            type: f.type,
            vehicle: {
              registration: `TX${randomInt}`,
            },
          };
        }
      });
  }

  if (sessionData.payments) {
    existingPayload.message.order.payments = transformPaymentsToPaid(
      sessionData.payments,
      sessionData.price,
    );
  }
  const mergedTags = [
    ...sessionData?.init_tags.flat(),
    ...sessionData?.on_init_tags.flat(),
  ];

  const bapTermsTag = mergedTags.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );

  const bppTermsTag = mergedTags.find(
    (tag: any) => tag?.descriptor?.code === "BPP_TERMS",
  );

  const settlement_wondow_tag = {
    descriptor: {
      code: "SETTLEMENT_WINDOW",
    },
    value: "PT60M",
  };

  if (bapTermsTag && bapTermsTag.list) {
    const hasSettlementWindow = bapTermsTag.list.some(
      (item: any) => item?.descriptor?.code === "SETTLEMENT_WINDOW",
    );

    if (!hasSettlementWindow) {
      bapTermsTag.list.push(settlement_wondow_tag);
    }
  }

  if (bppTermsTag && bppTermsTag.list) {
    const hasSettlementWindow = bppTermsTag.list.some(
      (item: any) => item?.descriptor?.code === "SETTLEMENT_WINDOW",
    );

    if (!hasSettlementWindow) {
      bppTermsTag.list.push(settlement_wondow_tag);
    }
  }

  existingPayload.message.order.tags = mergedTags;
  return existingPayload;
}
