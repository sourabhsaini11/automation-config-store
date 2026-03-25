/**
 * On Select3 Generator for FIS12 Personal Loan
 */
import { randomUUID } from "crypto";

export async function onSelect2Generator(existingPayload: any, sessionData: any) {
  console.log("On Select2 generator - Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    selected_provider: !!sessionData.selected_provider,
    items: !!sessionData.items
  });

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }

  // Update provider.id if available from session data (carry-forward from select_2)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from select_2)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }

  // Update form URL + unique form ID for Ekyc_details_form
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    const uniqueFormId = `ekyc_details_${randomUUID()}`;
    existingPayload.message.order.items[0].xinput.form.id = uniqueFormId;
    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/Ekyc_details_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    console.log("[on_select_3] form_id:", uniqueFormId, "URL:", url);
    existingPayload.message.order.items[0].xinput.form.url = url;
  }

  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }
  console.log("session data on_select_3-->", sessionData)

  return existingPayload;
}

