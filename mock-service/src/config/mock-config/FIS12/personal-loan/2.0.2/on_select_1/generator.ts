import logger from "@ondc/automation-logger";
import axios from "axios";
import { RedisService } from "ondc-automation-cache-lib";

export async function onSelect1Generator(existingPayload: any, sessionData: any) {
  console.log("=== On Select1 Generator Start ===");
  logger.info("session data for on_select_1+++++++", sessionData)

  // ========== STANDARD PAYLOAD UPDATES ==========

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data (carry-forward mapping)
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
    console.log("Updated transaction_id:", sessionData.transaction_id);
  }

  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
    console.log("Updated message_id:", sessionData.message_id);
  }

  // Update provider.id if available from session data (carry-forward from select_1)
  if (sessionData.selected_provider?.id && existingPayload.message?.order?.provider) {
    existingPayload.message.order.provider.id = sessionData.selected_provider.id;
    console.log("Updated provider.id:", sessionData.selected_provider.id);
  }

  // Update item.id if available from session data (carry-forward from select_1)
  const selectedItem = sessionData.item ||
    (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
  if (selectedItem?.id && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].id = selectedItem.id;
    sessionData.selected_items_xinput.form_response.status = "PENDING";
    existingPayload.message.order.items[0].xinput = sessionData.selected_items_xinput;
    console.log("Updated item.id:", selectedItem.id);
  }

  // Determine item type based on ID prefix — used to guard Finvu AA integration below
  const currentItemId = existingPayload.message?.order?.items?.[0]?.id || "";
  const isAAItem = currentItemId.startsWith("aa_personal_loan_");
  const isBureauItem = currentItemId.startsWith("bureau_personal_loan_");
  console.log("Item type detection - isAAItem:", isAAItem, "isBureauItem:", isBureauItem, "itemId:", currentItemId);

  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }

  // ========== FINVU AA CONSENT INTEGRATION ==========

  console.log("--- Finvu AA Integration Start ---");

  // Only call Finvu AA service for AA items (items with aa_personal_loan_ prefix)
  if (!isAAItem) {
    console.log("⚠️ Skipping Finvu AA integration - Item is not an AA loan (Bureau loan or other type)");
    console.log("Item ID:", currentItemId, "does not start with 'aa_personal_loan_'");
  }

  const dedicatedKey = `form_data_${sessionData.transaction_id}`;
  const dedicatedRaw = await RedisService.getKey(dedicatedKey);
  const dedicatedFormData = dedicatedRaw ? JSON.parse(dedicatedRaw) : null;
  logger.info("dedicatedFormData from form_data_ key+++++++++", dedicatedFormData);

  const contactNumber =
    dedicatedFormData?.personal_loan_information_form?.contactNumber

  logger.info("contactNumber from dedicatedFormData", dedicatedFormData?.personal_loan_information_form?.contactNumber);
  logger.info("contactNumber (final)+++++++++", contactNumber);

  // console.log("sessionData.form_data?.personal_loan_information_form?.contactNumber", sessionData.form_data?.personal_loan_information_form?.contactNumber)
  if (contactNumber) {
    const custId = `${contactNumber}@finvu`;
    logger.info("custId after form sumbmission: ", custId)

    try {
      // Call Finvu AA Service to generate consent handler
      const finvuServiceUrl = process.env.FINVU_AA_SERVICE_URL || 'http://localhost:3002';
      const consentUrl = `${finvuServiceUrl}/finvu-aa/consent/generate`;

      console.log("Calling Finvu AA Service:", consentUrl);
      logger.info(
        "Calling Finvu AA Service",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        { url: consentUrl }
      );

      const consentRequest = {
        custId: custId,
        templateName: "FINVUDEMO_TESTING",
        consentDescription: "Personal Loan Account Aggregator Consent",
        redirectUrl: "https://google.co.in"
      };

      console.log("Consent request payload:", consentRequest);
      logger.info("ConsentRequest body ", consentRequest);
      const response = await axios.post(consentUrl, consentRequest, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      logger.info("finvu response ", response);

      const consentHandler = response.data.consentHandler;
      logger.info(
        "Finvu consent handler generated",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        { consent_handler: consentHandler }
      );

      // Store consent handler in session data for later use (verify step)
      sessionData.consent_handler = consentHandler;
      logger.info(
        "Stored consent_handler in session data",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        { consent_handler: sessionData?.consent_handler }
      );
      console.log("✅ Consent handler generated:", consentHandler);

      // Inject consent handler into payload tags
      if (existingPayload.message?.order?.items?.[0]) {
        const item = existingPayload.message.order.items[0];
        item.xinput = sessionData.selected_items_xinput
        // Initialize tags array if it doesn't exist
        if (!item.tags) {
          item.tags = [];
        }

        // Find existing CONSENT_INFO tag or create new one
        let consentInfoTag = item.tags.find((tag: any) =>
          tag.descriptor?.code === 'CONSENT_INFO'
        );

        if (!consentInfoTag) {
          // Create new CONSENT_INFO tag structure
          consentInfoTag = {
            descriptor: {
              code: 'CONSENT_INFO',
              name: 'Consent Information'
            },
            list: [],
            display: false
          };
          item.tags.push(consentInfoTag);
        }

        // Update or add CONSENT_HANDLER in the list
        const consentHandlerItem = {
          descriptor: {
            code: 'CONSENT_HANDLER',
            name: 'Consent Handler'
          },
          value: consentHandler  // use the variable, not the string literal
        };

        // Find and update existing CONSENT_HANDLER or add new one
        const existingHandlerIndex = consentInfoTag.list?.findIndex((listItem: any) =>
          listItem.descriptor?.code === 'CONSENT_HANDLER'
        );

        if (existingHandlerIndex !== undefined && existingHandlerIndex >= 0) {
          consentInfoTag.list[existingHandlerIndex].value = consentHandler;
          logger.info(
            "✅ Updated existing CONSENT_HANDLER in payload",
            {
              flow_id: sessionData?.flow_id,
              session_id: sessionData?.session_id,
              domain: sessionData?.domain,
              transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
            },
            { index: existingHandlerIndex, consent_handler: consentHandler }
          );
        } else {
          if (!consentInfoTag.list) {
            consentInfoTag.list = [];
          }
          consentInfoTag.list.push(consentHandlerItem);
          logger.info(
            "✅ Added new CONSENT_HANDLER to payload",
            {
              flow_id: sessionData?.flow_id,
              session_id: sessionData?.session_id,
              domain: sessionData?.domain,
              transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
            },
            { consent_handler: consentHandler }
          );
        }

        console.log("✅ Finvu AA integration successful - consent handler injected into payload");
      } else {
        logger.info(
          "⚠️ Cannot inject consent handler - items[0] not found in payload",
          {
            flow_id: sessionData?.flow_id,
            session_id: sessionData?.session_id,
            domain: sessionData?.domain,
            transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
          },
          {}
        );
      }

    } catch (error: any) {
      logger.error(
        "❌ Finvu AA consent generation failed",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          code: error?.code,
        }
      );

      // Fail-safe: Continue without consent handler (or you can throw error to stop flow)
      logger.info(
        "⚠️ Continuing without consent handler due to error",
        {
          flow_id: sessionData?.flow_id,
          session_id: sessionData?.session_id,
          domain: sessionData?.domain,
          transaction_id: existingPayload?.context?.transaction_id || sessionData?.transaction_id,
        },
        {}
      );
    }
  } else {
    console.warn("⚠️ No contact number found in session data - skipping Finvu AA integration");
    console.log("Available form data:", sessionData.form_data);
  }

  return existingPayload;
}

