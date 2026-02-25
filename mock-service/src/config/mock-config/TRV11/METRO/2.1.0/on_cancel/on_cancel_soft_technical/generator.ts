// type Price = {
//   value: string;
//   currency: string;
// };

// type Item = {
//   id: string;
//   price: Price;
//   quantity: {
//     selected: {
//       count: number;
//     };
//   };
// };

// type Breakup = {
//   title: string;
//   item?: Item;
//   price: Price;
// };

// type Quote = {
//   price: Price;
//   breakup: Breakup[];
// };

// // function applyCancellation(quote: Quote, cancellationCharges: number): Quote {
// //   // Parse the current price
// //   const currentTotal = parseFloat(quote.price.value);

// //   // Calculate the total refund for items
// //   const refundAmount = quote.breakup
// //     .filter((b) => b.title === "BASE_FARE" && b.item)
// //     .reduce((sum, breakup) => {
// //       const itemTotal = parseFloat(breakup.price.value);
// //       return sum + itemTotal;
// //     }, 0);

// //   // Create a REFUND breakup for items
// //   const refundBreakups: Breakup[] = quote.breakup
// //     .filter((b) => b.title === "BASE_FARE" && b.item)
// //     .map((baseFare) => ({
// //       title: "REFUND",
// //       item: {
// //         ...baseFare.item!,
// //         price: {
// //           ...baseFare.item!.price,
// //           value: `-${baseFare.item!.price.value}`, // Negative for refund
// //         },
// //       },
// //       price: {
// //         ...baseFare.price,
// //         value: `-${baseFare.price.value}`, // Negative for refund
// //       },
// //     }));

// //   // Create a CANCELLATION_CHARGES breakup
// //   const cancellationBreakup: Breakup = {
// //     title: "CANCELLATION_CHARGES",
// //     price: {
// //       currency: "INR",
// //       value: cancellationCharges.toFixed(2),
// //     },
// //   };

// //   // Update the total price
// //   const newTotal = currentTotal - refundAmount + cancellationCharges;

// //   // Return the updated quote
// //   return {
// //     price: {
// //       ...quote.price,
// //       value: newTotal.toFixed(2),
// //     },
// //     breakup: [...quote.breakup, ...refundBreakups, cancellationBreakup],
// //   };
// // }
// function removeTicketStops(order: any) {
//   if (!order.fulfillments || !Array.isArray(order.fulfillments)) return order;

//   order.fulfillments = order.fulfillments.map((fulfillment: any) => {
//     if (fulfillment.type === "TICKET" && fulfillment.stops) {
//       // Destructure to omit stops and state
//       const { stops, state, ...rest } = fulfillment;
//       return rest;
//     }
//     return fulfillment;
//   });

//   return order;
// }

// export async function onCancelSoftTechnicalGenerator(
//   existingPayload: any,
//   sessionData: any,
// ) {
//   const now = new Date().toISOString();
//   if (sessionData.updated_payments.length > 0) {
//     existingPayload.message.order.payments = sessionData.updated_payments;
//   }

//   if (sessionData.items.length > 0) {
//     existingPayload.message.order.items = sessionData.items;
//   }

//   if (sessionData.fulfillments.length > 0) {
//     existingPayload.message.order.fulfillments = sessionData.fulfillments;
//     existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
//       fulfillment?.stops.forEach((stop: any) => {
//         delete stop.authorization;
//       });
//     });

//     existingPayload.message.order = removeTicketStops(
//       existingPayload.message.order,
//     );
//   }
//   if (sessionData.order_id) {
//     existingPayload.message.order.id = sessionData.order_id;
//   }
//   if (sessionData.quote != null) {
//     existingPayload.message.order.quote = sessionData.quote ?? {};
//   }
//   existingPayload.message.order.status = "SOFT_CANCEL";
//   existingPayload.message.order.cancellation = {
//     cancelled_by: "CONSUMER",
//     reason: {
//       descriptor: {
//         code: sessionData.cancellation_reason_id,
//       },
//     },
//     time: now,
//   };
//   if (sessionData.provider) {
//     existingPayload.message.order.provider = sessionData.provider;
//   }
//   existingPayload.message.order.tags = sessionData?.tags?.flat() ?? []
//   existingPayload.message.order.created_at = sessionData.created_at;
//   existingPayload.message.order.updated_at = now;
//   return existingPayload;
// }

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
function removeTicketStops(order: any) {
  if (!order.fulfillments || !Array.isArray(order.fulfillments)) return order;

  order.fulfillments = order.fulfillments;

  return order;
}

export async function onCancelSoftTechnicalGenerator(
  existingPayload: any,
  sessionData: any,
) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
    if (sessionData?.flow_id === "TECHNICAL_CANCELLATION_FLOW") {
      existingPayload.message.order.fulfillments =
        existingPayload.message.order.fulfillments?.map((f: any) => {
          if (f.type === "TICKET") {
            return {
              ...f,
              state: {
                descriptor: {
                  code: "INACTIVE",
                },
              },
            };
          }
          return f;
        });
    }
    existingPayload.message.order = removeTicketStops(
      existingPayload.message.order,
    );
  }
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = applyCancellation(
      sessionData.quote,
      0,
    );
  }
  existingPayload.message.order.status = "SOFT_CANCEL";
  existingPayload.message.order.cancellation = {
    cancelled_by: "CONSUMER",
    reason: {
      descriptor: {
        code: sessionData.cancellation_reason_id,
      },
    },
  };
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider;
  }
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.tags = sessionData?.tags?.flat();

  //______SETTLEMENT_AMOUNT____________
  const tags = existingPayload?.message?.order?.tags;
  if (!tags) return;

  const collectedBy = sessionData?.collected_by;
  const price = Number(
    existingPayload?.message?.order?.quote?.price?.value ?? 0,
  );

  const buyerFinderFeesTag = tags?.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );

  const feePercentage = Number(
    buyerFinderFeesTag?.list?.find(
      (item: any) => item?.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE",
    )?.value ?? 0,
  );

  const feeAmount = (price * feePercentage) / 100;

  let settlementAmount = 0;
  if (collectedBy === "BAP") {
    settlementAmount = price - feeAmount;
  } else if (collectedBy === "BPP") {
    settlementAmount = feeAmount;
  } else {
    settlementAmount = price;
  }

  const settlementTermsTag = tags?.find(
    (tag: any) => tag?.descriptor?.code === "BAP_TERMS",
  );
  const settlementTermsTagBpp = tags?.find(
    (tag: any) => tag?.descriptor?.code === "BPP_TERMS",
  );

  const settlementAmountItem = settlementTermsTag?.list?.find(
    (item: any) => item?.descriptor?.code === "SETTLEMENT_AMOUNT",
  );
  const settlementAmountItemBpp = settlementTermsTagBpp?.list?.find(
    (item: any) => item?.descriptor?.code === "SETTLEMENT_AMOUNT",
  );

  if (settlementAmountItem) {
    settlementAmountItem.value = settlementAmount.toString();
  }

  if (settlementAmountItemBpp) {
    settlementAmountItemBpp.value = settlementAmount.toString();
  }

  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
