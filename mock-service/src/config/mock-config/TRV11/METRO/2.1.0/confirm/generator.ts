const { v4: uuidv4 } = require("uuid");

const transformPaymentsToPaid = (
  payments: any,
  amount: any,
  currency = "INR",
) => {
  return payments.map((payment: any) => ({
    ...payment,
    status: "PAID",
    params: {
      transaction_id: uuidv4(), // Generates a UUID for transaction_id
      currency,
      amount,
    },
  }));
};
export async function confirmGenerator(existingPayload: any, sessionData: any) {
  if (sessionData.billing && Object.keys(sessionData.billing).length > 0) {
    existingPayload.message.order.billing = sessionData.billing;
  }

  if (sessionData.selected_items && sessionData.selected_items.length > 0) {
    existingPayload.message.order.items = sessionData.selected_items;
  }
  if (sessionData.provider_id) {
    existingPayload.message.order.provider.id = sessionData.provider_id;
  }
  if (sessionData.payments) {
    existingPayload.message.order.payments = transformPaymentsToPaid(
      sessionData.payments,
      sessionData.price,
    );
  }
  const tags = sessionData.on_init_tags
    .flat()
    .filter((item: any) => item.descriptor.code !== "ADDITIONAL_APIS");
  const mergedTags = [...sessionData?.init_tags?.flat(), ...tags];

  const bapTermsTag = mergedTags.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );

  const onInitBapTerms = sessionData.on_init_tags.flat()?.find(
    (tag: any) => tag?.descriptor?.code === "BPP_TERMS",
  );

  const settlementWindowValue = onInitBapTerms?.list?.find(
    (item: any) => item?.descriptor?.code === "SETTLEMENT_WINDOW",
  )?.value;

  if (bapTermsTag && bapTermsTag.list) {
    const hasSettlementWindow = bapTermsTag.list.some(
      (item: any) => item?.descriptor?.code === "SETTLEMENT_WINDOW",
    );

    if (!hasSettlementWindow) {
      bapTermsTag.list.push(
        {
          descriptor: {
            code: "SETTLEMENT_WINDOW",
          },
          value: settlementWindowValue ?? "P30D",
        },
        {
          descriptor: {
            code: "SETTLEMENT_BASIS",
          },
          value: "Delivery",
        },
      );
    }
  }

  existingPayload.message.order.tags = mergedTags;
  return existingPayload;
}
