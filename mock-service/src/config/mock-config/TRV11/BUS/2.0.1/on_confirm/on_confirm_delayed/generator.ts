import { randomBytes } from "crypto";
import { SessionData } from "../../../../session-types";
function isoDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0; // Invalid format, return 0

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function enhancePayments(payments:any) {
  const additionalParams = {
    bank_code: "XXXXXXXX",
    bank_account_number: "xxxxxxxxxxxxxx",
  };
  
  return payments.map((payment:any) => ({
    ...payment,
    params: {
    ...payment.params,
    ...additionalParams
    }
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

function updateFulfillmentsWithParentInfo(fulfillments: any[]): void {
  const validTo = "2024-07-23T23:59:59.999Z";

  fulfillments.forEach((fulfillment) => {
    // Generate a random QR token
    if(fulfillment.type === "TRIP"){
      return
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


export async function onConfirmDelayedGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  const randomId = Math.random().toString(36).substring(2, 15);
  const order_id = randomId;
  existingPayload.message.order.payments = enhancePayments(sessionData.updated_payments)
  updateFulfillmentsWithParentInfo(sessionData.fulfillments);
  
    // Check if items is a non-empty array
  if (sessionData.items.length > 0) {
  existingPayload.message.order.items = sessionData.items;
  }

  // Check if fulfillments is a non-empty array
  if (sessionData.fulfillments.length > 0) {
  existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  if(sessionData.quote != null){
  existingPayload.message.order.quote = sessionData.quote
  }
  existingPayload.message.order.id = order_id;
  const delay_duration = isoDurationToSeconds(sessionData.ttl) + 2
  const now = new Date().toISOString();
  await delay(delay_duration*1000); 
  existingPayload = updateOrderTimestamps(existingPayload)
  return existingPayload;
}