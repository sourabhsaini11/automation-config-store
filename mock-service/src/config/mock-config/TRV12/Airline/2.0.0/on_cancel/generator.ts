export async function onCancelDefaultGenerator(
  existingPayload: any,
  sessionData: any
) {
 
  existingPayload.message.order.id = sessionData?.confirm_order_id ?? "O1";
  existingPayload.message.order.status = "CANCELLED";
  existingPayload.message.order.cancellation = {
    cancelled_by: "CONSUMER",
    reason: {
      descriptor: {
        code: "001",
      },
    },
    time: existingPayload?.context?.timestamp ?? "2023-10-03T02:00:08.143Z",
  };
  existingPayload.message.order.provider =
    sessionData?.on_confirm_provider ?? {};
  existingPayload.message.order.items = sessionData?.on_confirm_items ?? [];
  existingPayload.message.order.fulfillments =
    sessionData?.on_init_fulfillments ?? [];

  const quote = sessionData?.on_confirm_quote ?? {};

  const refundBreakups =
    quote?.breakup?.map((i: any) => {
      const refundObj: any = {
        ...i,
        title: "REFUND",
        price: {
          ...i.price,
          value: `-${Number(i.price?.value || 0)}`,
        },
      };

      if (i.item?.price?.value) {
        refundObj.item = {
          ...i.item,
          price: {
            ...i.item.price,
            value: `-${Number(i.item.price.value)}`,
          },
        };
      }

      return refundObj;
    }) ?? [];

  const breakup = [
    ...(quote?.breakup ?? []),
    ...refundBreakups,
    {
      title: "CANCELLATION_CHARGES",
      price: {
        currency: "INR",
        value: "1000",
      },
    },
  ];

  const totalPrice = breakup.reduce(
    (sum, i) => sum + Number(i.price?.value || 0),
    0
  );

  const finalOnCancelQuote = {
    id: quote?.id ?? "Q1",
    price: {
      value: String(totalPrice),
      currency: "INR",
    },
    breakup,
  };

  existingPayload.message.order.quote = finalOnCancelQuote;

  const payments = (sessionData?.on_confirm_payments ?? []).map(
    (payment: any) => ({
      ...payment,
      params: {
        ...payment.params,
        bank_code: "XXXXXXXX",
        bank_account_number: "xxxxxxxxxxxxxx",
        virtual_payment_address: "9988199772@okicic",
      },
    })
  );

  existingPayload.message.order.payments = payments ?? [];

  existingPayload.message.order.cancellation_terms =
    sessionData?.on_confirm_cancellation_terms ?? [];
  existingPayload.message.order.billing = sessionData?.on_confirm_billing ?? {};
  existingPayload.message.order.created_at =
    sessionData?.on_confirm_created_at ?? new Date().toISOString();
  existingPayload.message.order.updated_at =
    existingPayload?.context?.timestamp ?? new Date().toISOString();

  return existingPayload;
}
