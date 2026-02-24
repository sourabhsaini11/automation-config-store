import { SessionData } from "../../../../session-types";

type Price = {
  value: string;
  currency: string;
};

type Item = {
  id: string;
  price: Price;
  quantity: {
    selected: {
      count: number;
    };
  };
};

type Breakup = {
  title: string;
  item?: Item;
  price: Price;
};

type Quote = {
  price: Price;
  breakup: Breakup[];
};
export function updateCancellationTimestamp(payload: any) {
  // deep clone to avoid mutating input
  const clone =
    typeof structuredClone === "function"
      ? structuredClone(payload)
      : JSON.parse(JSON.stringify(payload));

  const order = clone?.message?.order;
  if (!order || !order.cancellation) return clone;

  order.cancellation.time = new Date().toISOString();

  return clone;
}
export function updateSettlementAmount(order: any, sessionData: SessionData) {
  if (!order?.payments || !order?.quote?.price?.value) return order;

  const quoteValue = parseFloat(order.quote.price.value);
  if (Number.isNaN(quoteValue)) return order;

  const buyerFinderFee = parseFloat(sessionData.buyer_app_fee ?? "3");
  const buyerFinderAmount = (quoteValue * (isNaN(buyerFinderFee) ? 3 : buyerFinderFee)) / 100;

  // formatted strings to store in payload
  const buyerFinderAmountStr = buyerFinderAmount.toFixed(2);
  const remainderAmountStr = (quoteValue - buyerFinderAmount).toFixed(2);

  const sessionCollector = (sessionData.collected_by || "").toUpperCase();

  order.payments = order.payments.map((payment: any) => {
    if (!payment?.tags || !Array.isArray(payment.tags)) return payment;

    const paymentCollector = (payment.collected_by || "").toUpperCase();

    payment.tags = payment.tags.map((tag: any) => {

      if (tag.descriptor?.code === "SETTLEMENT_TERMS" && Array.isArray(tag.list)) {
        tag.list = tag.list.map((item: any) => {
          if (item.descriptor?.code === "SETTLEMENT_AMOUNT") {
            if (sessionCollector === "BPP") {
              if (paymentCollector === "BPP") {
                return { ...item, value: buyerFinderAmountStr };
              } else if (paymentCollector === "BAP") {
                return { ...item, value: remainderAmountStr };
              }
              return item;
            }

            return { ...item, value: buyerFinderAmountStr };
          }
          return item;
        });
      }
      return tag;
    });

    return payment;
  });

  return order;
}
function stripTicketAuthorizations(order: any) {
  if (!order.fulfillments) return order;

  order.fulfillments = order.fulfillments.map((fulfillment: any) => {
    if (fulfillment.type === "TICKET") {
      const { stops, ...restFulfillment } = fulfillment;
      return restFulfillment; 
    }
    return fulfillment;
  });

  return order;
}

function applyCancellation(quote: Quote, cancellationCharges: number): Quote {
  // Parse the current price
  const currentTotal = parseFloat(quote.price.value);

  // Calculate the total refund for items
  const refundAmount = quote.breakup
    .filter((b) => b.title === "BASE_FARE" && b.item)
    .reduce((sum, breakup) => {
      const itemTotal = parseFloat(breakup.price.value);
      return sum + itemTotal;
    }, 0);

  // Create a REFUND breakup for items
  const refundBreakups: Breakup[] = quote.breakup
    .filter((b) => b.title === "BASE_FARE" && b.item)
    .map((baseFare) => ({
      title: "REFUND",
      item: {
        ...baseFare.item!,
        price: {
          ...baseFare.item!.price,
          value: `-${baseFare.item!.price.value}`, // Negative for refund
        },
      },
      price: {
        ...baseFare.price,
        value: `-${baseFare.price.value}`, // Negative for refund
      },
    }));

  // Create a CANCELLATION_CHARGES breakup
  const cancellationBreakup: Breakup = {
    title: "CANCELLATION_CHARGES",
    price: {
      currency: "INR",
      value: cancellationCharges.toFixed(2),
    },
  };

  // Update the total price
  const newTotal = currentTotal - refundAmount + cancellationCharges;

  // Return the updated quote
  return {
    price: {
      ...quote.price,
      value: newTotal.toFixed(2),
    },
    breakup: [...quote.breakup, ...refundBreakups, cancellationBreakup],
  };
}

export async function onCancelMerchantGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
    existingPayload.message.order = stripTicketAuthorizations(
      existingPayload.message.order
    );
  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  existingPayload.message.order.status = "CANCELLED";
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = applyCancellation(
      sessionData.quote,
      0
    );
  }
  existingPayload.message.order = updateSettlementAmount(
    existingPayload.message.order,
    sessionData
  );
  existingPayload = updateCancellationTimestamp(existingPayload);
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
