import { SessionData } from "../../../../session-types";

export async function onConfirmGenerator(
  existingPayload: any,
  sessionData: any,
) {
  const date = new Date().toISOString();
  existingPayload.context.message_id = sessionData.message_id;
  existingPayload.message.order.id = sessionData.confirm_order_id ?? "";
  existingPayload.message.order.ref_order_ids =
    sessionData?.confirm_ref_order_ids?.flat();
  existingPayload.message.order.provider.id =
    sessionData?.confirm_providerId ?? "";
  existingPayload.message.order.quote = sessionData?.confirm_quote ?? {};
  existingPayload.message.order.payments =
    sessionData?.confirm_payments?.flat();
  existingPayload.message.order.fulfillments = sessionData?.confirm_fulfillments
    ?.flat()
    ?.map((fulfillment: any) => {
      const parentFulfillment = "F1";
      if (fulfillment.type === "TRIP") {
        return {
          id: parentFulfillment,
          type: fulfillment?.type ?? "",
          stops: fulfillment.stops ?? [],
          vehicle: {
            category: "BUS",
          },
          tags: [
            {
              descriptor: {
                code: "ROUTE_INFO",
              },
              list: [
                {
                  descriptor: {
                    code: "ROUTE_ID",
                  },
                  value: crypto?.randomUUID().slice(0, 5),
                },
                {
                  descriptor: {
                    code: "ROUTE_DIRECTION",
                  },
                  value: "UP",
                },
              ],
            },
          ],
        };
      }
      if (fulfillment.type === "TICKET") {
        return {
          id: crypto.randomUUID().slice(0, 5).toString(),
          type: fulfillment?.type ?? "",
          tags: [
            {
              descriptor: {
                code: "INFO",
              },
              list: [
                {
                  descriptor: {
                    code: "PARENT_ID",
                  },
                  value: parentFulfillment,
                },
              ],
            },
            ...fulfillment.tags,
          ],
        };
      }
    });

  const fulfillment_ids = existingPayload.message.order.fulfillments?.map(
    (fulfillment: any) => fulfillment?.id,
  );
  existingPayload.message.order.items = sessionData?.confirm_items
    ?.flat()
    ?.map((item: any) => {
      return {
        id: item?.id ?? "",
        descriptor: {
          name: "Single Journey Ticket",
          code: "SJT",
          images: [
            {
              url: "https://dtc.delhi.gov.in/sites/default/files/DTC/logo/dtc_logo_2.png",
              size_type: "xs",
            },
          ],
        },
        fulfillment_ids,
        price: item?.price ?? {},
        quantity: item?.quantity ?? {},
        time: (() => {
          const duration = "P2D";
          let validityEndDate = new Date();
          const daysMatch = duration.match(/P(?:T)?(\d+)D/);
          if (daysMatch) {
            const days = parseInt(daysMatch[1], 10);
            validityEndDate.setDate(validityEndDate.getDate() + days);
          }

          return {
            label: "Validity",
            duration: duration,
            timestamp: validityEndDate.toISOString(),
          };
        })(),
      };
    });
  existingPayload.message.order.payments[0].params.transaction_id = crypto
    .randomUUID()
    .toString();
  existingPayload.message.order.created_at = date;
  existingPayload.message.order.updated_at = date;
  return existingPayload;
}
