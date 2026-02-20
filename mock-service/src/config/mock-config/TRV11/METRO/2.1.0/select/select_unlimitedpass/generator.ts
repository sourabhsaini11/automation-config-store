export async function selectUnlimitedPassGenerator(
  existingPayload: any,
  sessionData: any,
) {
  const metroPurchaseItem = sessionData?.items?.flat().find((item: any) => {
    return item.descriptor.code === "PASS";
  });
  const metroPurchaseFulfillment = sessionData?.fulfillments
    ?.flat()
    .find((fulfillment: any) => {
      return fulfillment.type === "PASS";
    });

  existingPayload.message.order.provider.id =
    sessionData?.provider_id ?? "PROVIDER01";
  existingPayload.message.order.items = [
    {
      id: metroPurchaseItem?.id ?? "PurchaseItemIdI3",
      quantity: {
        selected: {
          count: 1,
        },
      },
    },
  ];
  existingPayload.message.order.fulfillments = [
    {
      id: metroPurchaseFulfillment?.id ?? "PurchaseFulfillmentIdF3",
      type: metroPurchaseFulfillment?.type ?? "unlimitedPass",
      customer: {
        person: {
          creds: [
            {
              type: "AADHAAR",
              id: "1234 5678 9193",
            },
          ],
        },
      },
    },
  ];

  return existingPayload;
}
