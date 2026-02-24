import { SessionData } from "../../../../session-types";
const filterItemsBySelectedIds = (
  items: any[],
  selectedIds: string | string[]
): any[] => {
  // Convert selectedIds to an array if it's a string
  const idsToFilter = Array.isArray(selectedIds) ? selectedIds : [selectedIds];

  // Filter the items array based on the presence of ids in selectedIds
  return items.filter((item) => idsToFilter.includes(item.id));
};

const createQuoteFromItems = (items: any): any => {
  let totalPrice = 0;
  const currency = items[0]?.price?.currency || "INR";

  const breakup = items.map((item: any) => {
    const itemTotalPrice =
      Number(item.price?.value || 35) * item.quantity.selected.count;
    totalPrice += itemTotalPrice;

    return {
      title: "BASE_FARE",
      item: {
        id: item.id,
        price: {
          currency,
          value: String(item.price?.value || 35),
        },
        quantity: {
          selected: {
            count: item.quantity.selected.count,
          },
        },
      },
      price: {
        currency,
        value: itemTotalPrice.toFixed(2),
      },
    };
  });

  // Add OFFER and TOLL to breakup
  breakup.push(
    {
      title: "OFFER",
      price: {
        currency,
        value: "0",
      },
    },
    {
      title: "TOLL",
      price: {
        currency,
        value: "0",
      },
    }
  );

  return {
    price: {
      value: totalPrice.toFixed(2),
      currency,
    },
    breakup,
  };
};

export async function onSelectUnlimitedPassesGenerator(
  existingPayload: any,
  sessionData: SessionData
) {
  let items = filterItemsBySelectedIds(
    sessionData.items,
    sessionData.selected_item_ids
  );
  const ids_with_quantities = {
    items: sessionData.selected_items.reduce((acc: any, item: any) => {
      acc[item.id] = item.quantity.selected.count;
      return acc;
    }, {}),
  };
  const updatedItems = items
    .map((item: any, index: number) => ({
      ...item,
      price: {
        currency: "INR",
        value: item.price.value,
      },
      quantity: {
        selected: {
          count: ids_with_quantities["items"][item.id] ?? 0, // Default to 0 if not in the mapping
        },
      },
    }))
    .filter((item) => item.quantity.selected.count > 0);
  existingPayload.message.order.items = updatedItems
  const stationId = sessionData.start_code?.match(/\d+$/)?.[0] || "1";
  existingPayload.message.order.fulfillments = sessionData.fulfillments.map(
    (fulfillment) => ({
      ...fulfillment,
      stops: [
        {
          type: "START",
          location: {
            descriptor: {
              code: sessionData.start_code
            },
            gps: "28.666576, 77.233332",
          },
          id: stationId,
        },
      ],
      vehicle: {
        category: "BUS",
        variant: "AC",
      },
    })
  );

  const quote = createQuoteFromItems(existingPayload.message.order.items);
  existingPayload.message.order.quote = quote;

  return existingPayload;
}