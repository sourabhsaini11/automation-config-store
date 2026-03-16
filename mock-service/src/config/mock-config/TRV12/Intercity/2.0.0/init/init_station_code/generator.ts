import { SessionData } from "../../../../session-types";

export async function initGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.items = [sessionData.select_items];
  const fulfillments = Array.isArray(sessionData.select_2_fulfillments)
    ? sessionData.select_2_fulfillments.flat()
    : [sessionData.select_2_fulfillments];
  existingPayload.message.order.fulfillments = transformFulfillments(
    fulfillments
  );
  console.log(" existingPayload.message.order.fulfillments in init_station_code", JSON.stringify(existingPayload.message.order.fulfillments));

  existingPayload.message.order.provider = { id: sessionData.provider_id };

  existingPayload.message.order.billing = {
    name: "Joe Adams",
    phone: "+91-9988776655",
    tax_id: "GSTIN:22AAAAA0000A1Z5",
  };

  const price: any = sessionData.quote.price.value;
  const feePercentage: any = "1";
  const feeAmount = (price * feePercentage) / 100;
  const collectedBy: any = "BAP";
  const finalAmount = collectedBy === "BAP" ? price - feeAmount : feeAmount;

  existingPayload.message.order.payments = [
    {
      id: "PA1",
      collected_by: "BAP",
      status: "NOT-PAID",
      type: "PRE-ORDER",
      tags: [
        {
          descriptor: { code: "BUYER_FINDER_FEES" },
          display: false,
          list: [
            {
              descriptor: { code: "BUYER_FINDER_FEES_PERCENTAGE" },
              value: "1",
            },
          ],
        },
        {
          descriptor: { code: "SETTLEMENT_TERMS" },
          display: false,
          list: [
            { descriptor: { code: "SETTLEMENT_WINDOW" }, value: "PT60M" },
            { descriptor: { code: "SETTLEMENT_BASIS" }, value: "Delivery" },
            { descriptor: { code: "SETTLEMENT_TYPE" }, value: "upi" },
            { descriptor: { code: "MANDATORY_ARBITRATION" }, value: "true" },
            { descriptor: { code: "COURT_JURISDICTION" }, value: "New Delhi" },
            { descriptor: { code: "DELAY_INTEREST" }, value: "2.5" },
            {
              descriptor: { code: "STATIC_TERMS" },
              value: "https://www.abc.com/settlement-terms/",
            },
            { descriptor: { code: "SETTLEMENT_AMOUNT" }, value: finalAmount.toString() },
          ],
        },
      ],
    },
  ];

  return existingPayload;
}

function transformFulfillments(fulfillments: any) {
  console.log("TRV12/Intercity/2.0.0/init/init_station_code/generator fulfillments", JSON.stringify(fulfillments));

  const customers = [
    {
      person: { name: "Joe Adams", age: "30", gender: "MALE" },
      contact: { phone: "+91-9988776655" },
    },
    {
      person: { name: "RACHEL ADAMS", age: "27", gender: "FEMALE" },
      contact: { phone: "+91-9723797890" },
    },
    {
      person: { name: "John Doe", age: "35", gender: "MALE" },
      contact: { phone: "+91-9876543210" },
    },
    {
      person: { name: "Jane Smith", age: "29", gender: "FEMALE" },
      contact: { phone: "+91-9123456789" },
    },
  ];

  return fulfillments?.map((f: any, index: number) => {
    const transformedFulfillment = { ...f };

    if (f.id === "F1" || f.id === "FT-1") {
      return f;
    }

    const customer = customers[index % customers.length];
    if (customer) {
      transformedFulfillment.customer = customer;
    }

    if (f.tags) {
      transformedFulfillment.tags = f.tags.map((tag: any) => ({
        descriptor: tag.descriptor,
        list: tag.list?.filter((item: any) => item.descriptor.code === "NUMBER"),
      }));
    }
    console.log("transformedFulfillment-init", JSON.stringify(transformedFulfillment));

    return transformedFulfillment;
  });
}
