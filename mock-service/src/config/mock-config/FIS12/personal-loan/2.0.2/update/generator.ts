export async function updateDefaultGenerator(existingPayload: any, sessionData: any) {
  console.log("Gold Loan Update generator - Available session data:", {
    transaction_id: sessionData.transaction_id,
    message_id: sessionData.message_id,
    order_id: sessionData.order_id,
    update_target: sessionData.update_target,
    flow_id: sessionData.flow_id,
    user_inputs: sessionData.user_inputs
  });

  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }

  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }


  // Load update_target from session data
  if (sessionData.update_target && existingPayload.message) {
    existingPayload.message.update_target = sessionData.update_target;
  }

  // Normalize message.update_target to string and map payment label/amount
  if (existingPayload.message) {
    // Ensure update_target is a simple string 'payments'
    if (!existingPayload.message.update_target) existingPayload.message.update_target = 'payments';

    existingPayload.message.order = existingPayload.message.order || {};
    existingPayload.message.order.id = sessionData.order_id;
    existingPayload.message.order.payments = existingPayload.message.order.payments || [{}];

    // Choose label based on flow_id, user_inputs, or saved update_label
    let labelFromSession = sessionData.update_label;
    console.log("labelFromSession", labelFromSession);
    console.log("sessionData.flow_id", sessionData.flow_id);

    // Map flow IDs to specific payment labels
    if (sessionData.flow_id) {
      if (sessionData.flow_id.includes('Missed_EMI')) {
        labelFromSession = 'MISSED_EMI_PAYMENT';
      } else if (sessionData.flow_id.includes('Foreclosure')) {
        labelFromSession = 'FORECLOSURE';
      } else if (sessionData.flow_id.includes('Part_Payment') || sessionData.flow_id.includes('Pre_Part')) {
        labelFromSession = 'PRE_PART_PAYMENT';
      }
    }

    // Fallback to existing label if no flow-based mapping found
    const existingPayment = existingPayload.message.order.payments[0];
    if (!labelFromSession && existingPayment?.time?.label) {
      labelFromSession = existingPayment.time.label;
    }

    // Create minimal payment object based on label type
    if (labelFromSession === 'PRE_PART_PAYMENT') {
      // For PRE_PART_PAYMENT: include params with amount
      existingPayload.message.order.payments[0] = {
        time: {
          label: labelFromSession
        },
        params: {
          amount: String(sessionData?.user_inputs?.pre_part_payment) || "92232",
          currency: sessionData.update_currency || 'INR'
        }
      };
    } else if (labelFromSession === 'FORECLOSURE' || labelFromSession === 'MISSED_EMI_PAYMENT') {
      // For FORECLOSURE and MISSED_EMI_PAYMENT: only time.label (minimal payload)
      existingPayload.message.order.payments[0] = {
        time: {
          label: labelFromSession
        }
      };
      console.log(`${labelFromSession} - minimal payload with only time.label`);
    } else if (labelFromSession) {
      // Fallback for any other label
      existingPayload.message.order.payments[0] = {
        time: {
          label: labelFromSession
        }
      };
    }
  }

  console.log(" update payload generated successfully");
  return existingPayload;
} 