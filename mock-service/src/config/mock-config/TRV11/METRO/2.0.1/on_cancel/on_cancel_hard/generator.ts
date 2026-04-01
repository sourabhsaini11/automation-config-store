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
const modifyPayments = (payments: any) => {
  payments.forEach((payment: any) => {
    payment.tags.forEach((tag: any) => {
      if (tag.descriptor?.code === "SETTLEMENT_TERMS") {
        tag.list.forEach((item: any) => {
          if (item.descriptor?.code === "SETTLEMENT_AMOUNT") {
            item.value = "0";
          }
        });
      }
    });
  });
  return payments;
};
export async function onCancelHardGenerator(
  existingPayload: any,
  sessionData: any
) {
  const now = new Date().toISOString();

  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = modifyPayments(
      sessionData.updated_payments
    );
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }

  console.log(
    "existingPayload.message.order.fulfillments",
    JSON.stringify(existingPayload.message.order.fulfillments)
  );

  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
    if (fulfillment?.type == "TRIP") {
      fulfillment?.stops.forEach((stop: any) => {
        delete stop.authorization;
      });
    }
    if (fulfillment?.type == "TICKET") {
      delete fulfillment.stops;
    }
  });

  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    // existingPayload.message.order.quote = applyCancellation(
    //   sessionData.quote,
    //   15
    // );
    existingPayload.message.order.quote = sessionData.quote;
  }

  if (sessionData.flow_id === "TECHNICAL_CANCELLATION_FLOW" || sessionData.flow_id === "TECHNICAL_CANCELLATION_FLOW (W/O Select)") {
    const originalBreakup =
      existingPayload?.message?.order?.quote?.breakup ?? [];

    const breakup = [
      ...originalBreakup.flatMap((breakupItem: any) => [
        breakupItem,
        {
          ...breakupItem,
          title: "REFUND",
          item: {
            ...breakupItem.item,
            price: {
              ...breakupItem.item.price,
              value: `-${breakupItem.item.price.value}`,
            },
          },
          price: {
            ...breakupItem.price,
            value: `-${breakupItem.price.value}`,
          },
        },
      ]),
      {
        title: "CANCELLATION_CHARGES",
        price: {
          currency: "INR",
          value: "0",
        },
      },
    ];

    const totalPrice = breakup.reduce(
      (sum: number, item: any) => sum + Number(item.price?.value || 0),
      0
    );

    existingPayload.message.order.quote = {
      price: {
        currency: "INR",
        value: totalPrice.toString(),
      },
      breakup,
    };
  }

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
