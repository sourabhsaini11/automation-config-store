import { SessionData } from "../../session-types";

const customer = {
  contact: {
    phone: "9876556789",
  },
  person: {
    name: "Joe Adams",
  },
};

export async function initGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
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
  delete existingPayload.message.order.fulfillments[0].type;
  existingPayload.message.order.items[0] = {
    id: sessionData.selected_item_id,
  };
  return existingPayload;
}
