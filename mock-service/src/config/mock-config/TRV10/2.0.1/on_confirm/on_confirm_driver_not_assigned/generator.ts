import { SessionData } from "../../../session-types";

const agent = {
  contact: {
    phone: "9856798567",
  },
  person: {
    name: "Jason Roy",
  },
};
const vehicle = {
  category: "AUTO_RICKSHAW",
  variant: "AUTO_RICKSHAW",
  energy_type: "CNG",
  // make: "Bajaj",
  // model: "Compact RE",
  // registration: "KA-01-AD-9876"
};

function generate6DigitToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getValidToIso(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function updateOrderTimestamps(payload: any) {
  const now = new Date().toISOString();
  if (payload.message.order) {
    payload.message.order.created_at = now;
    payload.message.order.updated_at = now;
  }
  return payload;
}

function updateFulfillmentState(fulfillment: any): void {
  // Set fulfillment state to RIDE_CONFIRMED
  fulfillment.state = {
    descriptor: {
      code: "RIDE_CONFIRMED",
    },
  };
}

export async function onConfirmDriverNotAssignedGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  const order_id = Math.random().toString(36).substring(2, 15);
  existingPayload.message.order.id = order_id;

  // Update order status to ACTIVE
  existingPayload.message.order.status = "ACTIVE";

  // Update fulfillments with state
  if (sessionData.fulfillments?.length > 0) {
    sessionData.fulfillments.forEach((fulfillment) => {
      updateFulfillmentState(fulfillment);
    });
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments;
    existingPayload.message.order.fulfillments[0]["state"] = {
      descriptor: { code: "RIDE_CONFIRMED" },
    };
    // existingPayload.message.order.fulfillments[0]["agent"] = agent
    existingPayload.message.order.fulfillments[0]["vehicle"] = vehicle;
  }

  if (
    sessionData.flow_id === "OnDemand_Assign_driver_post_onconfirmSelfPickup"
  ) {
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments.map((fulfillment: any) => ({
        ...fulfillment,
        stops: fulfillment.stops.map((stop: any) =>
          stop.type === "START"
            ? {
                ...stop,
                authorization: {
                  status: "UNCLAIMED",
                  token: generate6DigitToken(),
                  type: "OTP",
                  valid_to: getValidToIso(2),
                },
              }
            : stop,
        ),
      }));
  }

  // Update items if present
  if (sessionData.items?.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Update quote if present
  if (sessionData.quote) {
    existingPayload.message.order.quote = sessionData.quote;
  }

  // Update payments if present
  if (sessionData.payments?.length > 0) {
    existingPayload.message.order.payments = sessionData.payments;
  }

  // Add cancellation terms
  existingPayload.message.order.cancellation_terms = [
    {
      cancellation_fee: { percentage: "0" },
      fulfillment_state: { descriptor: { code: "RIDE_ASSIGNED" } },
      reason_required: true,
    },
    {
      cancellation_fee: { amount: { currency: "INR", value: "30" } },
      fulfillment_state: { descriptor: { code: "RIDE_ENROUTE_PICKUP" } },
      reason_required: true,
    },
    {
      cancellation_fee: { amount: { currency: "INR", value: "50" } },
      fulfillment_state: { descriptor: { code: "RIDE_ARRIVED_PICKUP" } },
      reason_required: true,
    },
    {
      cancellation_fee: { percentage: "100" },
      fulfillment_state: { descriptor: { code: "RIDE_STARTED" } },
      reason_required: true,
    },
  ];
  // Update timestamps
  existingPayload = updateOrderTimestamps(existingPayload);
  return existingPayload;
}
