export async function onSelectUnlimitedPassGenerator(
  existingPayload: any,
  sessionData: any,
) {
  existingPayload.context.location.city.code =
    sessionData?.select_city_code ?? "std:080";
  const creds = sessionData?.selected_unlimitedpass_fulfillments
    ?.flat()
    ?.find((item: any) => {
      return item.type === "PASS";
    });
  const selectedItemId = sessionData?.selected_item_ids?.[0];
  const selectedFulfillmentId = sessionData?.selected_fulfillment_ids;

  const items = (sessionData?.items ?? []).flat();
  const fulfillments = (sessionData?.fulfillments ?? []).flat();

  existingPayload.message.order.items = selectedItemId
    ? items.reduce((acc: any[], item: any) => {
        if (item?.id === selectedItemId) {
          acc.push({
            ...item,
            quantity:
              sessionData?.selected_unlimitedpass_item?.flat?.()?.[0]
                ?.quantity ?? "0",
            price: {
              currency: item?.price?.currency,
              value: item?.price?.value,
            },
            time: {
              ...item?.time,
              range:
                sessionData?.on_search_unlimited_pass_provider?.flat?.()?.[0]
                  ?.time?.range ?? {},
            },
          });
        }
        return acc;
      }, [])
    : [];

  existingPayload.message.order.fulfillments = selectedFulfillmentId
    ? fulfillments
        .filter((f: any) => f?.id === selectedFulfillmentId)
        .map((fulfillment: any) => {
          if (fulfillment?.type === "PASS" && fulfillment?.customer) {
            return {
              ...fulfillment,
              customer: creds?.customer ?? {},
            };
          }
          return fulfillment;
        })
    : [];

  existingPayload.message.order.provider = {
    id: sessionData?.provider_id ?? "Provider1",
    descriptor: sessionData?.provider_descriptor ?? {},
    time: sessionData?.on_search_unlimited_pass_provider?.flat()[0]?.time ?? {},
  };

  const selectedQty = sessionData?.selected_unlimitedpass_item.flat()[0];

  const baseFareBreakup = (existingPayload?.message?.order?.items || []).map(
    (item: any) => {
      const itemPrice = Number(item?.price?.value) || 200;

      return {
        title: "BASE_FARE",
        item: {
          id: item?.id ?? "I1",
          price: {
            currency: "INR",
            value: String(itemPrice),
          },
          quantity: selectedQty?.quantity ?? {},
        },
        price: {
          currency: "INR",
          value: String(
            itemPrice * Number(selectedQty?.quantity?.selected?.count),
          ),
        },
      };
    },
  );
  const getBreakupPrice = (breakupItem: any): number =>
    Number(breakupItem?.price?.value ?? breakupItem?.item?.price?.value ?? 0);

  const baseFareTotal = baseFareBreakup.reduce(
    (sum: number, item: any) => sum + getBreakupPrice(item),
    0,
  );

  const CGST_PERCENT = 2;
  const SGST_PERCENT = 2;

  const cgstAmount = (baseFareTotal * CGST_PERCENT) / 100;
  const sgstAmount = (baseFareTotal * SGST_PERCENT) / 100;
  const totalTax = cgstAmount + sgstAmount;

  const convenienceFee = 10;
  const otherCharges = 0;
  const offerDiscount = 0;

  const breakUp = [
    ...baseFareBreakup,
    {
      title: "TAX",
      price: {
        currency: "INR",
        value: totalTax.toFixed(2),
      },
      item: {
        tags: [
          {
            descriptor: { code: "TAX" },
            list: [
              {
                descriptor: { code: "CGST" },
                value: `${CGST_PERCENT}%`,
              },
              {
                descriptor: { code: "SGST" },
                value: `${SGST_PERCENT}%`,
              },
            ],
          },
        ],
      },
    },
    {
      title: "OTHER_CHARGES",
      price: {
        currency: "INR",
        value: String(otherCharges),
      },
      item: {
        tags: [
          {
            descriptor: {
              code: "OTHER_CHARGES",
            },
            list: [
              {
                descriptor: {
                  code: "SURCHARGE",
                },
                value: "0",
              },
            ],
          },
        ],
      },
    },
  ];

  const totalQuoteValue = breakUp.reduce(
    (sum: number, item: any) => sum + getBreakupPrice(item),
    0,
  );

  existingPayload.message.order.quote = {
    price: {
      value: totalQuoteValue.toFixed(2),
      currency: "INR",
    },
    breakup: breakUp,
  };

  return existingPayload;
}
