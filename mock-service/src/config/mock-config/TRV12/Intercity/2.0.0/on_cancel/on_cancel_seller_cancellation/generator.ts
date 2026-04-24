import { v4 as uuidv4 } from "uuid";

export async function onCancelGenerator(
  existingPayload: any,
  sessionData: any,
) {
  existingPayload.message.order.created_at =
    sessionData?.created_at ?? new Date().toISOString();
  existingPayload.message.order.updated_at =
    existingPayload?.context?.timestamp ?? new Date().toISOString();
  if (sessionData?.order_id)
    existingPayload.message.order.id = sessionData.order_id;

  const originalQuote = sessionData?.quote;
  if (originalQuote) {
    const newBreakup = [...(originalQuote.breakup || [])];

    newBreakup.push({
      price: {
        currency: originalQuote.price?.currency || "INR",
        value: "0",
      },
      title: "CANCELLATION_CHARGES",
    });

    originalQuote.breakup?.forEach((item: any) => {
      if (item.title === "BASE_FARE") {
        newBreakup.push({
          item: item.item,
          price: {
            currency: item.price.currency,
            value: `-${item.price.value}`,
          },
          title: "REFUND",
        });
      } else if (item.title === "SEAT_FARE") {
        newBreakup.push({
          item: item.item,
          price: {
            currency: item.price.currency,
            value: `-${item.price.value}`,
          },
          title: "REFUND",
        });
      } else if (item.title === "TAX") {
        newBreakup.push({
          price: {
            currency: item.price.currency,
            value: `-${item.price.value}`,
          },
          title: "REFUND",
        });
      } else if (item.title === "CONVENIENCE_FEE") {
        newBreakup.push({
          price: {
            currency: item.price.currency,
            value: `-${item.price.value}`,
          },
          title: "REFUND",
        });
      }
    });

    existingPayload.message.order.quote = {
      ...originalQuote,
      breakup: newBreakup,
      price: {
        ...originalQuote.price,
        value: "0",
      },
    };
  } else {
    existingPayload.message.order.quote = sessionData?.quote;
  }
  const flatPayments = sessionData.payments?.flat() ?? [];
  flatPayments.forEach((payment: any) => {
    payment.tags?.forEach((tag: any) => {
      if (tag.descriptor?.code === "SETTLEMENT_TERMS") {
        tag.list?.forEach((item: any) => {
          if (item.descriptor?.code === "SETTLEMENT_AMOUNT") {
            item.value = "0.00";
          }
        });
      }
    });
  });
  existingPayload.message.order.payments = flatPayments;
  return existingPayload;
}
