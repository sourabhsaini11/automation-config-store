import { createFullfillment } from "../../on_search/fullfillment-generator";
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
  const quotePrice = payload?.message?.order?.quote?.price?.value || sessionData.price;

  payments.forEach((payment: any) => {
    const collectedBy = sessionData.collected_by;
    const settlementTerms = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "SETTLEMENT_TERMS"
    );

    if (settlementTerms && settlementTerms.list) {
      const settlementAmountEntry = settlementTerms.list.find(
        (entry: any) => entry.descriptor?.code === "SETTLEMENT_AMOUNT"
      );

      const price: any = quotePrice
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

const createCustomRoute = (
  routeData: any[],
  startStationCode: string,
  endStationCode: string
): any[] => {
  console.log(JSON.stringify(routeData));
  return routeData.map((route) => {
    const stops = route.stops;
    // Find the start and end indices based on the input station codes
    const startIndex = stops.findIndex(
      (stop: any) => stop.location.descriptor.code === startStationCode
    );
    const endIndex = stops.findIndex(
      (stop: any) => stop.location.descriptor.code === endStationCode
    );

    console.log("startIndex", startIndex, startStationCode);
    console.log("endIndex", endIndex, endStationCode);
    // Check if both stations exist in the stops list
    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Start or End station not found in the routes`);
    }

    // Ensure start and end indices are different
    if (startIndex === endIndex) {
      throw new Error(`Start and End stations must be different`);
    }

    // Slice and reverse if necessary
    let selectedStops: any[];
    if (startIndex > endIndex) {
      selectedStops = stops.slice(endIndex, startIndex + 1).reverse();
    } else {
      selectedStops = stops.slice(startIndex, endIndex + 1);
    }

    // Adjust types, parent IDs, and assign sequential IDs
    selectedStops.forEach((stop, index) => {
      stop.id = (index + 1).toString(); // Assign sequential ID starting from 1

      if (index === 0) {
        stop.type = "START";
        delete stop.parent_stop_id; // No parent for the first stop
      } else if (index === selectedStops.length - 1) {
        stop.type = "END";
        stop.parent_stop_id = selectedStops[index - 1].id;
      } else {
        stop.type = "INTERMEDIATE_STOP";
        stop.parent_stop_id = selectedStops[index - 1].id;
      }
    });

    // Construct the new route
    return {
      id: route.id,
      stops: selectedStops,
      type: "TRIP",
      vehicle: route.vehicle,
    };
  });
};

export async function onUpdateStopEndGenerator(
  existingPayload: any,
  sessionData: any
) {
  if (sessionData.updated_payments.length > 0) {
    existingPayload.message.order.payments = sessionData.updated_payments;
  }

  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }

  const { start_code, end_code, update_end_stop } = sessionData;
  const oldEndStop = end_code.replace("MOCK_STATION_", "");
  const newEndStop = update_end_stop.location.descriptor.code.replace(
    "MOCK_STATION_",
    ""
  );
  let updatedPrice = 0;
  console.log("The old and new end stop codes are ", oldEndStop, newEndStop);

  if (oldEndStop > newEndStop) {
    updatedPrice = -10;
  } else {
    updatedPrice = 10;
  }

  if (existingPayload.message.order.items) {
    existingPayload.message.order.items =
      existingPayload.message.order.items.map((item: any) => {
        const currentPrice = parseFloat(item.price.value);
        const newPrice = currentPrice + updatedPrice;

        return {
          ...item,
          price: {
            ...item.price,
            value: newPrice.toString(),
          },
        };
      });
  }

  console.log("innnnnn 1");

  existingPayload.message.order.fulfillments.forEach(
    (fulfillment: any, index: number) => {
      console.log("innnnnn 2");
      if (fulfillment.type === "TRIP") {
        console.log("innnnnn 3");
        const route = createFullfillment(
        ).fulfillments;
        console.log("innnnnn 4");
        console.log(
          "The start and end code are ",
          start_code,
          end_code,
          update_end_stop.location.descriptor.code
        );
        const updatedFulfillment = createCustomRoute(
          route,
          start_code,
          update_end_stop.location.descriptor.code
        );
        console.log(
          "fulfillmentssssssssssssssssssssssssss",
          JSON.stringify(updatedFulfillment)
        );

        existingPayload.message.order.fulfillments[index] =
          updatedFulfillment[0];
      }
    }
  );
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  // if (sessionData.quote != null) {
  //   existingPayload.message.order.quote = sessionData.quote;
  // }
  const quote = createQuoteFromItems(existingPayload.message.order.items);
  existingPayload.message.order.quote = quote;

  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider;
  }
  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  existingPayload.message.order.provider = sessionData.provider;
  existingPayload = updateSettlementAmount(existingPayload, sessionData);
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
