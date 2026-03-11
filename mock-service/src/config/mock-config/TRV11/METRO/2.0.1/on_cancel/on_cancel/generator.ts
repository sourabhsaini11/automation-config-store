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

export async function onCancelGenerator(existingPayload: any, sessionData: any) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
  }

  // Check if items is a non-empty array
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Check if fulfillments is a non-empty array
  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
    fulfillment?.stops.forEach((stop: any) => {
      delete stop.authorization
    });
  });;
  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = applyCancellation(sessionData.quote, 15)
    existingPayload.message.order.quote = sessionData.quote
  }
  existingPayload.message.order.cancellation = {
    cancelled_by: "CONSUMER",
    reason: {
      descriptor: {
        "code": sessionData.cancellation_reason_id
      }
    }
  }
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider
  }
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at
  existingPayload.message.order.updated_at = now
  existingPayload.message.order.status = "CANCELLED"
  return existingPayload;
}