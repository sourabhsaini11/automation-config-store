import { SessionData } from "../../../../session-types";
import { createFullfillment } from "./fullfillment-generator";

function updatePaymentDetails(payload: any, sessionData: SessionData) {
  const providers = payload?.message?.catalog?.providers || [];

  providers.forEach((provider: any) => {
    const payments = provider?.payments || [];

    payments.forEach((payment: any) => {
      // Update collected_by
      payment.collected_by = sessionData.collected_by;

      // Update BUYER_FINDER_FEES_PERCENTAGE in tags
      const buyerFinderTag = payment.tags?.find(
        (tag: any) => tag.descriptor?.code === "BUYER_FINDER_FEES",
      );

      if (buyerFinderTag?.list) {
        const feeEntry = buyerFinderTag.list.find(
          (item: any) =>
            item.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE",
        );

        if (feeEntry) {
          feeEntry.value = sessionData.buyer_app_fee;
        } else {
          // Add it if not present
          buyerFinderTag.list.push({
            descriptor: { code: "BUYER_FINDER_FEES_PERCENTAGE" },
            value: sessionData.buyer_app_fee,
          });
        }
      }
    });
  });

  return payload;
}
const createCustomRoute = (
  routeData: any[],
  startStationCode: string,
  endStationCode: string,
): any[] => {
  return routeData.map((route) => {
    const stops = route.stops;

    // Find the start and end indices based on the input station codes
    const startIndex = stops.findIndex(
      (stop: any) => stop.location.descriptor.code === startStationCode,
    );
    const endIndex = stops.findIndex(
      (stop: any) => stop.location.descriptor.code === endStationCode,
    );

    // Check if both stations exist in the stops list
    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Start or End station not found in the route`);
    }

    // Ensure start and end indices are different
    if (startIndex === endIndex) {
      throw new Error(`Start and End stations must be different`);
    }

    // Slice and reverse if necessary
    let selectedStops: any[];
    if (startIndex > endIndex) {
      selectedStops = stops.slice(endIndex, startIndex + 1).reverse();
    } else {
      selectedStops = stops.slice(startIndex, endIndex + 1);
    }

    // Adjust types, parent IDs, and assign sequential IDs
    selectedStops.forEach((stop, index) => {
      stop.id = (index + 1).toString(); // Assign sequential ID starting from 1

      if (index === 0) {
        stop.type = "START";
        delete stop.parent_stop_id; // No parent for the first stop
      } else if (index === selectedStops.length - 1) {
        stop.type = "END";
        stop.parent_stop_id = selectedStops[index - 1].id;
      } else {
        stop.type = "INTERMEDIATE_STOP";
        stop.parent_stop_id = selectedStops[index - 1].id;
      }
    });

    // Construct the new route
    return {
      id: route.id,
      stops: selectedStops,
      type: route.type,
      vehicle: route.vehicle,
    };
  });
};
export async function onSearchGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  existingPayload.message.catalog.providers =
    existingPayload?.message?.catalog?.providers?.map((item: any) => {
      return {
        ...item,
        payments: item.payments.map((payment: any) => {
          return {
            ...payment,
            collected_by: sessionData?.collected_by ?? "BAP",
          };
        }),
      };
    });
  existingPayload = updatePaymentDetails(existingPayload, sessionData);
  try {
    const route = createFullfillment(
      sessionData.city_code ?? "std:011",
    ).fulfillments;
    const { start_code, end_code } = sessionData;
    if (!start_code || !end_code) {
      throw new Error("Start and End station codes are required");
    }
    const fulfillments = createCustomRoute(route, start_code, end_code);

    // Create dynamic operational times based on current date
    const currentDate = new Date();
    const operationalStartTime = new Date(currentDate);
    operationalStartTime.setUTCHours(5, 30, 0, 0); // 5:30 AM UTC

    const operationalEndTime = new Date(currentDate);
    operationalEndTime.setUTCHours(20, 30, 0, 0); // 8:30 PM UTC

    const updatedFulfillments = fulfillments.map((f) => ({
      ...f,
      type: "TRIP",
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
              value: crypto.randomUUID().slice(0, 4),
            },
            {
              descriptor: {
                code: "ROUTE_DIRECTION",
              },
              value: "UP",
            },
            {
              descriptor: {
                code: "OPERATIONAL_START_TIME",
              },
              value: operationalStartTime.toISOString(),
            },
            {
              descriptor: {
                code: "OPERATIONAL_END_TIME",
              },
              value: operationalEndTime.toISOString(),
            },
          ],
        },
      ],
    }));
    existingPayload.message.catalog.providers[0].fulfillments =
      updatedFulfillments;
    existingPayload.message.catalog.providers[0].items =
      existingPayload.message.catalog.providers[0].items?.map((item: any) => {
        if (item.time) {
          const twoDaysFromNow = new Date();
          twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

          return {
            ...item,
            time: {
              duration: "P2D",
              label: "Validity",
              timestamp: twoDaysFromNow.toISOString(),
            },
          };
        }
        return item;
      });
    existingPayload.message.catalog.providers[0].fulfillments = [
      ...existingPayload.message.catalog.providers[0].fulfillments?.map(
        (fulfillment: any) => {
          return {
            ...fulfillment,
            stops: fulfillment.stops.map((stop: any) => {
              if (stop.type === "START" || stop.type === "END") {
                const { instructions, ...rest } = stop;
                return rest;
              } else return stop;
            }),
          };
        },
      ),
    ];
    return existingPayload;
  } catch (err) {
    console.error(err);
    delete existingPayload.message;
    const errorMessage = {
      code: `91201`,
      message: "To & from location not serviceable by Mock Seller application",
    };
    existingPayload.error = errorMessage;
    return existingPayload;
  }
}
