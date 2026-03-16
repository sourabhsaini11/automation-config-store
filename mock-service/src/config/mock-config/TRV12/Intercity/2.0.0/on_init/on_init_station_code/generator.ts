import { SessionData } from "../../../../session-types";

export async function onInitGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  existingPayload.context.location.city.code = sessionData.city_code;

  existingPayload.message.order.items = [sessionData.on_select_items];
  existingPayload.message.order.provider = {
    ...sessionData.provider,
    descriptor: sessionData.catalog_descriptor,
  };
  existingPayload.message.order.cancellation_terms =
    sessionData?.cancellation_terms?.flat();
  existingPayload.message.order.quote = sessionData.quote;
  existingPayload.message.order.payments = sessionData.payments?.map(
    (p: any) => ({
      ...p,
      params: {
        bank_code: "XXXXXXXX",
        bank_account_number: "xxxxxxxxxxxxxx",
        virtual_payment_address: "9988199772@okicic",
      },
    })
  );
  existingPayload.message.order.fulfillments = buildFulfillments(
    sessionData.on_select_fulfillments.flat(),
    sessionData.fulfillments
  );

  return existingPayload;
}

function buildFulfillments(onSelectFulfillments: any[], fulfillments: any[]) {
  return onSelectFulfillments.map((onSelectF) => {
    const match = fulfillments.find((f: any) => f.id === onSelectF.id);

    if (onSelectF.type === "TRIP") {
      return {
        id: onSelectF.id,
        type: onSelectF.type,
        vehicle: onSelectF.vehicle,
        stops: onSelectF.stops,
      };
    }

    if (onSelectF.type === "TICKET") {
      const seatGrid = onSelectF.tags.find(
        (t: any) => t.descriptor.code === "SEAT_GRID"
      );
      const enrichedList = seatGrid.list.concat([
        { descriptor: { code: "SELECTED" }, value: "true" },
      ]);

      return {
        id: onSelectF.id,
        type: onSelectF.type,
        customer: match?.customer,
        tags: [{ descriptor: { code: "SEAT_GRID" }, list: enrichedList }],
      };
    }

    return onSelectF;
  });
}
