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
	buyer_app_fee: string | undefined;
	vehicle_type: string | undefined;
	fulfillments: any[] | undefined;
	category_ids: string[]; // Assuming these are strings; adjust if needed
	provider_id: string | undefined;
	fullfillment_ids: string[]; // Assuming these are strings; adjust if needed
	item_ids: string[]; // Assuming these are strings; adjust if needed
	items: any[] | undefined;
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
	selected_item_counts: number[] | undefined;
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
	domain: string | undefined;
	// Gold Loan select/on_select state
	last_select_status?: string;
	selected_location_id?: string;
	flow_variant?: string; // WITH_AA | WITHOUT_AA | other
	stage?: string; // optional transient stage marker
	consumer_information_form?: string;
	payment_url_form?: string;
	verification_status?: string;
	Ekyc_details_form?: string;
	manadate_details_form?: string;
	loan_amount_adjustment_form?: string;
	personal_loan_information_form?: string;
	latest_issue_payload: any
	igm_action: any
	issue_action: any
	issue_level: any
	issue_resolution: any
	issue_id: any
	issue_actions: any
	issue_created_at: any
	on_issue_actions: any
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
	// Gold Loan specific fields
	loan_amount?: number;
	foreclosure_amount?: number;
	foreclosure_reason?: string;
	missed_emi_amount?: number;
	missed_emi_date?: string;
	part_payment_amount?: number;
	payment_date?: string;
	resolution_accept: any
    rating: string
}