export interface SessionData {
	subscriber_url: string | undefined;
	transaction_id: string | undefined;
	message_id: string | undefined;
	last_action: string | undefined;
	mock_type: string | undefined;
	city_code: string | undefined;
	bap_id: string | undefined;
	bap_uri: string | undefined;
	bpp_id: string | undefined;
	bpp_uri: string | undefined;
	start_location: string | undefined;
	seat_grid: string | undefined;
	seat_count: string | undefined;
	buyer_app_fee: string | undefined;
	vehicle_type: string | undefined;
	fulfillments: any | undefined;
	category_ids: string[]; // Assuming these are strings; adjust if needed
	provider_id: string | undefined;
	fullfillment_ids: string[]; // Assuming these are strings; adjust if needed
	item_ids: string[]; // Assuming these are strings; adjust if needed
	items: any[] | undefined;
	seat_selection_count: any | undefined;
	selected_items: any[] | undefined;
	billing: any | undefined;
	payments: any[] | undefined;
	updated_payments: any[] | undefined;
	order_id: string | undefined;
	quote: any | undefined;
	status: string;
	error_code: string | undefined;
	error_message: string | undefined;
	ref_id: string | undefined;
	ttl: string | undefined;
	usecaseId : string | undefined;
	stops: any[] | undefined;
	update_stop: any[] | undefined;
	update_quote: any[] | undefined;
	selected_fulfillments: any[] | undefined;
	bap_items: any[] | undefined;
	collected_by: string | undefined;
	updated_price: string | undefined;
	selected_add_ons: any[] | undefined;
	created_at: string | undefined;
	cancellation_reason_id: string | undefined;
	cancellation_quote: any[] | undefined;
	selected_fulfillment_id: string | undefined;
	user_inputs: Input | undefined;
	start_time: string | undefined;
	end_time: string | undefined;
	selected_item_ids: string[] | undefined;
	selected_item_counts: number[] | undefined | any;
	tags: any[] | undefined;
	item: any | undefined;
	selected_provider: any | undefined;
	cancellation_terms: any[] | undefined;
	provider: any | undefined;
	replacement_terms: any[] | undefined;
	payment_collected_by: string | undefined;
	bap_terms_tags: any[] | undefined;
	updated_at: string | undefined;
	order_status: string | undefined;
	search_1_intent_category: any;
	search_1_tags: any[];
	search_6_intent_category: any;
	search_6_tags: any[];
	on_search_2_catalog: any;
	on_search_4_provider_payments: any;
	select_1_provider_id: any
	select_1_items: any;
	select_1_fulfillments: any;
	select_provider_id: any;
	on_select_2_items: any;
	on_select_2_fulfillments: any;
	select_2_items: any;
	select_2_fulfillments: any;
	select_items: any;
	on_select_items: any;
	on_init_provider: any;
	on_init_fulfillments: any;
	catalog_descriptor: any;
	on_select_fulfillments: any;
	providers: any;
	selected_quantity: any;
	fulfillment: any;
	on_select_fulfillments_tags: any;
	price: any;
	end_code: any;
	select_fulfillments: any;
	on_select_2_quote: any
	seats_available: string[];
	on_select_item: any;
}

export type BecknContext = {
	action: string;
	bap_id: string;
	bap_uri: string;
	bpp_id?: string;
	bpp_uri?: string;
	domain: string;
	location: {
		city: {
			code: string;
		};
		country: {
			code: string;
		};
	};
	message_id: string;
	timestamp: string;
	transaction_id: string;
	ttl: string;
	version: string;
};

export interface Input {
	category?: string;
	paymentType?: string;
	city_code?: string;
	start_gps?: string;
	end_gps?: string;
	start_code?: string;
	end_code?: string;
	feature_discovery?: string[];
	fulfillRequest?: string;
	retailCategory?: string;
	returnToOrigin?: string;
	default_feature?: string[];
	seat_count?: string;
	items?: any
	selected_item?: string;
	seat_selection_count?: string;
	adult_ticket_count?: string;
	child_ticket_count?: string;
	journey_date?: string;
	data: any
}