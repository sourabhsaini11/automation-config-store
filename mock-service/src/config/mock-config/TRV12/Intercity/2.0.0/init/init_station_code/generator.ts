import { SessionData } from "../../../../session-types";

export async function initGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.items = [sessionData.select_items];

  existingPayload.message.order.fulfillments = transformFulfillments(
    sessionData.select_2_fulfillments
  );

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
      person: { name: "Amit Sharma", age: "34", gender: "MALE" },
      contact: { phone: "+91-9812345670" },
    },
    {
      person: { name: "Priya Nair", age: "29", gender: "FEMALE" },
      contact: { phone: "+91-9876543210" },
    },
    {
      person: { name: "Rahul Verma", age: "41", gender: "MALE" },
      contact: { phone: "+91-9765432109" },
    },
    {
      person: { name: "Sneha Kapoor", age: "25", gender: "FEMALE" },
      contact: { phone: "+91-9654321098" },
    },
    {
      person: { name: "David Thomas", age: "38", gender: "MALE" },
      contact: { phone: "+91-9543210987" },
    },
    {
      person: { name: "Anjali Mehta", age: "31", gender: "FEMALE" },
      contact: { phone: "+91-9432109876" },
    },
    {
      person: { name: "Karan Singh", age: "36", gender: "MALE" },
      contact: { phone: "+91-9321098765" },
    },
    {
      person: { name: "Meera Iyer", age: "28", gender: "FEMALE" },
      contact: { phone: "+91-9210987654" },
    }
  ];



  return fulfillments.map((f: any, index: number) => {
    if (f.id === "F1") {
      return f;
    }

    return {
      id: f.id,
      customer: customers[index - 1],
      tags: f.tags.map((tag: any) => ({
        descriptor: tag.descriptor,
        list: tag.list.filter((item: any) => item.descriptor.code === "NUMBER"),
      })),
    };
  });
}
