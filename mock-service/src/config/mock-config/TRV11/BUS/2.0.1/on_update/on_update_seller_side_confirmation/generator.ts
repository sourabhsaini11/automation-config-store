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
      ...additionalParams,
    },
  }));
}
function generateQrToken(): string {
  return randomBytes(32).toString("base64");
}
function updateOrderTimestamps(payload: any, sessionData: any) {
  const now = new Date().toISOString();
  if (payload.message.order) {
    payload.message.order.created_at = sessionData.created_at;
    payload.message.order.updated_at = now;
  }
  return payload;
}

function updateFulfillmentsWithParentInfo(
  fulfillments: any[],
  sessionData: SessionData,
): void {
  const validTo = new Date(Date.now() + 6 * 60 * 60 * 60).toISOString();

  fulfillments.forEach((fulfillment) => {
    // Generate a random QR token
    if (fulfillment.type === "TRIP") {
      return;
    }
    const qrToken = generateQrToken();

    // Ensure stops array exists
    fulfillment.stops = fulfillment.stops || [];

    // If a stop exists, modify the first stop; otherwise, create a new one
    if (fulfillment.stops.length > 0) {
      fulfillment.stops[0].authorization = {
        type: "QR",
        token: qrToken,
        valid_to: validTo,
        status: "UNCLAIMED",
      };
    } else {
      fulfillment.stops.push({
        type: "START",
        authorization: {
          type: "QR",
          token: qrToken,
          valid_to: validTo,
          status: "UNCLAIMED",
        },
      });
    }

    // Generate a random ticket number
    const ticketNumber = Math.random().toString(36).substring(2, 10);

    // Ensure tags array exists
    fulfillment.tags = fulfillment.tags || [];

    // Add the new TICKET_INFO tag
    fulfillment.tags.push({
      descriptor: {
        code: "TICKET_INFO",
      },
      list: [
        {
          descriptor: {
            code: "NUMBER",
          },
          value: ticketNumber,
        },
      ],
    });
  });
}

export async function onUpdateGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  const order_id = sessionData.order_id;
  existingPayload.message.order.payments = enhancePayments(
    sessionData.updated_payments,
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
  sessionData.fulfillments = sessionData.fulfillments.map((fulfillment) => {
    if (fulfillment.type === "TRIP") {
      return {
        ...fulfillment,
        vehicle: {
          ...fulfillment.vehicle,
          registration: "OD02BX5364",
        },
        agent: {
          person: {
            id: "emp:E52432",
          },
        },
      };
    }

    if (fulfillment.type === "TICKET") {
      return {
        ...fulfillment,
        stops: fulfillment.stops.map((stop:any) => ({
          ...stop,
          authorization: stop.authorization
            ? {
                ...stop.authorization,
                status: "CLAIMED",
              }
            : stop.authorization,
        })),
      };
    }

    return fulfillment;
  });
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote;
  }
  if (sessionData.cancellation_terms != null) {
    existingPayload.message.order.cancellation_terms =
      sessionData.cancellation_terms.flat();
  }
  if (sessionData.billing != null) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  if (sessionData.tags != null) {
    existingPayload.message.order.tags = sessionData.tags;
  }
  if (sessionData.provider != null) {
    existingPayload.message.order.provider = sessionData.provider;
  }

  existingPayload.message.order.id = order_id;
  existingPayload.message.order.status = "COMPLETED";
  existingPayload = updateOrderTimestamps(existingPayload, sessionData);
  return existingPayload;
}
