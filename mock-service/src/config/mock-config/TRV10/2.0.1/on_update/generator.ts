import { SessionData } from "../../session-types";

type Price = {
  value: string;
  currency: string;
};

type Item = {
  id: string;
  price: Price;
  quantity?: {
    selected: {
      count: number;
    };
  };
};

type Breakup = {
  title: string;
  item?: Item;
  price: Price;
};

type Quote = {
  price: Price;
  breakup: Breakup[];
  ttl?: string;
};

const generateRandomToken = (length = 6): string =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();

const getValidToIso = (hours = 2): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

function applyCancellationCharges(quote: Quote, state: string): Quote {
  // Get cancellation fee based on ride state
  const getCancellationFee = (state: string): number => {
    switch (state) {
      case "RIDE_ASSIGNED":
        return 0;
      case "RIDE_ENROUTE_PICKUP":
        return 30;
      case "RIDE_ARRIVED_PICKUP":
        return 50;
      case "RIDE_STARTED":
        return parseFloat(quote.price.value); // 100% of ride value
      default:
        return 0;
    }
  };

  const cancellationFee = getCancellationFee(state);
  const currentTotal = parseFloat(quote.price.value);

  // Create refund breakup for the base fare
  const refundBreakups: Breakup[] = quote.breakup.map((breakup) => ({
    title: "REFUND",
    price: {
      currency: breakup.price.currency,
      value: `-${breakup.price.value}`,
    },
  }));

  // Add cancellation charge breakup
  const cancellationBreakup: Breakup = {
    title: "CANCELLATION_CHARGES",
    price: {
      currency: "INR",
      value: cancellationFee.toFixed(2),
    },
  };

  // Calculate final amount (original - refund + cancellation charges)
  const finalAmount = cancellationFee;

  return {
    price: {
      value: finalAmount.toFixed(2),
      currency: "INR",
    },
    breakup: [...quote.breakup, ...refundBreakups, cancellationBreakup],
    ttl: "PT30S",
  };
}

export async function onUpdateGenerator(
  existingPayload: any,
  sessionData: SessionData,
) {
  existingPayload.message.order.id = sessionData?.order_id
  // Update payments if present
  if (sessionData.payments?.length > 0) {
    existingPayload.message.order.payments = sessionData.payments;
  }

  // Update items if present
  if (sessionData.items?.length > 0) {
    existingPayload.message.order.items = sessionData.items;
  }

  // Update fulfillments if present
  if (sessionData.fulfillments?.length > 0) {
    existingPayload.message.order.fulfillments = sessionData.fulfillments;
  }

  // Ensure all fulfillments have the required 'type' property
  if (existingPayload.message.order.fulfillments?.length > 0) {
    existingPayload.message.order.fulfillments.forEach((fulfillment: any) => {
      fulfillment.vehicle = {
        ...fulfillment.vehicle,
        make: "Bajaj",
        model: "Compact RE",
      };
      fulfillment.stops = fulfillment.stops.map((stop: any) =>
        stop.type === "START"
          ? {
              ...stop,
              authorization: {
                token: generateRandomToken(6),
                type: "OTP",
                valid_to: getValidToIso(2),
                status: "UNCLAIMED",
              },
            }
          : stop,
      );
      fulfillment.tags = [
        {
          descriptor: {
            code: "ROUTE_INFO",
            name: "Route Information",
          },
          display: true,
          list: [
            {
              descriptor: {
                code: "ENCODED_POLYLINE",
                name: "Path",
              },
              value: "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
            },
            {
              descriptor: {
                code: "WAYPOINTS",
                name: "Waypoints",
              },
              value:
                '[{"gps":"12.909982, 77.611822"},{"gps":"12.909982,77.611822"},{"gps":"12.909982,77.611822"},{"gps":"12.909982, 77.611822"}]',
            },
          ],
        },
      ];
      // Set default type to "DELIVERY" if not present
      if (!fulfillment.type) {
        fulfillment.type = "DELIVERY";
      }
      // Ensure type is one of the allowed values
      else if (!["DELIVERY", "SELF_PICKUP"].includes(fulfillment.type)) {
        fulfillment.type = "DELIVERY";
      }

      // Ensure vehicle registration is present
      if (!fulfillment.vehicle) {
        fulfillment.vehicle = {
          registration: "DL01AB1234",
        };
      } else if (!fulfillment.vehicle.registration) {
        fulfillment.vehicle.registration = "DL01AB1234";
      }

      // Ensure agent.person.name is present
      if (!fulfillment.agent) {
        fulfillment.agent = {
          person: {
            name: "Driver Name",
          },
          contact: {
            phone: "9876543210",
          },
        };
      } else {
        if (!fulfillment.agent.person) {
          fulfillment.agent.person = {
            name: "Driver Name",
          };
        } else if (!fulfillment.agent.person.name) {
          fulfillment.agent.person.name = "Driver Name";
        }

        // Ensure agent.contact.phone is present
        if (!fulfillment.agent.contact) {
          fulfillment.agent.contact = {
            phone: "9876543210",
          };
        } else if (!fulfillment.agent.contact.phone) {
          fulfillment.agent.contact.phone = "9876543210";
        }
      }

      // Valid ride states
      const validRideStates = [
        "RIDE_CANCELLED",
        "RIDE_ENDED",
        "RIDE_STARTED",
        "RIDE_ASSIGNED",
        "RIDE_ENROUTE_PICKUP",
        "RIDE_ARRIVED_PICKUP",
        "RIDE_CONFIRMED",
      ];

      // Ensure state.descriptor.code is present and valid
      if (!fulfillment.state) {
        fulfillment.state = {
          descriptor: {
            code: "RIDE_ASSIGNED",
          },
        };
      } else if (!fulfillment.state.descriptor) {
        fulfillment.state.descriptor = {
          code: "RIDE_ASSIGNED",
        };
      } else if (
        !fulfillment.state.descriptor.code ||
        !validRideStates.includes(fulfillment.state.descriptor.code)
      ) {
        fulfillment.state.descriptor.code = "RIDE_ASSIGNED";
      }
    });
  }

  // Update order status if present
  if ("order_status" in sessionData) {
    existingPayload.message.order.status = sessionData.order_status;
  }

  // Handle cancellation and quote updates
  if ("cancellation" in sessionData) {
    const fulfillmentState =
      existingPayload.message.order.fulfillments[0]?.state?.descriptor?.code;
    if (fulfillmentState && existingPayload.message.order.quote) {
      existingPayload.message.order.quote = applyCancellationCharges(
        existingPayload.message.order.quote,
        fulfillmentState,
      );
    }
  }

  // Update timestamps
  existingPayload.message.order.updated_at = new Date().toISOString();
  return existingPayload;
}
