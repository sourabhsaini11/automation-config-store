import { randomBytes } from "crypto";
import { SessionData } from "../../../session-types";

// Add at the top with other types
interface Agent {
  name?: string;
  phone?: string;
}

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
  make: "Bajaj",
  model: "Compact RE",
  registration: "KA-01-AD-9876",
};
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isoDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0; // Invalid format, return 0

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

const generateRandomToken = (length = 6): string =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();

const getValidToIso = (hours = 2): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

function updateOrderTimestamps(payload: any) {
  const now = new Date().toISOString();
  if (payload.message.order) {
    payload.message.order.created_at = now;
    payload.message.order.updated_at = now;
  }
  return payload;
}

function updateFulfillmentWithDriverInfo(
  fulfillment: any,
  sessionData: SessionData,
): void {
  // Set fulfillment state to RIDE_ASSIGNED
  fulfillment.state = {
    descriptor: {
      code: "RIDE_ASSIGNED",
    },
  };

  // Add OTP authorization to the first stop
  if (fulfillment.stops?.[0]) {
    fulfillment.stops[0].authorization = {
      type: "OTP",
      token: generateOTP(),
      valid_to: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes validity
      status: "UNCLAIMED",
    };
  }
}

export async function onConfirmDelayGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  const order_id = Math.random().toString(36).substring(2, 15);
  existingPayload.message.order.id = order_id;

  // Update order status to ACTIVE
  existingPayload.message.order.status = "ACTIVE";

  if (existingPayload.message.order.fulfillments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.fulfillments[0]["_EXTERNAL"];
  }
  existingPayload.message.order.payments = sessionData.payments;
  if (existingPayload.message.order.payments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.payments[0]["_EXTERNAL"];
  }

  // Update fulfillments with driver information
  if (sessionData.fulfillments?.length > 0) {
    sessionData.fulfillments.forEach((fulfillment) => {
      updateFulfillmentWithDriverInfo(fulfillment, sessionData);
    });
    existingPayload.message.order.fulfillments =
      sessionData.selected_fulfillments.map((fulfillment: any) => {
        if (fulfillment.type === "DELIVERY") {
          return {
            ...fulfillment,

            state: {
              descriptor: {
                code: "RIDE_ASSIGNED",
              },
            },

            stops: fulfillment.stops.map((stop: any) =>
              stop.type === "START"
                ? {
                    ...stop,
                    authorization: {
                      token: generateRandomToken(6),
                      type: "OTP",
                      valid_to: getValidToIso(2),
                      status: "UNCLAIMED",
                    },
                  }
                : stop,
            ),

            agent,
            vehicle,
          };
        }

        return fulfillment;
      });
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
  if (existingPayload.message.order.fulfillments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.fulfillments[0]["_EXTERNAL"];
  }
  existingPayload.message.order.payments = sessionData.payments;
  if (existingPayload.message.order.payments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.payments[0]["_EXTERNAL"];
  }
  // Update timestamps
  existingPayload = updateOrderTimestamps(existingPayload);
  existingPayload.message.order.fulfillments["type"] = "DELIVERY";
  if (existingPayload.message.order.fulfillments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.fulfillments[0]["_EXTERNAL"];
  }
  existingPayload.message.order.payments = sessionData.payments;
  if (existingPayload.message.order.payments[0]["_EXTERNAL"]) {
    delete existingPayload.message.order.payments[0]["_EXTERNAL"];
  }
  const delay_duration = isoDurationToSeconds(sessionData?.ttl as string) + 2;
  await delay(delay_duration * 1000);
  return existingPayload;
}
