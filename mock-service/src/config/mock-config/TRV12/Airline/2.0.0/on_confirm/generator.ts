export async function onConfirmDefaultGenerator(
  existingPayload: any,
  sessionData: any
) {

  existingPayload.message.order.id = sessionData?.confirm_order_id ?? "O1";
  existingPayload.message.order.status = "ACTIVE";
  existingPayload.message.order.provider = sessionData?.on_init_provider ?? {};
  existingPayload.message.order.items = sessionData?.on_init_items ?? [];
  // existingPayload.message.order.fulfillments =
  //   sessionData?.on_init_fulfillments ?? [];
  const fulfillment = sessionData?.on_init_fulfillments?.map((i: any) => {
    if (i.type === "TRIP") {
      return {
        ...i,
        stops:
          i?.stops?.map((stop: any) => {
            if (stop?.type === "START") {
              return {
                ...stop,
                authorization: {
                  type: "QR",
                  token:
                    "iVBORw0KGgoAAAANSUhEUgAAAH0AAAB9AQAAAACn+1GIAAAApklEQVR4Xu2UMQ4EMQgD/QP+/0vK6zjsvayUMmavWxQpMAUBkwS12wcveAAkgNSCD3rR5Lkgoai3GUCMgWqbAEYR3HxAkZlzU/0MyBisYRsgI1ERFfcpBpA+ze6k56Cj7KTdXNigFWZvSOpsgqLfd18i2aAukXh9TXBNmdWt5gzA/oqzWkkN8HtA7G8CNOwYAiZt3wZixUfkA32OHNQq7Bxs9oI/gC/9fV8AVCkPjQAAAABJRU5ErkJggg==",
                },
              };
            }
            return stop;
          }) ?? [],
      };
    } else return i;
  });

  existingPayload.message.order.fulfillments = fulfillment;

  existingPayload.message.order.quote = sessionData?.on_init_quote ?? {};

  const payments = sessionData?.on_init_payments?.map((payment: any) => {
    return {
      ...payment,
      status: sessionData?.confirm_payments[0].status || "PAID",
      params: {
        transaction_id:
          sessionData?.confirm_payments[0]?.params?.transaction_id ?? "",
        currency: "INR",
        amount: sessionData?.confirm_payments[0]?.params?.amount ?? "0",
      },
    };
  });
  existingPayload.message.order.payments = payments ?? [];
  existingPayload.message.order.documents = [
    {
      descriptor: {
        code: "AIRLINE-DOC",
        name: "PNR Document",
        short_desc: "Download your ticket here",
        long_desc: "Download your ticket here",
      },
      mime_type: "application/pdf",
      url: "https://abcoperator.com/manage-booking/pnr/O1.pdf",
    },
  ];
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
  existingPayload.message.order.billing = sessionData?.confirm_billing ?? {};
  existingPayload.message.order.created_at =
    existingPayload?.context?.timestamp ?? new Date().toISOString();
  existingPayload.message.order.updated_at =
    existingPayload?.context?.timestamp ?? new Date().toISOString();

  return existingPayload;
}
