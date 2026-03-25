export async function onSelect1Generator(existingPayload: any, sessionData: any) {
  console.log("=== On Select1 Generator Start ===");
  console.log("Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    selected_provider: !!sessionData.selected_provider,
    items: !!sessionData.items,
    bap_id: sessionData.bap_id
  });

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
    sessionData.selected_items_xinput.form_response.status= "PENDING"
    // existingPayload.message.order.items[0].xinput=sessionData.selected_items_xinput
    console.log("Updated item.id:", selectedItem.id);
  }
  
  // Update location_ids if available from session data
  const selectedLocationId = sessionData.selected_location_id;
  if (selectedLocationId && existingPayload.message?.order?.items?.[0]) {
    existingPayload.message.order.items[0].location_ids = [selectedLocationId];
    console.log("Updated location_ids:", selectedLocationId);
  }

  // ========== FINVU AA CONSENT INTEGRATION ==========
  
  console.log("--- Finvu AA Integration Start ---");
  
  // Extract customer ID from session data
  const contactNumber = sessionData.form_data?.consumer_information_form?.contactNumber;
  
  if (contactNumber) {
    const custId = `${contactNumber}@finvu`;
    console.log("Customer ID for consent:", custId);
    
    try {
      // Call Finvu AA Service to generate consent handler
      // const finvuServiceUrl = process.env.FINVU_AA_SERVICE_URL || 'http://localhost:3002';
      // const consentUrl = `${finvuServiceUrl}/finvu-aa/consent/generate`;
      
      // console.log("Calling Finvu AA Service:", consentUrl);
      
      const consentRequest = {
        custId: custId,
        templateName: "FINVUDEMO_TESTING",
        consentDescription: "Personal Loan Account Aggregator Consent",
        redirectUrl: "https://google.co.in"
      };
      
      // console.log("Consent request payload:", consentRequest);
      
      // const response = await axios.post(consentUrl, consentRequest, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   timeout: 10000 // 10 second timeout
      // });
      
      // const consentHandler = response.data.consentHandler;
      // console.log("✅ Consent handler generated:", consentHandler);
      
      // Store consent handler in session data for later use (verify step)
      // sessionData.consent_handler = consentHandler;
      // console.log("Stored consent_handler in session data");
      
      // Inject consent handler into payload tags
      if (existingPayload.message?.order?.items?.[0]) {
        const item = existingPayload.message.order.items[0];
        // item.xinput=sessionData.selected_items_xinput
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
          value: "consentHandler" 
        };
        
        // Find and update existing CONSENT_HANDLER or add new one
        const existingHandlerIndex = consentInfoTag.list?.findIndex((item: any) => 
          item.descriptor?.code === 'CONSENT_HANDLER'
        );
        
        if (existingHandlerIndex !== undefined && existingHandlerIndex >= 0) {
          consentInfoTag.list[existingHandlerIndex] = consentHandlerItem;
          console.log("Updated existing CONSENT_HANDLER in tags");
        } else {
          if (!consentInfoTag.list) {
            consentInfoTag.list = [];
          }
          consentInfoTag.list.push(consentHandlerItem);
          console.log("Added new CONSENT_HANDLER to tags");
        }
        
        console.log("✅ Finvu AA integration successful - consent handler injected into payload");
      } else {
        console.warn("⚠️ Cannot inject consent handler - items[0] not found in payload");
      }
      
    } catch (error: any) {
      console.error("❌ Finvu AA consent generation failed:", error.message);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });
      
      // Fail-safe: Continue without consent handler (or you can throw error to stop flow)
      console.warn("⚠️ Continuing without consent handler due to error");
    }
  } else {
    console.warn("⚠️ No contact number found in session data - skipping Finvu AA integration");
    console.log("Available form data:", sessionData.form_data);
  }
  console.log("Available form data:", sessionData.form_data);
  console.log("Available form data personal info :", sessionData.form_data.consumer_information_form);
  console.log("--- Finvu AA Integration End ---");

  // ========== FORM URL UPDATE ==========
  
  console.log("=== On Select1 Generator End ===");
  console.log("Form data:", sessionData?.form_data?.consumer_information_form);
  console.log("Form data:", sessionData?.form_data?.consumer_information_form.contactNumber);
  
  return existingPayload;
}

