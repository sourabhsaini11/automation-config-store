
import { v4 as uuidv4 } from 'uuid';

export async function confirmDefaultGenerator(existingPayload: any, sessionData: any) {
  if (sessionData.selected_items) {
    existingPayload.message.order.items = sessionData.selected_items;
  }

  if (sessionData.selected_fulfillments) {
    existingPayload.message.order.fulfillments = sessionData.selected_fulfillments;
  }

  if (sessionData.selected_provider) {
    existingPayload.message.order.provider = sessionData.selected_provider;
  }

  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }

  if (sessionData.tags) {
    existingPayload.message.order.tags = sessionData.tags;
  }

  if (existingPayload.message.order.payments && Array.isArray(existingPayload.message.order.payments)) {
    existingPayload.message.order.payments.forEach((payment: any) => {
      if (payment.params) {
        payment.params.transaction_id = uuidv4();

        if (sessionData.quote && sessionData.quote.price && sessionData.quote.price.value) {
          payment.params.amount = sessionData.quote.price.value;
          payment.params.currency = sessionData.quote.price.currency || "INR";
        }
      }
    });
  }

  return existingPayload;
} 