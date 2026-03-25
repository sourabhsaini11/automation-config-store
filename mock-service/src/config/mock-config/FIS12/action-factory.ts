// Gold Loan imports
import { MockSearchClass } from "./gold-loan/2.0.2/search/class";
import { MockOnSearchClass } from "./gold-loan/2.0.2/on_search/class";
import { MockSelectAdjustLoanAmountClass} from "./gold-loan/2.0.2/select_adjust_loan_amount/class";
import { MockSelect1Class } from "./gold-loan/2.0.2/select_1/class";
import { MockSelect2Class } from "./gold-loan/2.0.2/select_2/class";
import { MockSelectBureauLoanClass } from "./gold-loan/2.0.2/select_bureau_loan/class";
import { MockOnSelectAdjustLoanAmountClass } from "./gold-loan/2.0.2/on_select_adjust_loan_amount/class";
import { MockOnSelect1Class } from "./gold-loan/2.0.2/on_select_1/class";
import { MockOnSelect2Class } from "./gold-loan/2.0.2/on_select_2/class";
import { MockInitClass } from "./gold-loan/2.0.2/init/class";
import { MockOnInitClass } from "./gold-loan/2.0.2/on_init/class";
import { MockConfirmClass } from "./gold-loan/2.0.2/confirm/class";
import { MockOnConfirmClass } from "./gold-loan/2.0.2/on_confirm/class";
import { MockUpdateClass } from "./gold-loan/2.0.2/update/class";
import { MockOnUpdateClass } from "./gold-loan/2.0.2/on_update/class";
import { MockOnUpdateForeclosureClass } from "./gold-loan/2.0.2/on_update_foreclosure/class";
import { MockOnUpdateMissedEmiClass } from "./gold-loan/2.0.2/on_update_missed_emi/class";
import { MockOnUpdatePrePartPaymentClass } from "./gold-loan/2.0.2/on_update_pre_part_payment/class";
import { MockOnUpdateUnsolicitedClass } from "./gold-loan/2.0.2/on_update_unsolicited/class";
import { MockOnUpdateForeclosureUnsolicitedClass } from "./gold-loan/2.0.2/on_update_foreclosure_unsolicited/class";
import { MockOnUpdateMissedEmiUnsolicitedClass } from "./gold-loan/2.0.2/on_update_missed_emi_unsolicited/class";
import { MockOnUpdatePrePartPaymentUnsolicitedClass } from "./gold-loan/2.0.2/on_update_pre_part_payment_unsolicited/class";
import type { MockAction } from "./classes/mock-action";
import { MockConsumerInformationFormClass } from "./gold-loan/2.0.2/form/consumer_information_form";
import { MockVerificationStatusClass } from "./gold-loan/2.0.2/form_2/verification_status";
import { MockStatusClass } from "./gold-loan/2.0.2/status/class";
import { MockOnStatusClass } from "./gold-loan/2.0.2/on_status/class";
import { MockOnStatusUnsolicitedClass } from "./gold-loan/2.0.2/on_status_unsolicited/class";

