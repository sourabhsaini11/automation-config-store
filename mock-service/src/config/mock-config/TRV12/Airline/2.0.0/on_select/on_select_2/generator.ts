export async function onSelect_2_DefaultGenerator(
  existingPayload: any,
  sessionData: any
) {
  
  existingPayload.message.order.provider = sessionData?.on_select_1_provider;

  const items = sessionData?.select_2_items.map((i: any) => {
    return (sessionData?.on_select_1_items || []).find(
      (f: any) => f.id === i.id
    );
  });

  const data = sessionData?.on_select_1_items?.filter(
    (item: any) => !item.parent_item_id
  );

  const isParentItem =
    sessionData?.select_2_items?.some((i: any) => i.id === i.parent_item_id) ||
    false;

  if (isParentItem) {
    existingPayload.message.order.items = [...data];
  } else {
    existingPayload.message.order.items = [...data, ...items];
  }
  // existingPayload.message.order.items = [...data, ...items];

  const fulfillment = (sessionData?.select_2_fulfillments || []).map(
    (i: any) => {
      return (sessionData?.on_select_1_fulfillments || []).find(
        (f: any) => f.id === i.id
      );
    }
  );

  function getUnselected(onSelect: any[], selected: any[]) {
    const selectedIds = new Set(selected.map((o) => o.id));
    return onSelect.filter((o) => !selectedIds.has(o.id));
  }
  const result = getUnselected(
    sessionData?.on_select_1_fulfillments,
    sessionData?.select_2_fulfillments
  );

  console.log(result);

  const fulfillments = fulfillment.map((item: any) => {
    if (item.type === "TICKET") {
      return {
        ...item,
        tags: item.tags.map((tag: any) => {
          if (tag.descriptor?.code === "SEAT_GRID") {
            const seatNumber = tag.list.find(
              (l: any) => l.descriptor?.code === "SEAT_NUMBER"
            )?.value;

            return {
              ...tag,
              list: tag.list.map((l: any) => {
                if (l.descriptor?.code === "AVAILABLE") {
                  return {
                    ...l,
                    descriptor: { code: "SELECTED_SEAT" },
                    value: seatNumber || "UNKNOWN",
                  };
                }
                return l;
              }),
            };
          }
          return tag;
        }),
      };
    } else {
      return {
        ...item,
        tags: (item.tags || []).filter(
          (t: any) => t.descriptor?.code === "INFO"
        ),
      };
    }
  });

  // const fulfillments = sessionData?.on_select_1_fulfillments?.map(
  //   (item: any) => {
  //     if (item?.id?.includes("-")) {
  //       return item;
  //     } else {
  //       return {
  //         ...item,
  //         tags: item.tags.filter((i: any) => i.descriptor.code === "INFO"),
  //       };
  //     }
  //   }
  // );

  const restFulfillment = result.map((i) => {
    const { id, type } = i;
    return {
      id,
      type,
    };
  });

  if (isParentItem) {
    const fulfillment =
      sessionData?.select_2_fulfillments?.map((i: any) => {
        return (sessionData?.on_select_1_fulfillments || []).find(
          (f: any) => f.id === i.id
        );
      }) || [];
    const fulfillments = fulfillment.map((item: any) => {
      if (item.type === "TRIP") {
        const tags =
          item.tags?.filter((t: any) => t.descriptor?.code === "INFO") || [];
        return { ...item, tags };
      } else {
        const { id, type } = item;
        return { id, type };
      }
    });

    existingPayload.message.order.fulfillments = fulfillments;
  } else {
    existingPayload.message.order.fulfillments = [
      ...fulfillments,
      ...restFulfillment,
    ];
  }

  const baseItem = existingPayload.message.order.items.filter(
    (i: any) => !i.parent_item_id
  );

  const addOnsItem = existingPayload.message.order.items.filter(
    (i: any) => i.add_ons
  );

  const tax = existingPayload.message.order.items
    ?.filter((i: any) => !i.parent_item_id)
    .map((i: any) => {
      const itemPrice = Number(i?.price?.value) || 0;
      const quantity = i?.quantity?.selected?.count || 1;

      return {
        title: "TAX",
        item: {
          id: i?.id ?? "",
          tags: [
            {
              descriptor: { code: "TAX" },
              list: [
                { descriptor: { name: "cgst" }, value: "5" },
                { descriptor: { name: "sgst" }, value: "5" },
                { descriptor: { name: "fuel tax" }, value: "0" },
                { descriptor: { name: "cess" }, value: "0" },
              ],
            },
          ],
        },
        price: {
          currency: "INR",
          value: String(itemPrice * 0.1 * quantity),
        },
      };
    });


  existingPayload.message.order.quote = {
    id: "Q1",
    price: {
      value: "42159",
      currency: "INR",
    },
  };
  const BaseQuote = baseItem.map((item: any) => {
    return {
      title: "BASE_FARE",
      item: {
        id: item?.id ?? "",
        quantity: {
          selected: {
            count: item.quantity.selected.count ?? 0,
          },
        },
        price: {
          currency: "INR",
          value: item?.price?.value ?? 0,
        },
      },
      price: {
        currency: "INR",
        value: String(
          Number(item?.price?.value ?? 0) * Number(item.quantity.selected.count)
        ),
      },
    };
  });
  const addOnsQuote = addOnsItem.map((item: any) => {
    return {
      title: "ADD_ONS",
      item: {
        id: item?.id ?? "",
        add_ons: [
          {
            id: item?.add_ons[0]?.id ?? "",
          },
        ],
      },
      price: {
        value: item?.add_ons[0]?.price?.value ?? 0,
        currency: "INR",
      },
    };
  });

  const isSame = sessionData?.select_2_items?.some((i: any) => {
    return i.id === i.parent_item_id;
  });

  let seatFare = [] as any[];
  if (!isSame) {
     seatFare = sessionData?.select_2_items.map((i: any) => {
      return {
        title: "SEAT_FARE",
        item: {
          id: i?.id ?? "",
        },
        price: {
          currency: "INR",
          value: "200",
        },
      };
    });
  }
  
  existingPayload.message.order.quote.breakup = [
    ...BaseQuote,
    ...addOnsQuote,
    ...tax,
    {
      title: "CONVENIENCE_FEE",
      price: {
        currency: "INR",
        value: "19",
      },
    },
    ...seatFare,
    {
      title: "OTHER_CHARGES",
      item: {
        tags: [
          {
            descriptor: {
              code: "OTHER_CHARGES",
            },
            list: [
              {
                descriptor: {
                  name: "fuel charge",
                },
                value: "0",
              },
              {
                descriptor: {
                  code: "surcharge",
                },
                value: "0",
              },
            ],
          },
        ],
      },
      price: {
        currency: "INR",
        value: "0",
      },
    },
  ];

  const totalPrice = existingPayload.message.order.quote.breakup.reduce(
    (acc: number, i: any) => acc + Number(i?.price?.value),
    0
  );

  existingPayload.message.order.quote.price.value = String(totalPrice);

  return existingPayload;
}
