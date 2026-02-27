import { createFullfillment } from "../../on_search/fullfillment-generator";
import { exampleFullfillment } from "../../on_search/fullfillment-generator";
import { SessionData } from "../../../../session-types";

const createQuoteFromItems = (items: any): any => {
  let totalPrice = 0; // Initialize total price

  const breakup = items.map((item: any) => {
    const itemTotalPrice =
      Number(item.price.value) * item.quantity.selected.count; // Calculate item total price
    totalPrice += itemTotalPrice; // Add to total price

    return {
      title: "BASE_FARE",
      item: {
        id: item.id,
        price: {
          currency: item.price.currency,
          value: item.price.value,
        },
        quantity: {
          selected: {
            count: item.quantity.selected.count,
          },
        },
      },
      price: {
        currency: item.price.currency,
        value: itemTotalPrice.toFixed(2),
      },
    };
  });

  return {
    price: {
      value: totalPrice.toFixed(2), // Total price as a string with two decimal places
      currency: items[0]?.price.currency || "INR", // Use currency from the first item or default to "INR"
    },
    breakup,
  };
};

function updateSettlementAmount(payload: any, sessionData: SessionData) {
  const payments = payload?.message?.order?.payments || [];
  const quotePrice =
    payload?.message?.order?.quote?.price?.value || sessionData.price;

  payments.forEach((payment: any) => {
    const collectedBy = sessionData.collected_by;
    const settlementTerms = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "SETTLEMENT_TERMS",
    );

    if (settlementTerms && settlementTerms.list) {
      const settlementAmountEntry = settlementTerms.list.find(
        (entry: any) => entry.descriptor?.code === "SETTLEMENT_AMOUNT",
      );

      const price: any = quotePrice;
      const feePercentage: any = sessionData.buyer_app_fee;
      const feeAmount = (price * feePercentage) / 100;

      const finalAmount = collectedBy === "BAP" ? price - feeAmount : feeAmount;

      if (settlementAmountEntry) {
        settlementAmountEntry.value = finalAmount.toString();
      } else {
        // Add it if not already present
        settlementTerms.list.push({
          descriptor: { code: "SETTLEMENT_AMOUNT" },
          value: finalAmount.toString(),
        });
      }
    }
  });

  return payload;
}
const createCustomRoute = (endStop: any) => {
  const STOP: any = [];
  const stops = exampleFullfillment.fulfillments[0].stops;
  const targetGps = endStop?.stops[0]?.location?.descriptor?.name;

  for (const stop of stops) {
    if (stop?.location?.descriptor?.name === targetGps) {
      STOP.push({
        ...stop,
        type: "END",
      });
      break;
    }

    STOP.push(stop);
  }

  return STOP;
};

export async function onUpdateStopEndGenerator(
  existingPayload: any,
  sessionData: any,
) {
  const now = new Date().toISOString();
  existingPayload.message.order = sessionData?.confirm_order;
  existingPayload.message.order.status = "SOFT_UPDATE";
  console.log(sessionData.update_1_fulfillments);
  let updatedStops = createCustomRoute(sessionData.update_1_fulfillments);

  const getTripOnConfirmFulfillment = sessionData?.fulfillments
    ?.flat()
    ?.find((fulfillment: any) => {
      return fulfillment.type === "TRIP";
    });
  const getStartCode = getTripOnConfirmFulfillment?.stops?.find((stop: any) => {
    return stop.type === "START";
  });
  const getIndex = updatedStops?.findIndex((stop: any) => {
    return (
      stop.location.descriptor.code === getStartCode?.location?.descriptor?.code
    );
  });

  if (getIndex !== -1) {
    updatedStops[getIndex].type = "START";
    updatedStops = updatedStops.slice(getIndex);
  }

  existingPayload.message.order.fulfillments =
  existingPayload?.message?.order?.fulfillments?.map((fulfillment: any) => {
    if (fulfillment?.type === "TRIP") {
      return {
        ...fulfillment,
        stops: updatedStops?.map((stop: any) => {
          if (stop?.type === "START") {
            const { instructions, parent_stop_id, ...rest } = stop;
            return rest; 
          }
          return stop;
        }),
      };
    }
    return fulfillment;
  });

  // Update item prices based on TRIP fulfillment stops length
  const tripFulfillment = existingPayload.message.order.fulfillments?.find(
    (f: any) => f.type === "TRIP",
  );
  if (tripFulfillment && tripFulfillment.stops) {
    const stopsCount = tripFulfillment.stops.length;
    existingPayload.message.order.items =
      existingPayload.message.order.items?.map((item: any) => {
        const itemCode = item.descriptor?.code;
        // SJT = stops.length * 10, RJT = stops.length * 20
        const multiplier = itemCode === "RJT" ? 20 : 10;
        const calculatedPrice = stopsCount * multiplier;
        return {
          ...item,
          price: {
            ...item.price,
            value: String(calculatedPrice),
          },
        };
      });
  }

  // Create quote based on updated item prices
  const items = existingPayload.message.order.items || [];
  let totalPrice = 0;

  const baseFareBreakup = items.map((item: any) => {
    const itemPrice = Number(item.price?.value) || 0;
    const quantity = item.quantity?.selected?.count || 1;
    const itemTotalPrice = itemPrice * quantity;
    totalPrice += itemTotalPrice;

    return {
      title: "BASE_FARE",
      item: {
        id: item.id,
        price: {
          currency: item.price?.currency || "INR",
          value: String(itemPrice),
        },
        quantity: {
          selected: {
            count: quantity,
          },
        },
      },
      price: {
        currency: item.price?.currency || "INR",
        value: itemTotalPrice.toFixed(2),
      },
    };
  });

  existingPayload.message.order.quote = {
    price: {
      value: totalPrice.toFixed(2),
      currency: items[0]?.price?.currency || "INR",
    },
    breakup: [
      ...baseFareBreakup,
      {
        title: "TAX",
        price: {
          currency: "INR",
          value: "0",
        },
        item: {
          tags: [
            {
              descriptor: {
                code: "TAX",
              },
              list: [
                {
                  descriptor: {
                    code: "CGST",
                  },
                  value: "0",
                },
                {
                  descriptor: {
                    code: "SGST",
                  },
                  value: "0",
                },
              ],
            },
          ],
        },
      },
      {
        title: "OTHER_CHARGES",
        price: {
          currency: "INR",
          value: "0",
        },
        item: {
          tags: [
            {
              descriptor: {
                code: "OTHER_CHARGES",
              },
              list: [
                {
                  descriptor: {
                    code: "SURCHARGE",
                  },
                  value: "0",
                },
              ],
            },
          ],
        },
      },
    ],
  };

  existingPayload.message.order.updated_at = now;
  existingPayload.message.order.tags = sessionData.tags.flat();
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
  return existingPayload;
}