// Personal Loan imports
import { MockSearchPersonalLoanClass } from "./personal-loan/2.0.2/search/class";
import { MockOnSearchPersonalLoanClass } from "./personal-loan/2.0.2/on_search/class";
import { MockSelectBureauConsentPersonalLoanClass } from "./personal-loan/2.0.2/select_bureau_consent_personal_loan/class";
import { MockOnSelectBureauConsentPersonalLoanClass } from "./personal-loan/2.0.2/on_select_bureau_consent_personal_loan/class";
import { MockSelect1PersonalLoanClass } from "./personal-loan/2.0.2/select_1/class";
import { MockSelect2PersonalLoanClass } from "./personal-loan/2.0.2/select_2/class";
import { MockOnSelect1PersonalLoanClass } from "./personal-loan/2.0.2/on_select_1/class";
import { MockOnSelect2PersonalLoanClass } from "./personal-loan/2.0.2/on_select_2/class";
import { MockInitOfflineAndOnlinePersonalLoanClass } from "./personal-loan/2.0.2/init_offline_and_online_personal_loan/class";
import { MockOnInitOfflineAndOnlinePersonalLoanClass } from "./personal-loan/2.0.2/on_init_offline_and_online_personal_loan/class";
import { MockConfirmPersonalLoanClass } from "./personal-loan/2.0.2/confirm/class";
import { MockOnConfirmPersonalLoanClass } from "./personal-loan/2.0.2/on_confirm/class";
import { MockUpdatePersonalLoanClass } from "./personal-loan/2.0.2/update/class";
import { MockOnUpdatePersonalLoanClass } from "./personal-loan/2.0.2/on_update/class";
import { MockOnUpdateUnsolicitedPersonalLoanClass } from "./personal-loan/2.0.2/on_update_unsolicited/class";
import { MockStatusPersonalLoanClass } from "./personal-loan/2.0.2/status/class";
import { MockOnStatusPersonalLoanClass } from "./personal-loan/2.0.2/on_status/class";
import { MockOnStatusUnsolicitedPersonalLoanClass } from "./personal-loan/2.0.2/on_status_unsolicited/class";
import { MockInitOfflinePersonalLoanClass } from "./personal-loan/2.0.2/init_offline/class";
import { MockOnInitOfflinePersonalLoanClass } from "./personal-loan/2.0.2/on_init_offline_personal_loan/class";
import { MockInit1PersonalLoanClass } from "./personal-loan/2.0.2/init_1/class";
import { MockInit2PersonalLoanClass } from "./personal-loan/2.0.2/init_2/class";
import { MockInit3PersonalLoanClass } from "./personal-loan/2.0.2/init_3/class";
import { MockOnInit1PersonalLoanClass } from "./personal-loan/2.0.2/on_init_1/class";
import { MockOnInit2PersonalLoanClass } from "./personal-loan/2.0.2/on_init_2/class";
import { MockOnInit3PersonalLoanClass } from "./personal-loan/2.0.2/on_init_3/class";
import { MockSelect3PersonalLoanClass } from "./personal-loan/2.0.2/select_3/class";
import { MockOnSelect3PersonalLoanClass } from "./personal-loan/2.0.2/on_select_3/class";
import { MockStatus1PersonalLoanClass } from "./personal-loan/2.0.2/status_1/class";
import { MockOnStatus1PersonalLoanClass } from "./personal-loan/2.0.2/on_status_1/class";
import { MockUpdatePersonalLoanFulfillmentClass } from "./personal-loan/2.0.2/update_personal_loan_fulfillment/class";
import { MockOnUpdatePersonalLoanFulfillmentClass } from "./personal-loan/2.0.2/on_update_personal_loan_fulfillment/class";
import { MockLoanAdjustmentFormClass } from "./personal-loan/2.0.2/loan-adjustment-form/loan-amount-adjustment-form";
import { MockMandateDetailsForm } from "./personal-loan/2.0.2/mandate-details-form/manadate-details-form";
import { MockPersonalLoanInformationFormClass } from "./personal-loan/2.0.2/personal_loan_information_form/class";
import { MockSelect3Class } from "./gold-loan/2.0.2/select_3/class";
import { MockOnSelect3Class } from "./gold-loan/2.0.2/on_select_3/class";
import { MockEkycVerificationStatusClass } from "./gold-loan/2.0.2/form_3/ekyc_details_form";
import { MockSelectMultipleOfferClass } from "./gold-loan/2.0.2/select_multiple_offer_1/class";
import { MockOnSelectMultipleOfferClass } from "./gold-loan/2.0.2/on_select_multiple_offer_1/class";
import { MockConsumerInformationFormPl202Class } from "./personal-loan/2.0.2/form/consumer_information_form";
import { MockEKycVerificationStatusPl202Class } from "./personal-loan/2.0.2/form_2/kyc_verification_status";
import { MockPaymentUrlFormStatusClass } from "./personal-loan/2.0.2/form_3/payment_url_form";
import { MockVerificationPlStatusClass } from "./personal-loan/2.0.2/form_4/verification_status";
import { MockIssueOpenGoldLoan_100_Class } from "./gold-loan/2.0.2/issue/issue_100/issue_open/class";
import { MockIssueCloseGoldLoan_100_Class } from "./gold-loan/2.0.2/issue/issue_100/issue_close/class";
import { MockOnIssueResolvedGoldLoan_100_Class } from "./gold-loan/2.0.2/on_issue/on_issue_100/on_issue_resolved/class";
import { MockOnIssueProcessingGoldLoan_100_Class } from "./gold-loan/2.0.2/on_issue/on_issue_100/on_issue_processing/class";
import { MockPaymentUrlFormStatusClassGL } from "./gold-loan/2.0.2/payment_url_form/payment_url_form";

type Ctor<T> = new () => T;

