import { SessionData } from "../../../../session-types";


export async function onSearch_3_Generator(
  existingPayload: any,
  sessionData: SessionData
) {

  existingPayload.message.catalog = sessionData?.on_search_2_catalog ?? {};
  const catalog_tags = existingPayload?.message?.catalog?.tags?.map(
    (tag: any) => {
      if (tag.descriptor?.code === "PAGINATION") {
        return {
          ...tag,
          list: tag.list.map((item: any) =>
            item.descriptor?.code === "CURRENT_PAGE_NUMBER"
              ? { ...item, value: "2" }
              : item
          ),
        };
      }
      return tag;
    }
  );

  existingPayload.message.catalog.tags = catalog_tags;

  return existingPayload;
}
