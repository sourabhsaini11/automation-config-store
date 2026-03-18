import { v4 as uuidv4 } from "uuid";
export async function onSearchGenerator(existingPayload: any, sessionData: any) {
    existingPayload.context.location.city.code = sessionData?.city_code
    existingPayload.message.catalog.providers.forEach((provider: any) => {
        provider.tags = [sessionData.tags]
        provider.id = sessionData.provider_id
        provider.items = provider.items?.map((item: any) => ({
            ...item,
            id: uuidv4(),
        })) || [];
    })
    return existingPayload;
} 