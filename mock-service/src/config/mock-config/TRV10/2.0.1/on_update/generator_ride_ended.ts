import { SessionData } from "../../session-types";
import { onUpdateMultipleStopsGenerator } from "./generator_multiple_stops";

function updateFulfillmentStatus(order: any, sessionData: SessionData) {
  // Check if fulfillments exist
  if (order.fulfillments) {
    order.fulfillments.forEach((fulfillment: any) => {
      if (
        sessionData?.flow_id ===
        "OnDemand_Assign_driver_post_onconfirmSelfPickup"
      ) {
        fulfillment.type = "SELF_PICKUP";
      }
      fulfillment.state.descriptor.code = "RIDE_ENDED";
    });
  }
  return order;
}

export async function onUpdateRideEndedGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  existingPayload = await onUpdateMultipleStopsGenerator(
    existingPayload,
    sessionData,
  );
  existingPayload.message.order = updateFulfillmentStatus(
    existingPayload.message.order,
    sessionData,
  );
  if (
    sessionData.flow_id === "OnDemand_Assign_driver_on_onconfirm" ||
    sessionData.flow_id === "OnDemand_journey_updation_flow"
  ) {
    existingPayload.message.order.items =
      existingPayload?.message?.order?.items?.map((item: any) => {
        const filteredTags =
          item?.tags?.filter(
            (tag: any) => tag?.descriptor?.code === "FARE_POLICY",
          ) ?? [];

        return {
          ...item,
          tags: filteredTags,
        };
      }) ??
      existingPayload?.message?.order?.items?.map((item: any) => {
        const filteredTags = item?.tags?.[0];

        return {
          ...item,
          tags: filteredTags,
        };
      });
  }

  if (sessionData.flow_id === "OnDemand_journey_updation_flow") {
    existingPayload.message.order.items =
      existingPayload.message.order.items?.map((item: any) => {
        return {
          ...item,
          price: {
            ...item?.price,
            value: (Number(item?.price?.value) + 4).toString(),
          },
        };
      });

    const updatedBreakup = existingPayload?.message?.order?.quote?.breakup.map(
      (item: any) => {
        if (item.title === "DISTANCE_FARE") {
          return {
            ...item,
            price: {
              ...item.price,
              value: (Number(item.price.value) + 4).toString(),
            },
          };
        }
        return item;
      },
    );

    const totalPrice = updatedBreakup.reduce((sum: any, item: any) => {
      return sum + Number(item.price.value);
    }, 0);

    existingPayload.message.order.quote = {
      ...existingPayload.message.order.quote,
      breakup: updatedBreakup,
      price: {
        currency: "INR",
        value: totalPrice.toString(),
      },
    };

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
        (item: any) =>
          item?.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE",
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
  }

  return existingPayload;
}
