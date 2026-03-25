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

  // Update form URLs for items with session data (preserve existing structure)
  if (existingPayload.message?.catalog?.providers?.[0]?.items) {
    existingPayload.message.catalog.providers[0].items = existingPayload.message.catalog.providers[0].items.map((item: any) => {
      if (item.xinput?.form) {
        // Generate dynamic form URL with session data
        const url = `${process.env.FORM_SERVICE}/forms/${sessionData.domain}/consumer_information_form?session_id=${sessionData.session_id}&flow_id=${sessionData.flow_id}&transaction_id=${existingPayload.context.transaction_id}`;
        console.log("✅ Form URL generated for personal_loan_information_form:", url);
        item.xinput.form.url = url;
        console.log("✅ Form URL set in payload, will be extracted by save-data.yaml");
      }
      return item;
    });
  }

  console.log("session data of on_search", sessionData);
  return existingPayload;
} 