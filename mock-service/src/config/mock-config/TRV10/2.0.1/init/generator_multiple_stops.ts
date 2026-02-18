import { SessionData } from "../../session-types";

const customer = {
  contact: {
    phone: "9876556789",
  },
  person: {
    name: "Joe Adams",
  },
};
export async function initMultipleStopsGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  existingPayload.message.order.billing =
    sessionData?.flow_id === "OnDemand_Female_driver_flow"
      ? {
          name: "Sophia",
        }
      : existingPayload.message.order.billing;
  existingPayload.message.order.fulfillments =
    sessionData.selected_fulfillments;
  existingPayload.message.order.fulfillments[0]["customer"] = {
    contact: {
      phone: "9876556789",
    },
    person: {
      name:
        sessionData?.flow_id === "OnDemand_Female_driver_flow"
          ? "Sophia"
          : "Joe Adams",
    },
  };
  existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
    fulfillment.stops?.forEach((stop: any) => {
      if (
        stop.type === "START" &&
        sessionData.flow_id !==
          "OnDemand_Assign_driver_post_onconfirmSelfPickup"
      ) {
        delete stop.instructions;
      }
    });
  });
  delete existingPayload.message.order.fulfillments[0].type;
  delete existingPayload.message.order.fulfillments[0].tags;
  if (
    sessionData.flow_id === "OnDemand_Assign_driver_post_onconfirmSelfPickup"
  ) {
    existingPayload.message.order.fulfillments[0].type = "SELF_PICKUP";
    delete existingPayload.message.order.fulfillments[0].vehicle.energy_type;
  }
  existingPayload.message.order.items[0] = {
    id: sessionData.selected_item_id,
  };
  existingPayload.message.order.payments[0].collected_by =
    sessionData.collected_by;

  const payment0 = existingPayload?.message?.order?.payments?.[0];
  if (!payment0) return;

  const collectedBy = payment0?.collected_by; // "BAP" | "BPP"
  const price = Number(sessionData?.quote?.price?.value ?? 0);

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

  existingPayload.message.order.provider.id = sessionData.provider_id;
  return existingPayload;
}
