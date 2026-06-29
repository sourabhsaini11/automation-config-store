export async function onCancelSoftUserCancellationGenerator(
  existingPayload: any,
  sessionData: any
) {
  if (sessionData.order) {
    existingPayload.message = {
      order: sessionData.order,
    };
  }

  // Set correct order status for soft cancellation
  if (existingPayload.message.order) {
    existingPayload.message.order.status = "SOFT_CANCEL";
  }

  // Calculate refunds for each item in the order
  if (existingPayload.message.order?.items) {
    const items = existingPayload.message.order.items;
    const quote = existingPayload.message.order.quote;
    const baseFareBreakup: any[] = [];
    const addOnsBreakup: any[] = [];
    const refundBreakup: any[] = [];
    let totalRefundAmount = 0;

    // Process each item
    items.forEach((item: any) => {
      // Skip parent items (items without price)
      if (!item.price?.value) {
        return;
      }

      const basePrice = parseFloat(item.price.value);
      const quantity = item.quantity?.selected?.count || 1;
      let itemTotalAmount = basePrice * quantity;
      let itemAddOnsAmount = 0;

      // Add BASE_FARE entry
      baseFareBreakup.push({
        title: "BASE_FARE",
        item: {
          id: item.id,
          price: {
            currency: "INR",
            value: basePrice.toString(),
          },
          quantity: {
            selected: {
              count: quantity,
            },
          },
        },
        price: {
          currency: "INR",
          value: String((Number(basePrice) || 0) * (Number(quantity) || 0)),
        },
      });

      // Handle add-ons if present
      if (item.add_ons && item.add_ons.length > 0) {
        item.add_ons.forEach((addon: any) => {
          const addonPrice = parseFloat(addon.price?.value || "0");
          const addonQuantity = addon.quantity?.selected?.count || 1;
          const addonTotal = addonPrice * addonQuantity;
          itemAddOnsAmount += addonTotal;

          // Add ADD_ONS entry
          addOnsBreakup.push({
            title: "ADD_ONS",
            item: {
              id: item.id,
              add_ons: [
                {
                  id: addon.id,
                },
              ],
            },
            price: {
              currency: "INR",
              value: addonTotal.toString(),
            },
          });
        });
        itemTotalAmount += itemAddOnsAmount;
      }

      // For standalone add-on items
      if (item.descriptor?.code === "ADD_ON") {
        addOnsBreakup.push({
          title: "ADD_ONS",
          item: {
            id: item.id,
          },
          price: {
            currency: "INR",
            value: basePrice.toString(),
          },
        });
      }

      // Add refund entry
      const refundEntry: any = {
        title: "REFUND",
        item: {
          id: item.id,
          price: {
            currency: "INR",
            value: (-basePrice).toString(),
          },
          quantity: {
            selected: {
              count: quantity,
            },
          },
        },
        price: {
          currency: "INR",
          value: (-itemTotalAmount).toString(),
        },
      };

      // Add add-ons to refund entry if present
      if (item.add_ons && item.add_ons.length > 0) {
        refundEntry.item.add_ons = item.add_ons.map((addon: any) => ({
          id: addon.id,
          price: {
            currency: "INR",
            value: (-(
              Number(addon?.price?.value || 0) *
              Number(addon?.quantity?.selected?.count || 1)
            )).toString(),
          },
        }));
      }

      refundBreakup.push(refundEntry);
      totalRefundAmount += itemTotalAmount;
    });

    // Combine all breakup items in correct order
    const breakup = [
      ...baseFareBreakup,
      {
        title: "TAX",
        price: {
          currency: "INR",
          value: "0",
        },
      },
      ...addOnsBreakup,
      ...refundBreakup,
      {
        title: "CANCELLATION_CHARGES",
        price: {
          currency: "INR",
          value: Math.ceil(totalRefundAmount * 0.1).toString(),
        },
      },
    ];

    // Update quote breakup and price
    quote.breakup = breakup;
    quote.price = {
      currency: "INR",
      value: Math.ceil(totalRefundAmount * 0.1).toString(),
    };
  }

  // Ensure created_at, updated_at and cancellation are set for soft cancellation (on_cancel1) to pass validation
  if (existingPayload.message.order) {
    const createdAt = sessionData.created_at || sessionData.order?.created_at || existingPayload.context.timestamp;
    existingPayload.message.order.created_at = createdAt;
    existingPayload.message.order.updated_at = existingPayload.context.timestamp;

    if (sessionData.cancellation_reason_id) {
      existingPayload.message.order.cancellation = {
        cancelled_by: "CONSUMER",
        reason: {
          descriptor: {
            code: sessionData.cancellation_reason_id,
          },
        },
      };
    }
  }

  return existingPayload;
}
