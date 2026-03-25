import logger from "@ondc/automation-logger";
import { randomUUID } from "crypto";

export async function onSelect2Generator(existingPayload: any, sessionData: any) {

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

  // Ensure provider is an object (not an array)
  if (Array.isArray(existingPayload.message?.order?.provider)) {
    // Convert array to object (take first element)
    existingPayload.message.order.provider = existingPayload.message.order.provider[0] || {};
    logger.info(
      "[on_select_2] Converted provider array to object",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { provider_array_length: existingPayload.message.order.provider.length }
    );
  }

  // Update provider.id if available from session data (carry-forward from select_2)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    logger.info(
      "[on_select_2] Updated provider.id from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { provider_id: sessionData.selected_provider.id }
    );
  }

  // Update item.id if available from session data (carry-forward from select_2)
  const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    logger.info(
      "[on_select_2] Updated item.id from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { item_id: selectedItem.id }
    );
  }

  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    logger.info(
      "[on_select_2] Updated location_ids from session data",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { location_id: selectedLocationId }
    );
  }


  // Generate unique quote.id for this session
  // Update quote.id from session data
  if (existingPayload.message?.order?.quote) {
    if (sessionData.quote_id) {
      existingPayload.message.order.quote.id = sessionData.quote_id;
    } else if (sessionData.order?.quote?.id) {
      existingPayload.message.order.quote.id = sessionData.order.quote.id;
    }
  }
  // ========== FORM URL + UNIQUE FORM ID ==========
  if (existingPayload.message?.order?.items?.[0]?.xinput?.form) {
    // Generate a unique form ID per session so downstream form submission tracking is accurate
    const uniqueFormId = `loan_amount_adjustment_${randomUUID()}`;
    existingPayload.message.order.items[0].xinput.form.id = uniqueFormId;

    const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/loan_amount_adjustment_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
    existingPayload.message.order.items[0].xinput.form.url = url;
    logger.info(
      "[on_select_2] Form URL and unique form ID set",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { form_id: uniqueFormId, form_url: url }
    );
  } else {
    logger.error(
      "[on_select_2] FAILED: Payload structure doesn't match expected path for form URL!",
      {
        flow_id: sessionData?.flow_id,
        session_id: sessionData?.session_id,
        domain: sessionData?.domain,
        transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
      },
      { actual_order_structure: JSON.stringify(existingPayload.message?.order, null, 2) }
    );
  }

  logger.debug(
    "[on_select_2] Final session data state",
    {
      flow_id: sessionData?.flow_id,
      session_id: sessionData?.session_id,
      domain: sessionData?.domain,
      transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
    },
    { session_data: sessionData }
  );

  return existingPayload;
}
