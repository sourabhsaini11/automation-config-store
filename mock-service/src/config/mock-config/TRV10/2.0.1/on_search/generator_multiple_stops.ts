import { SessionData } from "../../session-types";

function generateNearbyLocations(startGps: any, endGps: any) {
  const [startLat, startLon] = startGps.split(",").map(Number);
  const [endLat, endLon] = endGps.split(",").map(Number);

  const getRandomOffset = () => (Math.random() - 0.5) * 0.01; // Small offset (~1km)

  return [
    {
      gps: `${(startLat + getRandomOffset()).toFixed(6)},${(startLon + getRandomOffset()).toFixed(6)}`,
      id: "L1",
    },
    {
      gps: `${(startLat + getRandomOffset()).toFixed(6)},${(startLon + getRandomOffset()).toFixed(6)}`,
      id: "L2",
    },
    {
      gps: `${(startLat + getRandomOffset()).toFixed(6)},${(startLon + getRandomOffset()).toFixed(6)}`,
      id: "L3",
    },
    {
      gps: `${(startLat + getRandomOffset()).toFixed(6)},${(startLon + getRandomOffset()).toFixed(6)}`,
      id: "L4",
    },
  ];
}

export async function onSearchMultipleStopsGenerator(
  existingPayload: any,
  sessionData: SessionData,
  isFemaleRide?: boolean,
) {
  existingPayload.context.bap_id = sessionData?.bap_id
  existingPayload.context.bap_uri = sessionData?.bap_uri
  if (isFemaleRide) {
    existingPayload.message.catalog.providers[0].fulfillments.push({
      id: "F3",
      agent: {
        person: {
          gender: "FEMALE",
        },
      },
      stops: [
        {
          location: {
            gps: "13.008935, 77.644408",
          },
          type: "START",
          instructions: {
            short_desc: "short description of the location",
            long_desc: "long description of the location",
          },
        },
        {
          location: {
            gps: "12.971186, 77.586812",
          },
          type: "END",
        },
      ],
      type: "DELIVERY",
      vehicle: {
        category: "CAB",
        variant: "SEDAN",
      },
    });
    existingPayload.message.catalog.providers[0].items.push({
      descriptor: {
        code: "RIDE",
        name: "CAB Economy Ride Female Driver",
      },
      fulfillment_ids: ["F3"],
      id: "I3",
      location_ids: ["L2", "L4"],
      price: {
        currency: "INR",
        maximum_value: "236",
        minimum_value: "206",
        value: "206",
      },
    });
  }
  for (let fulfillment of existingPayload.message.catalog.providers[0]
    .fulfillments) {
    fulfillment.stops = sessionData.stops.map((stop) => {
      const newStop: any = {
        ...stop,
        ...(stop.type === "START" && {
          instructions: {
            short_desc: "short description of the location",
            long_desc: "long description of the location",
          },
        }),
      };

      // Remove parent_stop_id if it exists
      delete newStop.parent_stop_id;

      return newStop;
    });
  }
  for (let payment of existingPayload.message.catalog.providers[0].payments) {
    payment.collected_by = sessionData.collected_by;
  }
  // console.log("The start and end codes are",sessionData.start_location,sessionData.end_code)
  if (existingPayload.message.catalog.providers[0].locations) {
    const locations = generateNearbyLocations(
      sessionData.start_location,
      sessionData.end_location,
    );
    existingPayload.message.catalog.providers[0].locations = locations;
  }

  if (
    sessionData?.flow_id === "OnDemand_Assign_driver_post_onconfirmSelfPickup"
  ) {
    existingPayload.message.catalog.providers[0].fulfillments =
      existingPayload.message.catalog.providers[0].fulfillments.map(
        (fulfillment: any) => {
          return {
            ...fulfillment,
            type: "SELF_PICKUP",
          };
        },
      );
  }

  return existingPayload;
}
