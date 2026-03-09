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

      const price: any = sessionData.price;
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
const getRandomItemsWithQuantities = (items: any): any => {
  const shuffledItems = items.sort(() => Math.random() - 0.5);
  const randomItemCount = Math.floor(Math.random() * items.length) + 1;
  const selectedItems = shuffledItems.slice(0, randomItemCount);
  return selectedItems.map((item: any) => {
    const min = item.quantity.minimum.count;
    const max = item.quantity.maximum.count;

    return {
      id: item.id,
      quantity: {
        selected: {
          count: Math.floor(Math.random() * (max - min + 1)) + min, // Random number between min and max (inclusive)
        },
      },
    };
  });
};

const transformToItemFormat = (items: any[]): any => {
  try {
    return items.map((item) => ({
      id: item.id,
      quantity: {
        maximum: {
          count: item.quantity.maximum.count,
        },
        minimum: {
          count: item.quantity.minimum.count,
        },
      },
    }));
  } catch (e: any) {
    console.error(e.message);
  }
};
export async function initGenerator(
  existingPayload: any,
  sessionData: any
) {
  const items = sessionData?.items.length > 0 ? sessionData?.items : staticItemsArray;
  const items_min_max = transformToItemFormat(items);
  if (items_min_max?.length > 0) {
    const chosen_items = getRandomItemsWithQuantities(items_min_max);
    sessionData.selected_ids = Array.isArray(sessionData.selected_ids)
      ? sessionData.selected_ids
      : [sessionData.selected_ids || "I1"];
    const items_chosen = chosen_items;

    if (items_chosen) {
      existingPayload.message.order.items = items_chosen;
    }
  }
  if (sessionData.billing && Object.keys(sessionData.billing).length > 0) {
    existingPayload.message.order.billing = sessionData.billing;
  }


  if (sessionData.provider_id) {
    existingPayload.message.order.provider.id = sessionData.provider_id;
  }
  existingPayload = updateSettlementAmount(existingPayload, sessionData);
  existingPayload = updateCollectedByAndBuyerFees(existingPayload, sessionData);
  return existingPayload;
}

const staticItemsArray = [
  {
    id: "I1",
    category_ids: ["C1"],
    descriptor: {
      name: "Single Journey Ticket",
      code: "SJT"
    },
    price: {
      currency: "INR",
      value: "60"
    },
    quantity: {
      maximum: { count: 6 },
      minimum: { count: 1 }
    },
    fulfillment_ids: ["F1"],
    time: {
      label: "Validity",
      duration: "P2D",
      timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: "I2",
    category_ids: ["C1"],
    descriptor: {
      name: "Round Journey Ticket",
      code: "RJT"
    },
    price: {
      currency: "INR",
      value: "110"
    },
    quantity: {
      maximum: { count: 6 },
      minimum: { count: 1 }
    },
    fulfillment_ids: ["F1"],
    time: {
      label: "Validity",
      duration: "P2D",
      timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
    }
  }
];