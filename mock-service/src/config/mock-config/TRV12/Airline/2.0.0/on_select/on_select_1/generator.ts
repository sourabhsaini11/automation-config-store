import { SessionData } from "../../../../session-types";
import { on_search_default } from "../../on_search/default";

export async function onSelect_1_DefaultGenerator(
  existingPayload: any,
  sessionData: SessionData
) {

  existingPayload.message.order.provider.id =
    sessionData.select_1_provider_id ?? "P1";
  existingPayload.message.order.provider.descriptor =
    on_search_default?.message.catalog.descriptor ?? {};

  let items: any = on_search_default?.message.catalog.providers[0]?.items || [];
  items = items?.map((it: any) => {
    return {
      ...it,
      tags: it.tags.filter((i: any) => i.descriptor.code !== "FARE_BREAK_UP"),
    };
  });
  let count = 1;

  // 🔹 Get total child-count per parent_item_id
  const parentCountMap = sessionData?.select_1_items?.reduce(
    (acc: Record<string, number>, item: any) => {
      const parentId = item?.parent_item_id || item?.id;
      if (!acc[parentId]) acc[parentId] = 0;
      acc[parentId]++;
      return acc;
    },
    {}
  );

  let splitCounter = 1;

  const on_select_item: any[] = [];

  Object.entries(parentCountMap || {}).forEach(([parentId, count]) => {
    const data = items.find((i: any) => i.id === parentId);
    if (!data) return;

    const { add_ons, cancellation_terms, ...rest } = data;

    const parentItem = {
      ...rest,
      quantity: {
        selected: {
          count: count,
        },
      },
    };

    on_select_item.push(parentItem);

    const childItems = sessionData?.select_1_items.filter(
      (i: any) => (i.parent_item_id || i.id) === parentId
    );

    childItems.forEach((child: any, index: number) => {
      let selectedAddOns: any[] | undefined;

      if (child?.add_ons && add_ons) {
        selectedAddOns = child.add_ons
          .map((cao: any) => {
            const addonId = typeof cao === "string" ? cao : cao.id;
            const catalogAddOn = add_ons.find((a: any) => a.id === addonId);
            if (!catalogAddOn) return null;

            const addonCount =
              (typeof cao === "object" ? cao.quantity?.selected?.count : 1) || 1;

            return {
              ...catalogAddOn,
              quantity: {
                selected: {
                  count: addonCount,
                },
              },
            };
          })
          .filter(Boolean);
      }

      const childItem: any = {
        ...rest,
        id: `${parentId}-${index + 1}`,
        parent_item_id: parentId,
        quantity: {
          selected: {
            count: 1,
          },
        },
      };

      if (selectedAddOns?.length) {
        childItem.add_ons = selectedAddOns;
      }

      on_select_item.push(childItem);
      splitCounter++;
    });
  });

  existingPayload.message.order.items = on_select_item;

  const totalTickets: any = Object.values(parentCountMap || {}).reduce(
    (a: any, b: any) => a + b,
    0
  );

  const extraFulfillments = Array.from(
    { length: totalTickets },
    (_, index) => ({
      id: `FT-${index + 1}`,
      type: "TICKET",
      tags: [
        {
          descriptor: { code: "SEAT_GRID" },
          list: [
            { descriptor: { code: "X" }, value: "0" },
            { descriptor: { code: "Y" }, value: "0" },
            { descriptor: { code: "Z" }, value: "0" },
            {
              descriptor: { code: "SEAT_NUMBER" },
              value: `A${index + 1}`,
            },
            { descriptor: { code: "AVAILABLE" }, value: "true" },
            { descriptor: { code: "SEAT_PRICE" }, value: "200" },
          ],
        },
      ],
    })
  );

  let fulfillmentIndex = 0;

  const updatedItems = existingPayload.message.order.items.map((item: any) => {
    if (item.parent_item_id) {
      const fulfillmentId = extraFulfillments[fulfillmentIndex]?.id;

      fulfillmentIndex++;

      return {
        ...item,
        fulfillment_ids: ["F1", fulfillmentId],
      };
    }

    return item;
  });

  existingPayload.message.order.items = updatedItems;



  const selectedFulfillmentIds =
    sessionData?.select_1_fulfillments?.map((f: any) => f.id) || [];

  const baseFulfillments =
    on_search_default?.message?.catalog?.providers[0]?.fulfillments.filter(
      (ful: any) => selectedFulfillmentIds.includes(ful.id)
    ) || [];

  existingPayload.message.order.fulfillments = baseFulfillments;



  existingPayload.message.order.fulfillments = [
    ...baseFulfillments?.map((ful: any) => {
      return {
        ...ful,
        tags: [
          ...ful.tags,
          {
            descriptor: {
              code: "VEHICLE_GRID",
            },
            display: false,
            list: [
              {
                descriptor: {
                  code: "X_MAX",
                },
                value: "14",
              },
              {
                descriptor: {
                  code: "Y_MAX",
                },
                value: "3",
              },
              {
                descriptor: {
                  code: "Z_MAX",
                },
                value: "1",
              },
              {
                descriptor: {
                  code: "X_LOBBY_START",
                },
                value: "0",
              },
              {
                descriptor: {
                  code: "X_LOBBY_SIZE",
                },
                value: "12",
              },
              {
                descriptor: {
                  code: "Y_LOBBY_START",
                },
                value: "1",
              },
              {
                descriptor: {
                  code: "Y_LOBBY_SIZE",
                },
                value: "1",
              },
              {
                descriptor: {
                  code: "SEAT_SELECTION",
                },
                value: "mandatory",
              },
            ],
          },
          {
            descriptor: {
              code: "VEHICLE_AVAIBALITY",
            },
            display: false,
            list: [
              {
                descriptor: {
                  code: "AVALIABLE_SEATS",
                },
                value: "20",
              },
            ],
          },
        ],
      };
    }),
    ...extraFulfillments,
  ];


  existingPayload.message.order.fulfillments = existingPayload.message.order.fulfillments;
  return existingPayload;
}
