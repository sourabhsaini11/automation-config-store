import { SessionData } from "../../../../session-types";
import { createFullfillment } from "../fullfillment-generator";

// Helper function to format date as local ISO string with Z suffix
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

export async function onSearch1Generator(
  existingPayload: any,
  sessionData: any,
) {
  delete existingPayload.context.location.city.code
  // Get current date
  const today = new Date();

  // Create start time at 5:30 AM of current date (local time)
  const startTime = new Date(today);
  startTime.setHours(5, 30, 0, 0);

  // Create end time at 11:30 PM of current date (local time)
  const endTime = new Date(today);
  endTime.setHours(23, 30, 0, 0);

  existingPayload.message.catalog.providers =
    existingPayload.message.catalog.providers.map((provider: any) => {
      // Process items and update timestamp based on duration
      const updatedItems =
        provider.items?.map((item: any) => {
          if (item.time && item.time.duration) {
            // Parse duration (e.g., PT2D = 2 days)
            const durationMatch = item.time.duration.match(/P(\d+)D/);
            if (durationMatch) {
              const days = parseInt(durationMatch[1], 10);
              const futureDate = new Date(today);
              futureDate.setDate(futureDate.getDate() + days);
              return {
                ...item,
                time: {
                  ...item.time,
                  timestamp: toLocalISOStringWithZ(futureDate),
                },
              };
            }
          }
          return item;
        }) || provider.items;

      return {
        ...provider,
        items: updatedItems,
        payments: [{ collected_by: sessionData?.collected_by ?? "BPP" }],
        locations: [
          {
            id: "L1",
            city: {
              code: sessionData?.city_code ?? "std:011",
            },
          },
        ],
        time: {
          range: {
            start: toLocalISOStringWithZ(startTime),
            end: toLocalISOStringWithZ(endTime),
          },
        },
      };
    });
  return existingPayload;
}
