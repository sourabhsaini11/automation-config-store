import { SessionData } from "../../session-types";

const customer = {
  contact: {
    phone: "9876556789",
  },
  person: {
    name: "Joe Adams",
  },
};

export async function confirmMultipleStopsGenerator(
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
  existingPayload.message.order.fulfillments[0]["customer"] =
    sessionData?.flow_id === "OnDemand_Female_driver_flow"
      ? {
          contact: {
            phone: "9856798567",
          },
          person: {
            name: "Sophia",
          },
        }
      : customer;
  existingPayload.message.order.items[0] = {
    id: sessionData.selected_item_id,
  };
  existingPayload.message.order.payments = sessionData.payments;
  existingPayload.message.order.provider.id = sessionData.provider_id;
  return existingPayload;
}
