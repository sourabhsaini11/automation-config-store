import { SessionData } from "../../../../session-types";

export async function searchGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  delete existingPayload.context.bpp_uri;
  delete existingPayload.context.bpp_id;
  existingPayload.context.location.city.code = sessionData.city_code;
  existingPayload.message.intent.fulfillment = sessionData.fulfillment;
  existingPayload.message.intent.fulfillment.vehicle = {
    category: "BUS",
  };
  existingPayload.message.intent.fulfillment.stops.forEach((stop: any) => {
    let time = {
      label: "DATE_OF_JOURNEY",
      timestamp: getCurrentTime(),
    };
    if (stop.type === "START") {
      stop.time = time;
    }
  });
  existingPayload.message.intent.fulfillment.stops.push({
    type: "END",
    location: {
      descriptor: {
        code: sessionData.end_code,
      },
    },
  });
  return existingPayload;
}

function getCurrentTime(): string {
  return new Date().toISOString();
}
