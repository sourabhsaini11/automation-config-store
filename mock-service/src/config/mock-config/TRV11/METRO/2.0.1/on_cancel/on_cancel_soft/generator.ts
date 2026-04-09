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

const modifyPayments = (payments: any, order: any) => {
  payments.forEach((payment: any) => {
    const buyerFinderTag = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "BUYER_FINDER_FEES"
    );

    const percentageEntry = buyerFinderTag?.list.find(
      (item: any) => item.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE"
    );

    const settlementTerms = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "SETTLEMENT_TERMS"
    );
    if (settlementTerms && settlementTerms.list) {
      const settlementAmountEntry = settlementTerms.list.find(
        (entry: any) => entry.descriptor?.code === "SETTLEMENT_AMOUNT"
      );

      const price = parseFloat(order?.quote?.price?.value) || 0;
      const feePercentage = parseFloat(percentageEntry.value) || 0;
      const feeAmount = (price * feePercentage) / 100;
      const finalAmount =
        payment.collected_by === "BAP" ? price - feeAmount : feeAmount;

      if (settlementAmountEntry) {
        settlementAmountEntry.value = finalAmount.toFixed(2);
      }
    }
  });
  return payments;
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
function removeTicketStops(order: any) {
  if (!order.fulfillments || !Array.isArray(order.fulfillments)) return order;

  order.fulfillments = order.fulfillments.map((fulfillment: any) => {
    if (fulfillment.type === "TICKET" && fulfillment.stops) {
      // Destructure to omit stops
      const { stops, ...rest } = fulfillment;
      return rest;
    }
    return fulfillment;
  });

  return order;
}

export async function onCancelSoftGenerator(
  existingPayload: any,
  sessionData: any
) {
  const now = new Date().toISOString();


  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
    existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
      fulfillment?.stops.forEach((stop: any) => {
        delete stop.authorization;
      });
    });
    if (sessionData.billing) {
      existingPayload.message.order.billing = sessionData.billing;
    }
    existingPayload.message.order = removeTicketStops(
      existingPayload.message.order
    );
  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = applyCancellation(
      sessionData.quote,
      15
    );
  }
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = modifyPayments(
      sessionData.updated_payments,
      existingPayload.message.order
    );
  }

  existingPayload.message.order.status = "SOFT_CANCEL";
  existingPayload.message.order.cancellation = {
    cancelled_by: "CONSUMER",
    time: now,
    reason: {
      descriptor: {
        code: sessionData.cancellation_reason_id,
      },
    },
  };
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider;
  }
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
