import { v4 as uuidv4 } from "uuid";
export async function onSearchGenerator(existingPayload: any, sessionData: any) {
    existingPayload.context.location.city.code = sessionData?.city_code

    existingPayload.message.catalog.providers.forEach((provider: any) => {
        provider.id = sessionData.provider_id;
        provider.tags = [sessionData.tags];
        provider.items?.forEach((item: any) => {
            if (!item.parent_item_id) {
                item.id = sessionData.select_item_ids[0];

            } else {
                item.parent_item_id = sessionData.select_item_ids[0];
            }
        });
    })

    return existingPayload;
} 