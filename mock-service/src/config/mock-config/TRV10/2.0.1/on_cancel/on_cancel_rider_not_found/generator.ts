export async function onCancelRiderNotFoundGenerator(
  existingPayload: any,
  sessionData: any,
) {
  function applyCancellation(quote: any, cancellationCharges: number) {
    // Sum all fare components to be refunded (BASE + DISTANCE)
    const refundableAmount = quote.breakup
      .filter(
        (b: any) => b.title === "BASE_FARE" || b.title === "DISTANCE_FARE",
      )
      .reduce((sum: number, b: any) => sum + parseFloat(b.price.value), 0);

    // New total = original total - refundable + cancellation
    const originalTotal = parseFloat(quote.price.value);
    const newTotal = originalTotal - refundableAmount + cancellationCharges;

    return {
      ...quote,
      price: {
        ...quote.price,
        value: String(newTotal)
      },
      breakup: [
        ...quote.breakup,
        {
          title: "REFUND",
          price: {
            currency: quote.price.currency,
            value: `-${refundableAmount}`,
          },
        },
        {
          title: "CANCELLATION_CHARGES",
          price: {
            currency: quote.price.currency,
            value: String(cancellationCharges),
          },
        },
      ],
    };
  }

  // Update payments if available
  if (sessionData.payments?.length > 0) {
    existingPayload.message.order.payments = sessionData.payments;
  }

  // Update items if available
  if (sessionData.items?.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Update fulfillments if available
  if (sessionData.fulfillments?.length > 0) {
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments;
    existingPayload.message.order.fulfillments[0].state.descriptor.code =
      "RIDE_CANCELLED";
  }

  // Update order ID if available
  if (sessionData.order_id) {
    existingPayload.message.order.id = sessionData.order_id;
  }

  // Update quote if available
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = applyCancellation(
      sessionData.quote,
      0, // cancellation charge
    );
  }

  // Set cancellation details
  if (!existingPayload.message.order.cancellation) {
    existingPayload.message.order.cancellation = {
      cancelled_by: "PROVIDER",
      reason: {
        descriptor: {
          code: "011",
        },
      },
    };
  }

  // Ensure order status is CANCELLED
  existingPayload.message.order.status = "CANCELLED";
  const now = new Date().toISOString();

  const payment0 = existingPayload?.message?.order?.payments?.[0];
  if (!payment0) return;

  const collectedBy = payment0?.collected_by; // "BAP" | "BPP"
  const price = Number(existingPayload?.message?.order?.quote?.price?.value ?? 0);

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
