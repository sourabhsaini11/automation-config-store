import { SessionData } from "../../../../session-types";
type Price = {
	value: string;
	currency: string;
  };
  
  type Item = {
	id: string;
	price: Price;
	quantity: {
	  selected: {
		count: number;
	  };
	};
  };
  
  type Breakup = {
	title: string;
	item?: Item;
	price: Price;
  };
  
  type Quote = {
	price: Price;
	breakup: Breakup[];
  };
    function stripTicketAuthorizations(order: any) {
  if (!order.fulfillments) return order;

  order.fulfillments = order.fulfillments.map((fulfillment: any) => {
    if (fulfillment.type === "TICKET") {
      // remove stops entirely
      const { stops, ...rest } = fulfillment;
      return rest;
    }
    return fulfillment;
  });

  return order;
}
  function updateSettlementAmount(order: any, sessionData: SessionData) {
  if (!order?.payments || !order?.quote?.price?.value) return order;

  const quoteValue = parseFloat(order.quote.price.value);
  const buyerFinderFee = parseFloat(sessionData.buyer_app_fee || "3");
  const newSettlementAmount = ((quoteValue * buyerFinderFee) / 100).toFixed(2);
  
  order.payments = order.payments.map((payment: any) => {
    if (!payment.tags) return payment;

    payment.tags = payment.tags.map((tag: any) => {
      if (tag.descriptor?.code === "SETTLEMENT_TERMS" && Array.isArray(tag.list)) {
        tag.list = tag.list.map((item: any) => {
          if (item.descriptor?.code === "SETTLEMENT_AMOUNT") {
            return {
              ...item,
              value: newSettlementAmount,
            };
          }
          return item;
        });
      }
      return tag;
    });

    return payment;
  });

  return order;
}

export async function onCancelHardGenerator(existingPayload: any,sessionData: SessionData){
    if (sessionData.updated_payments.length > 0) {
		existingPayload.message.order.payments = sessionData.updated_payments;
	  }
	
	if (sessionData.items.length > 0) {
	existingPayload.message.order.items = sessionData.items;
	}

	if (sessionData.fulfillments.length > 0) {
	existingPayload.message.order.fulfillments = sessionData.fulfillments;
	}
	if (sessionData.order_id) {
	existingPayload.message.order.id = sessionData.order_id;
	}
	if(sessionData.quote != null){
	existingPayload.message.order.quote = sessionData.quote
	}
  if(sessionData.cancellation_reason_id){
      existingPayload.message.order.cancellation.reason.descriptor.code = sessionData.cancellation_reason_id
    }
  
	existingPayload.message.order.status = "CANCELLED"
	const now = new Date().toISOString();
    existingPayload.message.order.created_at = sessionData.created_at
    existingPayload.message.order.updated_at = now
    return existingPayload;
}