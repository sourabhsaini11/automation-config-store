import { randomBytes } from "crypto";
import { SessionData } from "../../../../session-types";
function enhancePayments(payments: any) {
  const additionalParams = {
    bank_code: "XXXXXXXX",
    bank_account_number: "xxxxxxxxxxxxxx",
  };

  return payments.map((payment: any) => ({
    ...payment,
    params: {
      ...payment.params,
      // ...additionalParams,
    },
  }));
}
function generateQrToken(): string {
  return randomBytes(32).toString("base64");
}
function updateOrderTimestamps(payload: any) {
  const now = new Date().toISOString();
  if (payload.message.order) {
    payload.message.order.created_at = now;
    payload.message.order.updated_at = now;
  }
  return payload;
}

function updateFulfillmentsWithParentInfo(
  fulfillments: any[],
  sessionData: SessionData
): void {
  // Build a Map from fulfillment ID → buyer side fulfillment object
  const buyerFulfillmentMap = new Map(
    (sessionData.buyer_side_fulfillment_ids || []).map((f: any) => [f.id, f])
  );

  fulfillments.forEach((fulfillment) => {
    if (fulfillment.type === "TRIP") {
      fulfillment.stops.type = "START"
      fulfillment["state"] = {
        descriptor: {
          code: "INACTIVE",
        },
      };
      return;
    }

    const qrToken = generateQrToken();

    // Ensure stops array exists
    fulfillment.stops = fulfillment.stops || [];

    // Check if this fulfillment exists in buyer-side list and has a vehicle
    const buyerEntry = buyerFulfillmentMap.get(fulfillment.id);
    const authStatus = buyerEntry?.vehicle ? "CLAIMED" : "UNCLAIMED";

    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    const y = istNow.getFullYear();
    const m = istNow.getMonth();
    const d = istNow.getDate();
    const endIST = new Date(Date.UTC(y, m, d + 1, 4 - 5, 30 - 30, 0));
    const validTo = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    // If a stop exists, modify the first stop; otherwise, create a new one
    if (fulfillment.stops.length > 0) {
      fulfillment.stops[0].type ="START"
      fulfillment.stops[0].authorization = {
        type: "QR_AND_VEHICLE_NUMBER",
        status: authStatus,
        token: qrToken,
        valid_to: validTo,
      };
    } else {
      fulfillment.stops.push({
        type: "START",
        authorization: {
          type: "QR_AND_VEHICLE_NUMBER",
          status: authStatus,
          token: qrToken,
          valid_to: validTo,
        },
      });
    }
  });
}

export async function onConfirmVehConfGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  const randomId = Math.random().toString(36).substring(2, 15);
  const order_id = randomId;
  existingPayload.message.order.payments = enhancePayments(
    sessionData.updated_payments
  );
  updateFulfillmentsWithParentInfo(sessionData.fulfillments, sessionData);

  // Check if items is a non-empty array
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Check if fulfillments is a non-empty array
  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  existingPayload.message.order.id = order_id;
  existingPayload = updateOrderTimestamps(existingPayload);
  existingPayload.message.order.tags = sessionData.tags.flat()
  return existingPayload;
}
