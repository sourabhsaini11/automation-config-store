//GOLD LOAN FORM 2.0.2 START
// Gold Loan imports
import { MockSearchClass } from "./gold-loan/2.0.2/search/class";
import { MockOnSearchClass } from "./gold-loan/2.0.2/on_search/class";
import { MockSelectAdjustLoanAmountClass } from "./gold-loan/2.0.2/select_adjust_loan_amount/class";
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
import { MockOnUpdateForeclosureClassGD } from "./gold-loan/2.0.2/on_update_foreclosure/class";
import { MockOnUpdateMissedEmiClassGD } from "./gold-loan/2.0.2/on_update_missed_emi/class";
import { MockOnUpdatePrePartPaymentClassGD } from "./gold-loan/2.0.2/on_update_pre_part_payment/class";
import { MockOnUpdateUnsolicitedClassGD } from "./gold-loan/2.0.2/on_update_unsolicited/class";
import { MockOnUpdateForeclosureUnsolicitedClassGD } from "./gold-loan/2.0.2/on_update_foreclosure_unsolicited/class";
import { MockOnUpdateMissedEmiUnsolicitedClassGD } from "./gold-loan/2.0.2/on_update_missed_emi_unsolicited/class";
import { MockOnUpdatePrePartPaymentUnsolicitedClassGD } from "./gold-loan/2.0.2/on_update_pre_part_payment_unsolicited/class";
import type { MockAction } from "./classes/mock-action";
import { MockConsumerInformationFormClass } from "./gold-loan/2.0.2/form/consumer_information_form";
import { MockVerificationStatusClass } from "./gold-loan/2.0.2/form_2/verification_status";
import { MockStatusClass } from "./gold-loan/2.0.2/status/class";
import { MockOnStatusClass } from "./gold-loan/2.0.2/on_status/class";
import { MockOnStatusUnsolicitedClass } from "./gold-loan/2.0.2/on_status_unsolicited/class";
import { MockIssueOpenGoldLoan_100_Class } from "./gold-loan/2.0.2/issue/issue_100/issue_open/class";
import { MockIssueCloseGoldLoan_100_Class } from "./gold-loan/2.0.2/issue/issue_100/issue_close/class";
import { MockOnIssueResolvedGoldLoan_100_Class } from "./gold-loan/2.0.2/on_issue/on_issue_100/on_issue_resolved/class";
import { MockOnIssueProcessingGoldLoan_100_Class } from "./gold-loan/2.0.2/on_issue/on_issue_100/on_issue_processing/class";
import { MockPaymentUrlFormStatusClassGL } from "./gold-loan/2.0.2/payment_url_form/payment_url_form";
import { MockSelect3Class } from "./gold-loan/2.0.2/select_3/class";
import { MockOnSelect3Class } from "./gold-loan/2.0.2/on_select_3/class";
import { MockEkycVerificationStatusClass } from "./gold-loan/2.0.2/form_3/ekyc_details_form";
import { MockSelectMultipleOfferClass } from "./gold-loan/2.0.2/select_multiple_offer_1/class";
import { MockOnSelectMultipleOfferClass } from "./gold-loan/2.0.2/on_select_multiple_offer_1/class";

//GOLD LOAN FROM 2.0.2 END

// Personal Loan imports

