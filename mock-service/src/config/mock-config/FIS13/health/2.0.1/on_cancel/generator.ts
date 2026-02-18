
export async function onCancelDefaultGenerator(existingPayload: any, sessionData: any) {
  // Update context timestamp
  if (existingPayload.context) {
    existingPayload.context.timestamp = new Date().toISOString();
  }
  
  // Update transaction_id from session data
  if (sessionData.transaction_id && existingPayload.context) {
    existingPayload.context.transaction_id = sessionData.transaction_id;
  }
  
  // Update message_id from session data
  if (sessionData.message_id && existingPayload.context) {
    existingPayload.context.message_id = sessionData.message_id;
  }
  
  // Load order from session data
  if (existingPayload.message) {
    const order = existingPayload.message.order || (existingPayload.message.order = {});

    // Map order.id from session data (carry-forward from confirm)
    if (sessionData.order_id) {
      order.id = sessionData.order_id;
    }

    // Map provider.id from session data (carry-forward from confirm)
    if (sessionData.selected_provider?.id && order.provider) {
      order.provider.id = sessionData.selected_provider.id;
    }

    // Map item.id from session data (carry-forward from confirm)
    const selectedItem = sessionData.item || (Array.isArray(sessionData.items) ? sessionData.items[0] : undefined);
    if (selectedItem?.id && order.items?.[0]) {
      order.items[0].id = selectedItem.id;
    }

    // Map quote.id from session data (carry-forward from confirm)
    if (sessionData.quote_id && order.quote) {
      order.quote.id = sessionData.quote_id;
    }

    // Map fulfillment.id from session data
    if (sessionData.fullfillment_ids?.[0] && order.fulfillments?.[0]) {
      order.fulfillments[0].id = sessionData.fullfillment_ids[0];
    }
  }

  // Helper to upsert a breakup line
  function upsertBreakup(order: any, title: string, value: string, currency: string = 'INR') {
    order.quote = order.quote || { price: { currency: 'INR', value: '0' }, breakup: [] };
    order.quote.breakup = Array.isArray(order.quote.breakup) ? order.quote.breakup : [];
    const idx = order.quote.breakup.findIndex((b: any) => (b.title || '').toUpperCase() === title.toUpperCase());
    const row = { title, price: { value, currency } };
    if (idx >= 0) order.quote.breakup[idx] = row; else order.quote.breakup.push(row);
  }

  // Helper to generate time range based on context timestamp
  function generateTimeRangeFromContext(contextTimestamp: string) {
    const contextDate = new Date(contextTimestamp);
    const year = contextDate.getUTCFullYear();
    const month = contextDate.getUTCMonth();
    
    // Create start of month
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    // Create end of month
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    
    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  // Helper to add delayed installment
  function addDelayedInstallment(order: any, contextTimestamp: string) {
    if (!order.payments) order.payments = [];
    
    const contextDate = new Date(contextTimestamp);
    const year = contextDate.getUTCFullYear();
    const month = contextDate.getUTCMonth();
    
    // Create start of month
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    // Create end of month
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    
    const delayedPayment = {
      id: "INSTALLMENT_ID_GOLD_LOAN",
      type: "POST_FULFILLMENT",
      params: {
        amount: "46360",
        currency: "INR"
      },
      status: "DELAYED",
      time: {
        label: "INSTALLMENT",
        range: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    };
    
    order.payments.push(delayedPayment);
  }

  // Helper to mark all installments before the delayed one as PAID
  function markPreviousInstallmentsAsPaid(order: any, contextTimestamp: string) {
    if (!order.payments || !Array.isArray(order.payments)) return;
    
    const contextDate = new Date(contextTimestamp);
    
    order.payments.forEach((payment: any) => {
      if (payment.time?.label === 'INSTALLMENT' && payment.type === 'POST_FULFILLMENT' && payment.time?.range?.start) {
        const paymentStartDate = new Date(payment.time.range.start);
        
        // If this installment is before the context date (current delayed month), mark as PAID
        if (paymentStartDate < contextDate && payment.status !== 'DELAYED') {
          payment.status = 'PAID';
        }
      }
    });
  }

  // Branch by update label
  const orderRef = existingPayload.message?.order || {};
  const label = sessionData.update_label
    || orderRef?.payments?.[0]?.time?.label
    || sessionData.user_inputs?.foreclosure_amount && 'FORECLOSURE'
    || sessionData.user_inputs?.missed_emi_amount && 'MISSED_EMI_PAYMENT'
    || sessionData.user_inputs?.part_payment_amount && 'PRE_PART_PAYMENT'
    || 'FORECLOSURE';

  // Ensure payments structure exists
  orderRef.payments = orderRef.payments || [{}];
  const firstPayment = orderRef.payments[0];
  firstPayment.time = firstPayment.time || {};
  firstPayment.time.label = label;

  if (label === 'MISSED_EMI_PAYMENT') {
    // Set payment params for missed EMI (matching on_confirm installment amount)
    firstPayment.params = firstPayment.params || {};
    firstPayment.params.amount = "46360"; // Matches INSTALLMENT_AMOUNT from on_confirm
    firstPayment.params.currency = "INR";
    
    // Set time range based on context timestamp
    const contextTimestamp = existingPayload.context?.timestamp || new Date().toISOString();
    firstPayment.time.range = generateTimeRangeFromContext(contextTimestamp);
    
    // Mark all installments before the delayed one as PAID
    markPreviousInstallmentsAsPaid(orderRef, contextTimestamp);
    
    // Add delayed installment
    addDelayedInstallment(orderRef, contextTimestamp);
    
    // Set payment URL
    const refId = sessionData.message_id || orderRef.id || 'b5487595-42c3-4e20-bd43-ae21400f60f0';
    firstPayment.url = `https://pg.icici.com/?amount=46360&ref_id=${encodeURIComponent(refId)}`;
  }

  if (label === 'FORECLOSURE') {
    // Add foreclosure charges to quote.breakup (0.5% of principal amount from on_confirm)
    // Principal amount from on_confirm is 200000, so 0.5% = 1000, but using 9536 as specified
    upsertBreakup(orderRef, 'FORCLOSUER_CHARGES', '9536');
    
    // Calculate foreclosure amount: Outstanding Principal + Outstanding Interest + Foreclosure Charges
    // From on_update default.yaml: OUTSTANDING_PRINCIPAL=139080, OUTSTANDING_INTEREST=0, FORCLOSUER_CHARGES=9536
    const outstandingPrincipal = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_PRINCIPAL')?.price?.value || '139080';
    const outstandingInterest = orderRef.quote?.breakup?.find((b: any) => b.title === 'OUTSTANDING_INTEREST')?.price?.value || '0';
    const foreclosureCharges = '9536';
    const foreclosureAmount = String(parseInt(outstandingPrincipal) + parseInt(outstandingInterest) + parseInt(foreclosureCharges));
    
    // Set payment params for foreclosure
    firstPayment.params = firstPayment.params || {};
    firstPayment.params.amount = foreclosureAmount; // Outstanding principal + interest + charges
    firstPayment.params.currency = "INR";
    
    // Remove time range for foreclosure
    if (firstPayment.time.range) delete firstPayment.time.range;
    
    // Set payment URL
    const refId = sessionData.message_id || orderRef.id || 'b5487595-42c3-4e20-bd43-ae21400f60f0';
    firstPayment.url = `https://pg.icici.com/?amount=${foreclosureAmount}&ref_id=${encodeURIComponent(refId)}`;
  }
  
  if (label === 'PRE_PART_PAYMENT') {
    // Add pre payment charge to quote.breakup
    upsertBreakup(orderRef, 'PRE_PAYMENT_CHARGE', '4500');
    
    // Set payment params for pre part payment (installment amount + pre payment charge)
    firstPayment.params = firstPayment.params || {};
    firstPayment.params.amount = "50860"; // 46360 (installment) + 4500 (pre payment charge)
    firstPayment.params.currency = "INR";
    
    // Remove time range for pre part payment
    if (firstPayment.time.range) delete firstPayment.time.range;
    
    // Set payment URL
    const refId = sessionData.message_id || orderRef.id || 'b5487595-42c3-4e20-bd43-ae21400f60f0';
    firstPayment.url = `https://pg.icici.com/?amount=50860&ref_id=${encodeURIComponent(refId)}`;
  }
  
  return existingPayload;
}
