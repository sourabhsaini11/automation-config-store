import { randomBytes } from "crypto";
import { SessionData } from "../../../session-types";

const agent = {
  contact: {
    phone: "9856798567",
  },
  person: {
    name: "Jason Roy",
  },
};
function updateFulfillments(fulfillments: any[]) {
  return fulfillments.map((fulfillment) => {
    // Add the vehicle object to each fulfillment
    if (fulfillment.vehicle.category === "AUTO_RICKSHAW") {
      fulfillment.vehicle = {
        category: "AUTO_RICKSHAW",
        variant: "AUTO_RICKSHAW",
        make: "Bajaj",
        model: "Compact RE",
        registration: "KA-01-AD-9876",
      };
    } else {
      fulfillment.vehicle = {
        category: "CAB",
        variant: "SEDAN",
        make: "Maruti",
        model: "Swift Dzire",
        registration: "KA-01-AD-9876",
      };
    }

    // Find the stop with type "START"
    const startStop = fulfillment.stops.find(
      (stop: any) => stop.type === "START",
    );

    // If found, add the authorization object
    if (startStop) {
      const now = new Date();
      const newTime = new Date(now.getTime() + 15 * 60000).toISOString();
      startStop.authorization = {
        token: "234234",
        type: "OTP",
        valid_to: newTime,
        status: "UNCLAIMED",
      };
    }

    return fulfillment;
  });
}

export async function onConfirmMultipleStopsGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  console.log(JSON.stringify(sessionData.fulfillments));
  const randomId = Math.random().toString(36).substring(2, 15);
  const order_id = randomId;
  existingPayload.message.order.payments = sessionData.payments;

  // Check if items is a non-empty array
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Check if fulfillments is a non-empty array
  if (sessionData.selected_fulfillments.length > 0) {
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments;
    existingPayload.message.order.fulfillments = updateFulfillments(
      existingPayload.message.order.fulfillments,
    );
    existingPayload.message.order.fulfillments[0]["agent"] =
      sessionData?.flow_id === "OnDemand_Female_driver_flow"
        ? {
            contact: {
              phone: "9856798567",
            },
            person: {
              name: "Sarah",
              gender: "FEMALE"
            },
          }
        : agent;
    existingPayload.message.order.fulfillments[0]["state"] = {
      descriptor: { code: "RIDE_ASSIGNED" },
    };
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }
  existingPayload.message.order.id = order_id;
  existingPayload.message.order.status = "ACTIVE";
  existingPayload.message.order.payments = sessionData.payments;
  const now = new Date().toISOString();
  existingPayload.message.order.created_at = now;
  existingPayload.message.order.updated_at = now;
  return existingPayload;
}
