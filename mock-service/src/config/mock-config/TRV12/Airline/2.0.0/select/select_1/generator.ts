function createItemPayload(userInputItem: any, addOnsToInclude: any[] = []): any {
  const itemPayload: any = {
    quantity: {
      selected: {
        count: userInputItem.count || 1,
      },
    },
  };

  itemPayload.parent_item_id = userInputItem.itemId;

  if (addOnsToInclude.length > 0) {
    console.log('Distributing add-ons for item:', userInputItem.itemId, addOnsToInclude);


    itemPayload.add_ons = addOnsToInclude.map((addOn: any) => ({
      id: addOn.id,
      quantity: {
        selected: { count: addOn.count },
      },
    }));
  }

  return itemPayload;
}


export async function select_1_DefaultGenerator(
  existingPayload: any,
  sessionData: any
) {

  const userInputs = typeof sessionData.user_inputs?.data === "string"
    ? JSON.parse(sessionData.user_inputs.data)
    : sessionData.user_inputs;


  const mergedItemsMap = new Map<string, any>();

  (userInputs.items || []).forEach((item: any) => {
    const { count: countRaw, addOns: addOnsRaw, ...attributes } = item;
    const itemCount = Number(countRaw) || 1;

    const addOns = (addOnsRaw || [])
      .map((ao: any) => ({
        id: ao.id,
        count: Number(ao.count) || 0
      }))
      .filter((ao: any) => ao.count > 0);

    const normalizedAddOns = addOns
      .map((ao: any) => ({
        id: ao.id,
        ratio: ao.count / itemCount
      }))
      .sort((a: any, b: any) => a.id.localeCompare(b.id));

    const addonKey = normalizedAddOns.map((ao: any) => `${ao.id}:${ao.ratio}`).join('|');
    const attributesKey = JSON.stringify(attributes);
    const groupKey = `${attributesKey}_${addonKey}`;

    if (mergedItemsMap.has(groupKey)) {
      const existing = mergedItemsMap.get(groupKey);
      existing.count += itemCount;
      existing.addOns.forEach((existingAo: any) => {
        const matchingInputAo = addOns.find((ia: any) => ia.id === existingAo.id);
        if (matchingInputAo) {
          existingAo.count += matchingInputAo.count;
        }
      });
    } else {
      mergedItemsMap.set(groupKey, {
        ...attributes,
        count: itemCount,
        addOns: addOns.map((ao: any) => ({ ...ao }))
      });
    }
  });

  const itemPayloads = Array.from(mergedItemsMap.values()).map((item: any) => {
    return createItemPayload(item, item.addOns);
  });


  existingPayload.message.order.items = itemPayloads;

  existingPayload.message.order.fulfillments = [
    {
      id: userInputs.fulfillment || 'F1',
      stops: [
        {
          id: "S1",
        },
        {
          id: "S2",
        },
      ],
    },
  ];

  return existingPayload;
}
