import { SessionData } from "../../../session-types";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function onCancelSoftGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  if (sessionData.payments.length > 0) {
    existingPayload.message.order.payments = sessionData.payments;
  }
  existingPayload.message.order.cancellation.reason.descriptor.code =
    sessionData.cancellation_reason_id;
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments;
  }

  for (const fulfillment of existingPayload.message.order.fulfillments) {
    // update vehicle
    fulfillment.vehicle = {
      ...fulfillment.vehicle,
      energy_type: "CNG",
    };

    if (Array.isArray(fulfillment.stops)) {
      fulfillment.stops = fulfillment.stops
        .filter((stop: any) => stop.type !== "END")
        .map((stop: any) =>
          stop.type === "START"
            ? {
                ...stop,
                authorization: {
                  status: "UNCLAIMED",
                  type: "OTP",
                  token: generateOTP(),
                  valid_to: new Date(
                    Date.now() + 30 * 60 * 1000, // 30 minutes
                  ).toISOString(),
                },
                time: {
                  duration: "PT2H",
                },
              }
            : stop,
        );
    }
  }

  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  let quote = existingPayload.message.order.quote;
  const refund_price = existingPayload.message.order.quote.price.value;
  quote.breakup.push(
    {
      title: "CANCELLATION_CHARGES",
      price: {
        currency: "INR",
        value:
          sessionData?.flow_id === "Technical_cancellation_flow" ||
          sessionData?.flow_id === "OnDemand_Ride_cancellation_by_driver"
            ? "0"
            : "50",
      },
    },
    {
      title: "REFUND",
      price: {
        currency: "INR",
        value: String("-" + refund_price),
      },
    },
  );
  existingPayload.message.order.quote.price = {
    currency: "INR",
    value:
      sessionData?.flow_id === "Technical_cancellation_flow" ||
      sessionData?.flow_id === "OnDemand_Ride_cancellation_by_driver"
        ? "0"
        : "50",
  };
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
