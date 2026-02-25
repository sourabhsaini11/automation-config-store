export async function onSearch_4_Generator(
  existingPayload: any,
  sessionData: any
) {
  existingPayload.message.catalog = sessionData?.on_search_2_catalog ?? {};
  const catalog_tags = existingPayload?.message?.catalog?.tags?.map(
    (tag: any) => {
      if (tag.descriptor?.code === "PAGINATION") {
        return {
          ...tag,
          list: tag.list.map((item: any) =>
            item.descriptor?.code === "CURRENT_PAGE_NUMBER"
              ? { ...item, value: "3" }
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
