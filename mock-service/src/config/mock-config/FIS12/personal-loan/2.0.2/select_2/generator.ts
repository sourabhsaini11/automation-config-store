
export async function select2Generator(existingPayload: any, sessionData: any) {
  if (existingPayload.context) existingPayload.context.timestamp = new Date().toISOString();
  console.log("sessionData-->", sessionData.session_id)
  // const data = await RedisService.getKey(sessionData.session_id)
  // console.log("data--> " + data)

  console.log("existingPayload-->", existingPayload)
  const submission_id = sessionData?.form_data?.personal_loan_information_form?.form_submission_id;

  // Map provider.id and item.id from on_search saved session if available
  const selectedProvider = sessionData.selected_provider;

  // Check if incoming payload has a specific item ID (from select request)
  const incomingItemId = existingPayload.message?.order?.items?.[0]?.id;
  console.log("incomingItemId-->", incomingItemId)

  // Prioritize selecting item with AA prefix (aa_personal_loan_)
  let selectedItem = sessionData.item;

  console.log("selectedItem-->", sessionData.items)

  // If we have multiple items, look for the AA item first
  if (Array.isArray(sessionData.items) && sessionData.items.length > 0) {
    // If incoming payload has an item ID, check if it's an AA item
    if (incomingItemId && incomingItemId.startsWith("aa_personal_loan_")) {
      // Find the matching AA item from session data
      selectedItem = sessionData.items.find((item: any) => item?.id === incomingItemId) ||
        sessionData.items.find((item: any) => item?.id?.startsWith("aa_personal_loan_"));
      console.log("✅ Incoming request has AA item ID, using:", selectedItem?.id || incomingItemId);
    } else {
      // First, try to find item with aa_personal_loan_ prefix (prioritize AA items)
      const aaItem = sessionData.items.find((item: any) =>
        item?.id && item.id.startsWith("aa_personal_loan_")
      );

      if (aaItem) {
        selectedItem = aaItem;
        console.log("✅ Selected AA item (aa_personal_loan_):", aaItem.id);
      } else {
        // If incoming payload has a specific item ID, use that
        if (incomingItemId) {
          selectedItem = sessionData.items.find((item: any) => item?.id === incomingItemId) ||
            sessionData.items[0];
          console.log("⚠️ Using item from incoming request:", selectedItem?.id || incomingItemId);
        } else {
          // Fallback to first item if no AA item found
          selectedItem = selectedItem || sessionData.items[0];
          console.log("⚠️ No AA item found, using:", selectedItem?.id || "first available item");
        }
      }
    }
  } else if (!selectedItem) {
    // Fallback if items array is not available
    selectedItem = undefined;
  }

  if (selectedProvider?.id) {
    existingPayload.message = existingPayload.message || {};
    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.provider = existingPayload.message.order.provider || {};
    existingPayload.message.order.provider.id = selectedProvider.id;
  }

  if (selectedItem?.id) {
    const item0 = existingPayload.message?.order?.items?.[0];
    if (item0) item0.id = selectedItem.id;
  }

  // Ensure xinput.form.id matches the one from on_search (avoid hardcoding F01)
  const formId = selectedItem?.xinput?.form?.id || sessionData?.form_id;
  if (formId && existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    existingPayload.message.order.items[0].xinput.form.id = formId;
  }

  if (existingPayload.message?.order?.items?.[0]?.xinput?.form_response) {
    if (submission_id) {
      // Use the actual UUID submission_id from form service (not a static placeholder)
      existingPayload.message.order.items[0].xinput.form_response.submission_id = submission_id;
      console.log("Updated form_response with submission_id from form service:", submission_id);
    } else {
      console.warn("⚠️ No submission_id found for personal_loan_information_form - form may not have been submitted yet");
    }
  }
  console.log("selectedItem-->", JSON.stringify(selectedItem))
  console.log("existingPayload-->", JSON.stringify(existingPayload))

  return existingPayload;
}

