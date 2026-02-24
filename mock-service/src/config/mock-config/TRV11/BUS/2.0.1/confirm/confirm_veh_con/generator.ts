import { SessionData } from "../../../../session-types";

function generateUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}
const transformPaymentsToPaid = (
  payments: any[],
  amount: any,
  currency = "INR"
) => {
  return payments.map((p: any) => {
    // if the payment is wrapped like {0: {...}}, unwrap it
    const payment = Array.isArray(p) ? p[0] : p[0] ?? p;

    return {
      ...payment,
      status: "PAID",
      params: {
        transaction_id: generateUuid(),
        currency,
        amount,
      },
    };
  });
};
export async function confirmVehConGenerator(
  existingPayload: any,
  sessionData: SessionData
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
  if (sessionData.buyer_side_fulfillment_ids) {
    existingPayload.message.order.fulfillments = sessionData.buyer_side_fulfillment_ids;
  }
  existingPayload.message.order.fulfillments = existingPayload.message.order.fulfillments.map((f:any) => ({
    ...f,
    vehicle: {
      registration: "MOCK_REG"
    }
  }));
  if (sessionData.payments) {
    existingPayload.message.order.payments = transformPaymentsToPaid(
      sessionData.payments,
      sessionData.price
    );
  }
  return existingPayload;
}
