import { SessionData } from "../../../../session-types";
import {
  createFullfillment,
  exampleFullfillment,
} from "../fullfillment-generator";

function toLocalISOStringWithZ(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
}

// Function to create dynamic route based on start and end location codes
function createDynamicRoute(startCode: string, endCode: string): any[] {
  const allStops = exampleFullfillment.fulfillments[0].stops;
  const filteredStops: any[] = [];
  let startIndex = -1;
  let endIndex = -1;

  // Find start and end indices by matching the code
  for (let i = 0; i < allStops.length; i++) {
    const stopCode = allStops[i]?.location?.descriptor?.code;
    if (stopCode === startCode) {
      startIndex = i;
    }
    if (stopCode === endCode) {
      endIndex = i;
    }
  }

  // If start or end not found, or start >= end, return ALL stops from fulfillment-generator
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    // Return all stops as-is from the fulfillment-generator
    return allStops.map((stop: any) => JSON.parse(JSON.stringify(stop)));
  }

  // Filter stops between start and end (inclusive)
  // Only change type for first (START) and last (END) stops
  // All intermediate stops keep their original type (INTERMEDIATE_STOP, TRANSIT_STOP, etc.)
  for (let i = startIndex; i <= endIndex; i++) {
    const stop = JSON.parse(JSON.stringify(allStops[i])); // Deep clone

    if (i === startIndex) {
      // First stop becomes START type
      stop.type = "START";
      delete stop.parent_stop_id;
      delete stop.instructions;
    } else if (i === endIndex) {
      // Last stop becomes END type
      stop.type = "END";
    }
    // All stops in between (i > startIndex && i < endIndex) keep their original type

    // Update parent_stop_id for proper chaining within the filtered range
    if (i > startIndex) {
      stop.parent_stop_id =
        filteredStops[filteredStops.length - 1]?.id || String(i);
    }

    filteredStops.push(stop);
  }

  return filteredStops;
}

// provider.time & item.time update function
function updateTimestamps(payload: any) {
  const now = new Date();
  const istNow = new Date(now.getTime());
  const y = istNow.getFullYear();
  const m = istNow.getMonth();
  const d = istNow.getDate();
  const startIST = new Date(Date.UTC(y, m, d, 5 - 5, 30, 0));
  const endIST = new Date(Date.UTC(y, m, d, 23 - 5, 30, 0));
  const providers = payload?.message?.catalog?.providers || [];
  providers.forEach((provider: any) => {
    provider.time.range.start = startIST.toISOString();
    provider.time.range.end = endIST.toISOString();

    provider?.items.forEach((item: any) => {
      const newTimestamp = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000,
      ).toISOString();
      item.time.timestamp = newTimestamp;
    });
  });

  return payload;
}

export async function onSearch2Generator(
  existingPayload: any,
  sessionData: any,
) {
  try {
    // Get current date
    const today = new Date();

    // Create start time at 5:30 AM of current date (local time)
    const startTime = new Date(today);
    startTime.setHours(5, 30, 0, 0);

    // Create end time at 11:30 PM of current date (local time)
    const endTime = new Date(today);
    endTime.setHours(23, 30, 0, 0);

    // Get start and end location codes from sessionData.search2_fulfillment.stops
    const search2Stops = sessionData?.search2_fulfillment?.stops || [];

    const startStop = search2Stops.find((stop: any) => stop.type === "START");
    const endStop = search2Stops.find((stop: any) => stop.type === "END");

    const startLocationCode = startStop?.location?.descriptor?.code;
    const endLocationCode = endStop?.location?.descriptor?.code;

    // Create dynamic stops based on start and end codes
    let dynamicStops: any[] = [];
    if (startLocationCode && endLocationCode) {
      dynamicStops = createDynamicRoute(startLocationCode, endLocationCode);
    }

    // Update fulfillments with dynamic stops
    // Note: fulfillments are inside providers[], not at catalog.fulfillments level
    if (dynamicStops.length > 0) {
      // Update fulfillments inside each provider
      existingPayload.message.catalog.providers =
        existingPayload.message.catalog.providers?.map((provider: any) => {
          const updatedFulfillments = provider.fulfillments?.map(
            (fulfillment: any) => {
              if (fulfillment.type === "TRIP") {
                return {
                  ...fulfillment,
                  stops: dynamicStops,
                };
              }
              return fulfillment;
            },
          );

          return {
            ...provider,
            fulfillments: updatedFulfillments,
          };
        });
    }

    existingPayload.message.catalog.providers =
      existingPayload.message.catalog.providers.map((provider: any) => {
        // Get fulfillments from the payload
        const fulfillments =
          existingPayload.message.catalog.fulfillments ||
          provider.fulfillments ||
          [];

        // Process items and update timestamp based on duration
        const updatedItems =
          provider.items?.map((item: any) => {
            // Calculate item price based on fulfillment stops.length * 10
            const itemFulfillmentId = item.fulfillment_ids?.[0];
            const matchingFulfillment = fulfillments.find(
              (f: any) => f.id === itemFulfillmentId && f.type === "TRIP",
            );

            let updatedItem = { ...item };
            if (matchingFulfillment && matchingFulfillment.stops) {
              const stopsCount = matchingFulfillment.stops.length;
              const itemCode = item.descriptor?.code;
              // SJT = stops.length * 10, RJT = stops.length * 20
              const multiplier = itemCode === "RJT" ? 20 : 10;
              const calculatedPrice = stopsCount * multiplier;
              updatedItem.price = {
                ...item.price,
                value: String(calculatedPrice),
              };
            }

            if (item.time && item.time.duration) {
              // Parse duration (e.g., PT2D = 2 days)
              const durationMatch = item.time.duration.match(/P(\d+)D/);
              if (durationMatch) {
                const days = parseInt(durationMatch[1], 10);
                const futureDate = new Date(today);
                futureDate.setDate(futureDate.getDate() + days);
                return {
                  ...updatedItem,
                  time: {
                    ...item.time,
                    timestamp: toLocalISOStringWithZ(futureDate),
                  },
                };
              }
            }
            return updatedItem;
          }) || provider.items;

        return {
          ...provider,
          items: updatedItems,
          payments: [{ collected_by: sessionData?.collected_by ?? "BPP" }],
          time: {
            range: {
              start: toLocalISOStringWithZ(startTime),
              end: toLocalISOStringWithZ(endTime),
            },
          },
        };
      });
    return existingPayload;
  } catch (err) {
    console.error(err);
  }
}
