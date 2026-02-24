
function generateUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
}
const transformPaymentsToPaid = (payments: any, amount:any,currency = "INR") => {
  return payments.map((payment:any) => ({
    ...payment,
    status: "PAID",
    params: {
      transaction_id: generateUuid(), // Generates a UUID for transaction_id
      currency,
      amount,
    },
  }));
};
export async function confirmGenerator(existingPayload: any,sessionData: any){
    if (sessionData.billing && Object.keys(sessionData.billing).length > 0) {
        existingPayload.message.order.billing = sessionData.billing;
      }

    if (sessionData.selected_items && sessionData.selected_items.length > 0) {
    existingPayload.message.order.items = sessionData.selected_items;
    }
    if(sessionData.provider_id){
        existingPayload.message.order.provider.id = sessionData.provider_id
      }
    if(sessionData.payments){
      existingPayload.message.order.payments = transformPaymentsToPaid(sessionData.payments,sessionData.price);
    }
    return existingPayload;
}