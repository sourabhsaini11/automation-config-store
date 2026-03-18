import { v4 as uuidv4 } from "uuid";

export async function onSearchCDBalanceErrorGenerator(existingPayload: any, sessionData: any) {


    existingPayload.message.catalog.providers.forEach((provider: any) => {
        if (sessionData.provider_id) {
            provider.id = sessionData.provider_id;
        }
        if (sessionData.tags) {
            provider.tags = [sessionData.tags];
        }
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
