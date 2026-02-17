import { v4 as uuidv4 } from "uuid";

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
export async function confirmUnlimitedPassGenerator(
  existingPayload: any,
  sessionData: any,
) {
  existingPayload.context.location.city.code =
    sessionData?.select_city_code ?? "std:080";
  existingPayload.message.order.billing = sessionData.billing ?? {};

  if (sessionData.selected_items && sessionData.selected_items.length > 0) {
    existingPayload.message.order.items = sessionData?.init_items?.flat() ?? [];
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

  existingPayload.message.order.fulfillments =
    sessionData?.buyer_side_fulfillment_ids?.flat() ?? [];

  const onlyBpp_terms = sessionData?.on_init_tags
    ?.flat()
    ?.filter((item: any) => {
      return item.descriptor.code === "BPP_TERMS";
    });
  existingPayload.message.order.tags = [
    ...sessionData?.init_tags?.flat(),
    ...onlyBpp_terms,
  ];
  return existingPayload;
}
