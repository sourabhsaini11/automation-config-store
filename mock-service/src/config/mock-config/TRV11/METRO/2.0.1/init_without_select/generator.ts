import { SessionData } from "../../../session-types";
function updateCollectedByAndBuyerFees(payload: any, sessionData: SessionData) {
  const payments = payload?.message?.order?.payments || [];

  payments.forEach((payment: any) => {
    // Update collected_by
    payment.collected_by = sessionData.collected_by;

    // Find the BUYER_FINDER_FEES tag
    const buyerFinderTag = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "BUYER_FINDER_FEES"
    );

    if (buyerFinderTag?.list) {
      // Find or create the BUYER_FINDER_FEES_PERCENTAGE entry
      const percentageEntry = buyerFinderTag.list.find(
        (item: any) => item.descriptor?.code === "BUYER_FINDER_FEES_PERCENTAGE"
      );

      if (percentageEntry) {
        percentageEntry.value = sessionData.buyer_app_fee;
      } else {
        buyerFinderTag.list.push({
          descriptor: { code: "BUYER_FINDER_FEES_PERCENTAGE" },
          value: sessionData.buyer_app_fee,
        });
      }
    }
  });

  return payload;
}
function updateSettlementAmount(payload: any, sessionData: SessionData) {
  const payments = payload?.message?.order?.payments || [];

  payments.forEach((payment: any) => {
    const collectedBy = sessionData.collected_by;
    const settlementTerms = payment.tags?.find(
      (tag: any) => tag.descriptor?.code === "SETTLEMENT_TERMS"
    );

    if (settlementTerms && settlementTerms.list) {
      const settlementAmountEntry = settlementTerms.list.find(
        (entry: any) => entry.descriptor?.code === "SETTLEMENT_AMOUNT"
      );


      const price: any = totalPrice(payload.message.order.items, sessionData?.items)?.price.value
      const feePercentage: any = sessionData.buyer_app_fee;
      const feeAmount = (price * feePercentage) / 100;

      const finalAmount = collectedBy === "BAP" ? price - feeAmount : feeAmount;

      if (settlementAmountEntry) {
        settlementAmountEntry.value = finalAmount.toString();
      } else {
        // Add it if not already present
        settlementTerms.list.push({
          descriptor: { code: "SETTLEMENT_AMOUNT" },
          value: finalAmount.toString(),
        });
      }
    }
  });

  return payload;
}
const totalPrice = (items: any, onsearchItem: any): any => {
  let total = 0;
  let currency = "INR";

  items.forEach((sel: any) => {
    const item = onsearchItem.find((i: any) => i.id === sel.id);
    if (item) {
      const itemTotal =
        Number(item.price.value) * sel.quantity.selected.count;

      total += itemTotal;
      currency = item.price.currency;
    }
  });

  return {
    price: {
      value: total.toFixed(2),
      currency: currency
    },

  };
};
export async function initGenerator(
  existingPayload: any,
  sessionData: any
) {
  const userInput = sessionData.user_inputs


  if (userInput.items) {
    existingPayload.message.order.items = userInput.items;
  }

  if (userInput.billing) {
    existingPayload.message.order.billing = userInput?.billing;
  }

  if (sessionData.provider_id) {
    existingPayload.message.order.provider.id = sessionData.provider_id;
  }
  existingPayload = updateSettlementAmount(existingPayload, sessionData);
  existingPayload = updateCollectedByAndBuyerFees(existingPayload, sessionData);
  return existingPayload;
}