import { MockSearchPersonalLoan3Class } from "./personal-loan/2.0.2/search/class";
import { MockOnSearchPersonalLoan3Class } from "./personal-loan/2.0.2/on_search/class";
import { MockSelectBureauConsentPersonalLoan3Class } from "./personal-loan/2.0.2/select_bureau_consent_personal_loan/class";
import { MockOnSelectBureauConsentPersonalLoan3Class } from "./personal-loan/2.0.2/on_select_bureau_consent_personal_loan/class";
import { MockSelect1PersonalLoan3Class } from "./personal-loan/2.0.2/select_1/class";
import { MockSelect2PersonalLoan3Class } from "./personal-loan/2.0.2/select_2/class";
import { MockOnSelect1PersonalLoan3Class } from "./personal-loan/2.0.2/on_select_1/class";
import { MockOnSelect2PersonalLoan3Class } from "./personal-loan/2.0.2/on_select_2/class";
import { MockSelect3PersonalLoan3Class } from "./personal-loan/2.0.2/select_3/class";
import { MockOnSelect3PersonalLoan3Class } from "./personal-loan/2.0.2/on_select_3/class";
import { MockConfirmPersonalLoan3Class } from "./personal-loan/2.0.2/confirm/class";
import { MockOnConfirmPersonalLoan3Class } from "./personal-loan/2.0.2/on_confirm/class";
import { MockUpdatePersonalLoan3Class } from "./personal-loan/2.0.2/update/class";
import { MockOnUpdatePersonalLoan3Class } from "./personal-loan/2.0.2/on_update/class";
import { MockOnUpdateUnsolicitedPersonalLoan3Class } from "./personal-loan/2.0.2/on_update_unsolicited/class";
import { MockStatusPersonalLoan3Class } from "./personal-loan/2.0.2/status/class";
import { MockOnStatusPersonalLoan3Class } from "./personal-loan/2.0.2/on_status/class";
import { MockOnStatusUnsolicitedPersonalLoan3Class } from "./personal-loan/2.0.2/on_status_unsolicited/class";
import { MockOnStatusUnsolicitedEmandatePL3Class } from "./personal-loan/2.0.2/on_status_unsolicited_emandate/class";
import { MockOnStatusUnsolicitedEsignPL3Class } from "./personal-loan/2.0.2/on_status_unsolicited_esign/class";
import { MockInitOfflinePersonalLoan3Class } from "./personal-loan/2.0.2/init_offline/class";
import { MockOnInitOfflinePersonalLoan3Class } from "./personal-loan/2.0.2/on_init_offline_personal_loan/class";
import { MockInitOfflineAndOnlinePersonalLoan3Class } from "./personal-loan/2.0.2/init_offline_and_online_personal_loan/class";
import { MockOnInitOfflineAndOnlinePersonalLoan3Class } from "./personal-loan/2.0.2/on_init_offline_and_online_personal_loan/class";
import { MockInit1PersonalLoan3Class } from "./personal-loan/2.0.2/init_1/class";
import { MockInit2PersonalLoan3Class } from "./personal-loan/2.0.2/init_2/class";
import { MockInit3PersonalLoan3Class } from "./personal-loan/2.0.2/init_3/class";
import { MockOnInit1PersonalLoan3Class } from "./personal-loan/2.0.2/on_init_1/class";
import { MockOnInit2PersonalLoan3Class } from "./personal-loan/2.0.2/on_init_2/class";
import { MockOnInit3PersonalLoan3Class } from "./personal-loan/2.0.2/on_init_3/class";
import { MockStatus1PersonalLoan3Class } from "./personal-loan/2.0.2/status_1/class";
import { MockOnStatus1PersonalLoan3Class } from "./personal-loan/2.0.2/on_status_1/class";
import { MockUpdatePersonalLoanFulfillment3Class } from "./personal-loan/2.0.2/update_personal_loan_fulfillment/class";
import { MockOnUpdatePersonalLoanFulfillment3Class } from "./personal-loan/2.0.2/on_update_personal_loan_fulfillment/class";
import { MockPersonalLoanInformationFormClass } from "./personal-loan/2.0.2/personal_loan_information_form/class"
import { MockKycVerificationStatus3Class } from "./personal-loan/2.0.2/verification_status__Ekyc/kyc_verification_status";
import { MockLoanAdjustmentForm3Class } from "./personal-loan/2.0.2/loan-adjustment-form/loan-amount-adjustment-form";
import { MockMandateDetails3Form } from "./personal-loan/2.0.2/mandate-details-form/manadate-details-form";
import { MockVerificationStatusEmandate } from "./personal-loan/2.0.2/verification_status_Emandate/verification_Emandate"
import { MockLoanAgreementEsignForm } from "./personal-loan/2.0.2/loan_agreement_esign_form/loan_agreement_esign_form"
import { MockPaymentUrlFormStatusClassPL } from "./personal-loan/2.0.2/payment_url_form/payment_url_form";
import { MockOnUpdatePrePartPaymentClass } from "./personal-loan/2.0.2/on_update_pre_part_payment/class";
import { MockOnUpdatePrePartPaymentUnsolicitedClass } from "./personal-loan/2.0.2/on_update_pre_part_payment_unsolicited/class"
import { MockOnUpdateForeclosureClass } from "./personal-loan/2.0.2/on_update_foreclosure/class";
import { MockOnUpdateForeclosureUnsolicitedClass } from "./personal-loan/2.0.2/on_update_foreclosure_unsolicited/class";
import { MockOnUpdateMissedEmiClass } from "./personal-loan/2.0.2/on_update_missed_emi/class";
import { MockOnUpdateMissedEmiUnsolicitedClass } from "./personal-loan/2.0.2/on_update_missed_emi_unsolicited/class";
import { MockOnInitOfflineOnlinePersonalLoan3Class } from "./personal-loan/2.0.2/on_init_online_offline_personal_loan_3/class";
import { MockMultiBureauInfoFormClass } from "./personal-loan/2.0.2/multiple_bureau_information_form/multiple_bureau_information_form";
import { MockOnStatusUnsolicitedKyCPL3Class } from "./personal-loan/2.0.2/on_status_unsolicited_kyc/class";
type Ctor<T> = new () => T;

