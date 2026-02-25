export async function onInitDefaultGenerator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.message.order.provider =
    sessionData?.on_select_2_provider ?? {};
  existingPayload.message.order.items = sessionData?.on_select_2_items ?? [];
  const fulfillment = sessionData?.init_fulfillments ?? [];

  const on_init_fulfillments = sessionData?.on_select_2_fulfillments?.map(
    (item: any) => {
      if (item.id.includes("-")) {
        const data = fulfillment?.find((i: any) => i.id === item.id);
        return { ...item, customer: data?.customer };
      }
      return item;
    }
  );

  existingPayload.message.order.fulfillments = on_init_fulfillments ?? [];
  existingPayload.message.order.cancellation_terms = [
    {
      cancel_by: {
        duration: "PT60M",
      },
      cancellation_fee: {
        percentage: "0",
      },
    },
  ];
  existingPayload.message.order.billing = sessionData?.init_billing ?? {};

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

  // const seatFare = existingPayload.message.order.items
  //   ?.filter((i: any) => i.parent_item_id)
  //   .map((i: any) => {
  //     return {
  //       title: "SEAT_FARE",
  //       item: {
  //         id: i?.id ?? "",
  //       },
  //       price: {
  //         currency: "INR",
  //         value: "200",
  //       },
  //     };
  //   });

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

  const onInitSettlementDescriptors = [
    "SETTLEMENT_WINDOW",
    "SETTLEMENT_BASIS",
    "MANDATORY_ARBITRATION",
    "COURT_JURISDICTION",
    "STATIC_TERMS",
    "SETTLEMENT_AMOUNT",
  ];

  const payments = (sessionData?.init_payments || []).map((item: any) => {
    const settlementFromInit =
      item.tags?.find((t: any) => t?.descriptor?.code === "SETTLEMENT_TERMS")
        ?.list || [];

    const filteredFromInit = settlementFromInit.filter((l: any) =>
      onInitSettlementDescriptors.includes(l?.descriptor?.code)
    );

    const finalSettlementList = onInitSettlementDescriptors.map((code) => {
      const found = filteredFromInit.find(
        (l: any) => l?.descriptor?.code === code
      );
      if (found) return found;
      switch (code) {
        case "SETTLEMENT_WINDOW":
          return { descriptor: { code }, value: "P30D" };
        case "SETTLEMENT_BASIS":
          return { descriptor: { code }, value: "INVOICE_RECEIPT" };
        case "MANDATORY_ARBITRATION":
          return { descriptor: { code }, value: "TRUE" };
        case "COURT_JURISDICTION":
          return { descriptor: { code }, value: "New Delhi" };
        case "STATIC_TERMS":
          return {
            descriptor: { code },
            value: "https://api.example-bpp.com/booking/terms",
          };
        case "SETTLEMENT_AMOUNT":
          return { descriptor: { code }, value: "0" };
      }
    });

    return {
      id: "PA1",
      collected_by: item.collected_by,
      status: item.status,
      type: item.type,
      params: {
        amount: existingPayload?.message?.order?.quote?.price?.value ?? "0",
        currency: "INR",
        bank_code: "XXXXXXXX",
        bank_account_number: "xxxxxxxxxxxxxx",
        virtual_payment_address: "9988199772@okicic",
      },
      tags: [
        ...(item.tags?.filter(
          (t: any) => t?.descriptor?.code === "BUYER_FINDER_FEES"
        ) || []),

        {
          descriptor: { code: "SETTLEMENT_TERMS" },
          display: false,
          list: finalSettlementList,
        },
      ],
    };
  });

  existingPayload.message.order.payments = payments;

  return existingPayload;
}