const registry = {

	// Gold Loan actions
	// search
	search: MockSearchClass,
	// on_search
	on_search: MockOnSearchClass,

	// select
	select_1: MockSelect1Class,
	select_2: MockSelect2Class,
	select_multiple_offer: MockSelectMultipleOfferClass,
	on_select_multiple_offer: MockOnSelectMultipleOfferClass,
	select_gold_3: MockSelect3Class,
	on_select_1: MockOnSelect1Class,
	on_select_2: MockOnSelect2Class,
	on_select_gold_3: MockOnSelect3Class,
	select_bureau_loan: MockSelectBureauLoanClass,
	select_adjust_loan_amount: MockSelectAdjustLoanAmountClass,
	on_select_adjust_loan_amount: MockOnSelectAdjustLoanAmountClass,
	// init / on_init
	init: MockInitClass,
	on_init: MockOnInitClass,

	// confirm / on_confirm
	confirm: MockConfirmClass,
	on_confirm: MockOnConfirmClass,

	// status / on_status
	status: MockStatusClass,
	on_status: MockOnStatusClass,
	on_status_unsolicited: MockOnStatusUnsolicitedClass,

	// update / on_update
	update: MockUpdateClass,
	on_update: MockOnUpdateClass,
	on_update_foreclosure: MockOnUpdateForeclosureClass,
	on_update_missed_emi: MockOnUpdateMissedEmiClass,
	on_update_pre_part_payment: MockOnUpdatePrePartPaymentClass,
	on_update_unsolicited: MockOnUpdateUnsolicitedClass,
	on_update_foreclosure_unsolicited: MockOnUpdateForeclosureUnsolicitedClass,
	on_update_missed_emi_unsolicited: MockOnUpdateMissedEmiUnsolicitedClass,
	on_update_pre_part_payment_unsolicited: MockOnUpdatePrePartPaymentUnsolicitedClass,
	consumer_information_form_pl_202: MockConsumerInformationFormPl202Class,
	consumer_information_form: MockConsumerInformationFormClass,
	consumer_information_form_1: MockConsumerInformationFormClass,
	verification_status: MockVerificationStatusClass,
	verification_status_pl: MockVerificationPlStatusClass,
	payment_url_form_gold_loan: MockPaymentUrlFormStatusClassGL,
	Ekyc_details_form: MockEkycVerificationStatusClass,
	Ekyc_details_form_pl_202: MockEKycVerificationStatusPl202Class,
	payment_url_form: MockPaymentUrlFormStatusClass,
	loan_amount_adjustment_form: MockLoanAdjustmentFormClass,
	manadate_details_form: MockMandateDetailsForm,
	personal_loan_information_form: MockPersonalLoanInformationFormClass,

	// Personal Loan actions

	search_personal_loan: MockSearchPersonalLoanClass,
	on_search_personal_loan: MockOnSearchPersonalLoanClass,
	select_bureau_consent_personal_loan: MockSelectBureauConsentPersonalLoanClass,
	on_select_bureau_consent_personal_loan: MockOnSelectBureauConsentPersonalLoanClass,
	select_1_personal_loan: MockSelect1PersonalLoanClass,
	select_2_personal_loan: MockSelect2PersonalLoanClass,
	on_select_1_personal_loan: MockOnSelect1PersonalLoanClass,
	on_select_2_personal_loan: MockOnSelect2PersonalLoanClass,
	select_3_personal_loan: MockSelect3PersonalLoanClass,
	on_select_3_personal_loan: MockOnSelect3PersonalLoanClass,
	confirm_personal_loan: MockConfirmPersonalLoanClass,
	on_confirm_personal_loan: MockOnConfirmPersonalLoanClass,
	update_personal_loan: MockUpdatePersonalLoanClass,
	on_update_personal_loan: MockOnUpdatePersonalLoanClass,
	on_update_unsolicited_personal_loan: MockOnUpdateUnsolicitedPersonalLoanClass,
	status_personal_loan: MockStatusPersonalLoanClass,
	on_status_personal_loan: MockOnStatusPersonalLoanClass,
	on_status_unsolicited_personal_loan: MockOnStatusUnsolicitedPersonalLoanClass,
	init_offline_personal_loan: MockInitOfflinePersonalLoanClass,
	on_init_offline_personal_loan: MockOnInitOfflinePersonalLoanClass,
	init_offline_and_online_personal_loan: MockInitOfflineAndOnlinePersonalLoanClass,
	on_init_offline_and_online_personal_loan: MockOnInitOfflineAndOnlinePersonalLoanClass,
	init_1_personal_loan: MockInit1PersonalLoanClass,
	init_2_personal_loan: MockInit2PersonalLoanClass,
	init_3_personal_loan: MockInit3PersonalLoanClass,
	on_init_1_personal_loan: MockOnInit1PersonalLoanClass,
	on_init_2_personal_loan: MockOnInit2PersonalLoanClass,
	on_init_3_personal_loan: MockOnInit3PersonalLoanClass,
	status_1_personal_loan: MockStatus1PersonalLoanClass,
	on_status_1_personal_loan: MockOnStatus1PersonalLoanClass,
	update_personal_loan_fulfillment: MockUpdatePersonalLoanFulfillmentClass,
	on_update_personal_loan_fulfillment: MockOnUpdatePersonalLoanFulfillmentClass,

	// _____________IGM_1.0.0 for Gold Loan (2.0.2)______________
	issue_open_GD_100: MockIssueOpenGoldLoan_100_Class,
	issue_close_GD_100: MockIssueCloseGoldLoan_100_Class,
	on_issue_processing_GD_100: MockOnIssueProcessingGoldLoan_100_Class,
	on_issue_resolved_GD_100: MockOnIssueResolvedGoldLoan_100_Class

} as const satisfies Record<string, Ctor<MockAction>>;

type MockActionId = keyof typeof registry;

// Construct by id
export function getMockAction(actionId: string): MockAction {
	const Ctor = registry[actionId as MockActionId];
	if (!Ctor) {
		throw new Error(`Action with ID ${actionId as string} not found`);
	}
	return new Ctor();
}

// List all possible ids — stays in sync automatically
export function listMockActions(): MockActionId[] {
	return Object.keys(registry) as MockActionId[];
}