const registry = {

	// Gold Loan actions start
	// on_search
	search: MockSearchClass,
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
	on_update_foreclosure: MockOnUpdateForeclosureClassGD,
	on_update_missed_emi: MockOnUpdateMissedEmiClassGD,
	on_update_pre_part_payment: MockOnUpdatePrePartPaymentClassGD,
	on_update_unsolicited: MockOnUpdateUnsolicitedClassGD,
	on_update_foreclosure_unsolicited: MockOnUpdateForeclosureUnsolicitedClassGD,
	on_update_missed_emi_unsolicited: MockOnUpdateMissedEmiUnsolicitedClassGD,
	on_update_pre_part_payment_unsolicited: MockOnUpdatePrePartPaymentUnsolicitedClassGD,
	consumer_information_form: MockConsumerInformationFormClass,
	consumer_information_form_1: MockConsumerInformationFormClass,
	verification_status: MockVerificationStatusClass,
	payment_url_form_gold_loan: MockPaymentUrlFormStatusClassGL,
	Ekyc_details_form: MockEkycVerificationStatusClass,
	loan_amount_adjustment_form: MockLoanAdjustmentForm3Class,
	manadate_details_form: MockMandateDetails3Form,
	// personal_loan_information_form: MockPersonalLoanInformationFormClass,


	// Gold Loan actions end


	// _____________IGM_1.0.0 for Gold Loan (2.0.2)______________
	issue_open_GD_100: MockIssueOpenGoldLoan_100_Class,
	issue_close_GD_100: MockIssueCloseGoldLoan_100_Class,
	on_issue_processing_GD_100: MockOnIssueProcessingGoldLoan_100_Class,
	on_issue_resolved_GD_100: MockOnIssueResolvedGoldLoan_100_Class,


	// PERSONAL_LOAN-2.0.2

	loan_amount_adjustment_form_pl: MockLoanAdjustmentForm3Class,
	kyc_verification_status_pl: MockKycVerificationStatus3Class,
	verification_status_e_mandate: MockVerificationStatusEmandate,
	manadate_details_form_pl: MockMandateDetails3Form,
	loan_agreement_esign_form: MockLoanAgreementEsignForm,
	personal_loan_information_form: MockPersonalLoanInformationFormClass,
	multiple_bureau_information_form: MockMultiBureauInfoFormClass,
	payment_url_form: MockPaymentUrlFormStatusClassPL,
	search_personal_loan_3: MockSearchPersonalLoan3Class,
	on_search_personal_loan_3: MockOnSearchPersonalLoan3Class,
	select_bureau_consent_personal_loan_3: MockSelectBureauConsentPersonalLoan3Class,
	on_select_bureau_consent_personal_loan_3: MockOnSelectBureauConsentPersonalLoan3Class,
	select_1_personal_loan_3: MockSelect1PersonalLoan3Class,
	select_2_personal_loan_3: MockSelect2PersonalLoan3Class,
	on_select_1_personal_loan_3: MockOnSelect1PersonalLoan3Class,
	on_select_2_personal_loan_3: MockOnSelect2PersonalLoan3Class,
	select_3_personal_loan_3: MockSelect3PersonalLoan3Class,
	on_select_3_personal_loan_3: MockOnSelect3PersonalLoan3Class,
	confirm_personal_loan_3: MockConfirmPersonalLoan3Class,
	on_confirm_personal_loan_3: MockOnConfirmPersonalLoan3Class,
	update_personal_loan_3: MockUpdatePersonalLoan3Class,
	on_update_personal_loan_3: MockOnUpdatePersonalLoan3Class,
	on_update_unsolicited_personal_loan_3: MockOnUpdateUnsolicitedPersonalLoan3Class,
	status_personal_loan_3: MockStatusPersonalLoan3Class,
	on_status_personal_loan_3: MockOnStatusPersonalLoan3Class,
	on_status_personal_loan_soft_3: MockOnStatusPersonalLoan3Class,
	on_status_unsolicited_personal_loan_3: MockOnStatusUnsolicitedPersonalLoan3Class,
	on_status_unsolicited_emandate_pl_3: MockOnStatusUnsolicitedEmandatePL3Class,
	on_status_unsolicited_esign_pl_3: MockOnStatusUnsolicitedEsignPL3Class,
	on_status_kyc_verification: MockOnStatusUnsolicitedKyCPL3Class,
	on_status_emandate_verification: MockOnStatusUnsolicitedEmandatePL3Class,
	on_status_esign_verification: MockOnStatusUnsolicitedEsignPL3Class,
	init_offline_personal_loan_3: MockInitOfflinePersonalLoan3Class,
	on_init_offline_personal_loan_3: MockOnInitOfflinePersonalLoan3Class,
	on_init_online_offline_personal_loan_3: MockOnInitOfflineOnlinePersonalLoan3Class,
	init_offline_and_online_personal_loan_3: MockInitOfflineAndOnlinePersonalLoan3Class,
	on_init_offline_and_online_personal_loan_3: MockOnInitOfflineAndOnlinePersonalLoan3Class,
	init_1_personal_loan_3: MockInit1PersonalLoan3Class,
	init_2_personal_loan_3: MockInit2PersonalLoan3Class,
	init_3_personal_loan_3: MockInit3PersonalLoan3Class,
	on_init_1_personal_loan_3: MockOnInit1PersonalLoan3Class,
	on_init_2_personal_loan_3: MockOnInit2PersonalLoan3Class,
	on_init_3_personal_loan_3: MockOnInit3PersonalLoan3Class,
	status_1_personal_loan_3: MockStatus1PersonalLoan3Class,
	on_status_1_personal_loan_3: MockOnStatus1PersonalLoan3Class,
	on_update_pre_part_payment_pl: MockOnUpdatePrePartPaymentClass,
	on_update_unsolicited_pre_part_payment: MockOnUpdatePrePartPaymentUnsolicitedClass,
	on_update_foreclosure_unsolicitated: MockOnUpdateForeclosureUnsolicitedClass,
	on_update_foreclosure_pl: MockOnUpdateForeclosureClass,
	on_update_missed_emi_pl: MockOnUpdateMissedEmiClass,
	on_update_unsolicited_missed_emi_pl: MockOnUpdateMissedEmiUnsolicitedClass,
	update_personal_loan_fulfillment_3: MockUpdatePersonalLoanFulfillment3Class,
	on_update_personal_loan_fulfillment_3: MockOnUpdatePersonalLoanFulfillment3Class,


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
