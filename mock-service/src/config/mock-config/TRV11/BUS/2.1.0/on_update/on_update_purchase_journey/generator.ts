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
export async function onUpdatePuchaseJourneyGenerator(
  existingPayload: any,
  sessionData: any,
  is_onstatus?: boolean
) {
  existingPayload.message.order = sessionData?.on_confirm_order ?? {};
  existingPayload.message.order.billing = sessionData?.updated_billing ?? {};
  existingPayload.message.order.fulfillments =
    existingPayload.message.order.fulfillments?.map((fulfillment: any) => {
      if (fulfillment.type === "TRIP") {
        return {
          ...fulfillment,
          stops: fulfillment.stops.map((stop: any) => {
            if (stop.type === "START") {
              return {
                ...stop,
                authorization: { type: "QR" },
              };
            }
            return stop;
          }),
        };
      }
      if (fulfillment.type === "TICKET") {
        return {
          ...fulfillment,
          stops: fulfillment.stops?.map((stop: any) => {
            if (stop.type === "START") {
              return {
                ...stop,
                authorization: {
                  ...stop.authorization,
                  status: "CLAIMED",
                },
              };
            }
            return stop;
          }),
        };
      }
    });
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  existingPayload.message.order.status = is_onstatus ? "COMPLETED" : "ACTIVE";
  return existingPayload;
}
