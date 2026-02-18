import { SessionData } from "../../session-types";
import { onStatusMultipleStopsGenerator } from "./generator_multiple_stops";

function updateFulfillmentStatus(order: any, sessionData: SessionData) {
  // Check if fulfillments exist
  if (order.fulfillments) {
    order.fulfillments.forEach((fulfillment: any) => {
      if (
        sessionData?.flow_id ===
        "OnDemand_Assign_driver_post_onconfirmSelfPickup"
      ) {
        fulfillment.type = "SELF_PICKUP";
      }
      fulfillment.state.descriptor.code = "RIDE_ENDED";
      fulfillment.state.descriptor.name = "Your ride has ended";
    });
  }
  return order;
}

function updatePaymentFromQuote(order: any, transaction_id: any) {
  const amount = order.quote.price.value; // Extract amount from quote
  const randomPaymentId = Math.random().toString(36).substring(2, 15);
  if (order.payments) {
    order.payments.forEach((payment: any) => {
      payment.params = {
        amount: amount,
        // transaction_id: randomPaymentId
        bank_account_number: "xxxxxxxxxxxxxx",
        bank_code: "XXXXXXXX",
        virtual_payment_address: "9988199772@okicic",
      }; // Set amount from quote
      payment.status = "PAID"; // Change status to PAID
    });
  }

  return order;
}
export async function onStatusRidePaidGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  existingPayload = await onStatusMultipleStopsGenerator(
    existingPayload,
    sessionData,
  );
  existingPayload.message.order = updatePaymentFromQuote(
    existingPayload.message.order,
    sessionData.transaction_id,
  );
  existingPayload.message.order = updateFulfillmentStatus(
    existingPayload.message.order,
    sessionData,
  );
  existingPayload.message.order.status = "COMPLETED";
  // existingPayload.message.order.fulfillments =
  //   existingPayload.message.order.fulfillments.map((fulfillment: any) => ({
  //     ...fulfillment,
  //     stops: fulfillment.stops.map((stop: any) =>
  //       stop.type === "START" && stop.authorization
  //         ? {
  //             ...stop,
  //             authorization: {
  //               ...stop.authorization,
  //               status: "CLAIMED",
  //             },
  //           }
  //         : stop,
  //     ),
  //   }));

  if (sessionData?.flow_id === "OnDemand_journey_updation_flow") {
    existingPayload.message.order.items =
      existingPayload.message.order.items?.map((item: any, index: number) => {
        return {
          ...item,
          price:
            sessionData?.on_update_items_journey_updation?.flat()?.[index]
              ?.price,
        };
      });

    existingPayload.message.order.quote =
      sessionData?.on_update_quote_journey_updation ?? {};
    existingPayload.message.order.payments =
      existingPayload.message.order.payments?.map((payment: any, index: number) => {
        return {
          ...payment,
          params: {
            ...payment.params,
            amount:
              existingPayload.message.order.quote?.price?.value.toString(),
          },
          tags: sessionData?.on_update_payments_journey_updation?.flat()?.[index]?.tags
        };
      });
  }

  return existingPayload;
}
