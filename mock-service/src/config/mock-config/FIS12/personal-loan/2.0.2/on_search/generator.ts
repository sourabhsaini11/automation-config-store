import { randomUUID } from 'crypto';

export async function onSearchDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("existingPayload on search", existingPayload);

  // Set payment_collected_by if present in session data
  if (sessionData.collected_by && existingPayload.message?.catalog?.providers?.[0]?.payments?.[0]) {
    existingPayload.message.catalog.providers[0].payments[0].collected_by = sessionData.collected_by;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  console.log("sessionData.message_id", sessionData);

  // Generate dynamic IDs with personal_loan_ prefix for provider, items, and categories
  if (existingPayload.message?.catalog?.providers?.[0]) {
    const provider = existingPayload.message.catalog.providers[0];

    // Generate ONE form id for personal_loan_information_form and apply to all items.
    // This ensures the form id returned by on_search is the same one used in select_1 and on_select_1,
    // regardless of which item gets selected.
    const personalLoanInformationFormId =
      (typeof sessionData?.form_id === "string" && sessionData.form_id.trim()
        ? sessionData.form_id
        : `form_${randomUUID()}`);

    // Generate provider ID if it's a placeholder
    if (!provider.id || provider.id === "PROVIDER_ID" || provider.id.startsWith("PROVIDER_ID")) {
      provider.id = `personal_loan_provider_${randomUUID()}`;
      console.log("Generated provider.id:", provider.id);
    }

    // Generate unique category IDs
    if (provider.categories && Array.isArray(provider.categories)) {
      // Build a map of old category ID -> new category ID for cross-referencing parent_category_id
      const categoryIdMap: Record<string, string> = {};

      provider.categories = provider.categories.map((category: any) => {
        const oldId = category.id;
        const code = category.descriptor?.code || 'UNKNOWN';
        const newId = `cat_${code.toLowerCase()}_${randomUUID()}`;
        categoryIdMap[oldId] = newId;
        category.id = newId;
        console.log(`Generated category.id: ${oldId} -> ${newId} (${code})`);
        return category;
      });

      // Update parent_category_id references
      provider.categories.forEach((category: any) => {
        if (category.parent_category_id && categoryIdMap[category.parent_category_id]) {
          const oldParent = category.parent_category_id;
          category.parent_category_id = categoryIdMap[oldParent];
          console.log(`Updated parent_category_id: ${oldParent} -> ${category.parent_category_id}`);
        }
      });

      // Update category_ids in items to match new category IDs
      if (provider.items && Array.isArray(provider.items)) {
        provider.items.forEach((item: any) => {
          if (item.category_ids && Array.isArray(item.category_ids)) {
            item.category_ids = item.category_ids.map((catId: string) => {
              if (categoryIdMap[catId]) {
                console.log(`Updated item category_id: ${catId} -> ${categoryIdMap[catId]}`);
                return categoryIdMap[catId];
              }
              return catId;
            });
          }
        });
      }
    }

    // Generate item IDs if they are placeholders
    // Different prefixes based on category: AA_PERSONAL_LOAN (101125) vs BUREAU_LOAN (101124)
    if (provider.items && Array.isArray(provider.items)) {
      provider.items = provider.items.map((item: any) => {

        if (!item.id || item.id.startsWith("ITEM_ID_")) {
          // Determine prefix based on original category codes (check descriptor codes in categories)
          const categoryIds = item.category_ids || [];
          let prefix = "personal_loan_"; // default prefix

          // We need to check category descriptors to determine the type
          // Since category IDs are now UUIDs, look for known patterns in the IDs
          const categories = provider.categories || [];
          const itemCategoryCodes = categoryIds
            .map((catId: string) => categories.find((c: any) => c.id === catId))
            .filter(Boolean)
            .map((c: any) => c.descriptor?.code);

          if (itemCategoryCodes.includes("AA_PERSONAL_LOAN")) {
            prefix = "aa_personal_loan_";
            console.log("Item has AA_PERSONAL_LOAN category - using aa_personal_loan_ prefix");
          } else if (itemCategoryCodes.includes("BUREAU_LOAN")) {
            prefix = "bureau_personal_loan_";
            console.log("Item has BUREAU_LOAN category - using bureau_personal_loan_ prefix");
          }

          item.id = `${prefix}${randomUUID()}`;
          console.log("Generated item.id:", item.id);
        }

        // Update form ID and generate dynamic form URL for items with xinput
        if (item.xinput?.form) {
          item.xinput.form.id = personalLoanInformationFormId;
          console.log("Using personal_loan_information_form form.id:", item.xinput.form.id);

          // Generate dynamic form URL with session data
          const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/personal_loan_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
          console.log("Form URL generated:", url);
          item.xinput.form.url = url;
        }

        return item;
      });
    }
  }

  //existingPayload.message.catalog.providers[0].items[0].xinput.form.url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/multiple_bureau_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;

  return existingPayload;
}