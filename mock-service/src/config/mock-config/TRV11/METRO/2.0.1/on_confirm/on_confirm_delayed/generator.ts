import { randomBytes } from "crypto";
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

function generateQrToken(): string {
  return randomBytes(32).toString("base64");
}

function updateFulfillmentsWithParentInfo(fulfillments: any[]): void {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const y = istNow.getFullYear();
  const m = istNow.getMonth();
  const d = istNow.getDate();
  const endIST = new Date(Date.UTC(y, m, d + 1, 4 - 5, 30 - 30, 0));
  const validTo = endIST.toISOString();

  fulfillments.forEach((fulfillment) => {
    // Check if the fulfillment has a parent tag
    const parentTag = fulfillment.tags?.find(
      (tag: any) =>
        tag.descriptor?.code === "INFO" &&
        tag.list?.some(
          (item: any) => item.descriptor?.code === "PARENT_ID"
        )
    );

    if (parentTag) {
      // Generate a random QR token
      const qrToken = generateQrToken();

      // Add the stops object
      fulfillment.stops = [
        {
          type: "START",
          authorization: {
            type: "QR",
            token: qrToken,
            valid_to: validTo,
            status: "UNCLAIMED",
          },
        },
      ];

      // Generate a random ticket number
      const ticketNumber = Math.random().toString(36).substring(2, 10);

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
    }
  });
}


export async function onConfirmDelayedGenerator(existingPayload: any, sessionData: any) {
  const randomId = Math.random().toString(36).substring(2, 15);
  const order_id = randomId
  sessionData["updated_payments"][0]["params"]["bank_code"] = "XXXXXXXX";
  sessionData["updated_payments"][0]["params"]["bank_account_number"] =
    "xxxxxxxxxxxxxx";
  const updated_payments = sessionData.updated_payments;
  if (!Array.isArray(sessionData.updated_payments)) {
    sessionData.updated_payments = [sessionData.updated_payments];
  }
  updateFulfillmentsWithParentInfo(sessionData.fulfillments)
  existingPayload.message.order.payments = updated_payments;
  existingPayload.message.order.payments[0].params.amount = sessionData.price
  existingPayload.message.order.payments[0].id = sessionData.payment_id

  // Check if items is a non-empty array
  if (sessionData.items.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }
  if (sessionData.billing) {
    existingPayload.message.order.billing = sessionData.billing;
  }
  // Check if fulfillments is a non-empty array
  if (sessionData.fulfillments.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }
  if (sessionData.quote != null) {
    existingPayload.message.order.quote = sessionData.quote
  }
  existingPayload.message.order.id = order_id;
  console.log(sessionData.ttl)
  const delay_duration = isoDurationToSeconds(sessionData.ttl) + 2
  console.log("the delay duration is", delay_duration)
  const now = new Date().toISOString();
  if (sessionData.provider) {
    existingPayload.message.order.provider = sessionData.provider
  }
  existingPayload.message.order.created_at = now
  existingPayload.message.order.updated_at = now
  await delay(delay_duration * 1000);
  return existingPayload;
}
