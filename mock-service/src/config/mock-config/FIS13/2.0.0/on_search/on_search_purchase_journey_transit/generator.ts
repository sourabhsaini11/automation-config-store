import { v4 as uuidv4 } from "uuid";

export async function onSearchSellerPagination1Generator(existingPayload: any, sessionData: any) {
  existingPayload.context.location.city.code = sessionData?.city_code

  existingPayload.message.catalog.providers.forEach((provider: any) => {
    provider.id = sessionData.provider_id;
    provider.tags.forEach((tag: { descriptor: { code: string; }; list: any[]; }) => {
      if (tag.descriptor.code === "MASTER_POLICY") {
        tag.list.forEach((item: { descriptor: { code: string; }; value: any; }) => {
          if (item.descriptor.code === "POLICY_ID") {
            item.value = sessionData.policy_id;
          }
        });
      }
    });
    const parentIdMap: Record<string, string> = {};
    provider.items?.forEach((item: any) => {
      if (!item.parent_item_id) {
        const newId = sessionData.parent_item_id;
        parentIdMap[item.id] = newId;
        item.id = newId;
      }
    });

    provider.items?.forEach((item: any) => {
      if (item.parent_item_id) {
        const newChildId = uuidv4();
        item.id = newChildId;
        item.parent_item_id = parentIdMap[item.parent_item_id];
      }
    });
  });

  return existingPayload;
} 