import { SessionData } from "../../../session-types";

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
  // Take only refundable components
  const refundableTitles = ["BASE_FARE", "DISTANCE_FARE"];

  const refundableBreakups =
    quote.breakup?.filter((b) => refundableTitles.includes(b.title)) ?? [];

  // Sum BASE + DISTANCE
  const refundAmount = refundableBreakups.reduce(
    (sum, b) => sum + Number(b.price.value),
    0,
  );

  const refundBreakup: Breakup = {
    title: "REFUND",
    price: {
      currency: "INR",
      value: `-${refundAmount.toFixed(2)}`,
    },
  };

  const cancellationBreakup: Breakup = {
    title: "CANCELLATION_CHARGES",
    price: {
      currency: "INR",
      value: cancellationCharges.toFixed(2),
    },
  };

  return {
    ...quote,

    price: {
      currency: "INR",
      value: cancellationCharges.toFixed(2),
    },

    breakup: [...(quote.breakup ?? []), refundBreakup, cancellationBreakup],
  };
}

export async function onCancelAsyncGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  if (sessionData.payments?.length > 0) {
    existingPayload.message.order.payments = sessionData.payments;
  }

  if (sessionData.items?.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments?.length > 0) {
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments.map((fulfillment: any) => {
        return {
          ...fulfillment,
          vehicle: { ...fulfillment.vehicle, energy_type: "CNG" },
          state: {
            descriptor: {
              code: "RIDE_CANCELLED",
            },
          },
          stops: fulfillment.stops
            ?.filter((stop: any) => stop.type !== "END")
            .map((stop: any) =>
              stop.type === "START"
                ? {
                    ...stop,
                    time: {
                      duration: "PT2H",
                    },
                  }
                : stop,
            ),
        };
      });
  }

  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }

  if (sessionData.quote != null) {
    // Using standard cancellation charges for async cancellation
    existingPayload.message.order.quote = applyCancellation(
      sessionData.quote,
      sessionData?.flow_id === "OnDemand_Ride_cancellation_by_driver" ? 0 : 20,
    );
  }
  const now = new Date().toISOString();

  const payment0 = existingPayload?.message?.order?.payments?.[0];
  if (!payment0) return;

  const collectedBy = payment0?.collected_by; // "BAP" | "BPP"
  const price = Number(
    existingPayload?.message?.order?.quote?.price?.value ?? 0,
  );

  const buyerFinderFeesTag = payment0?.tags?.find(
    (tag: any) => tag?.descriptor?.code === "BUYER_FINDER_FEES",
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

  const settlementTermsTag = payment0?.tags?.find(
    (tag: any) => tag?.descriptor?.code === "SETTLEMENT_TERMS",
  );

  const settlementAmountItem = settlementTermsTag?.list?.find(
    (item: any) => item?.descriptor?.code === "SETTLEMENT_AMOUNT",
  );

  if (settlementAmountItem) {
    settlementAmountItem.value = settlementAmount.toString();
  }
  existingPayload.message.order.created_at = sessionData.created_at;
  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
