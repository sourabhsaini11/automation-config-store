import { MockSearchClass } from "./health/2.0.1/search/class";
import { MockOnSearchClass } from "./health/2.0.1/on_search/class";
import { MockOnSearchClass2 } from "./health/2.0.1/on_search2/class";
import { MockOnSearchClass3 } from "./health/2.0.1/on_search3/class";
import { MockSelectClass} from "./health/2.0.1/select/class";
import { MockOnSelectClass } from "./health/2.0.1/on_select/class";
import { MockInitClass } from "./health/2.0.1/init/class";
import { MockInitClass2 } from "./health/2.0.1/init2/class";
import { MockInitClass3 } from "./health/2.0.1/init3/class";
import { MockOnInitClass } from "./health/2.0.1/on_init/class";
import { MockOnInitClass2 } from "./health/2.0.1/on_init2/class";
import { MockOnInitClass3 } from "./health/2.0.1/on_init3/class";
import { MockConfirmClass } from "./health/2.0.1/confirm/class";
import { MockOnConfirmClass } from "./health/2.0.1/on_confirm/class";
import { MockUpdateClass } from "./health/2.0.1/update/class";
import { MockOnUpdateClass } from "./health/2.0.1/on_update/class";
import { MockOnUpdateUnsolicitedClass } from "./health/2.0.1/on_update_unsolicited/class";
import type { MockAction } from "./classes/mock-action";
import { MockConsumerInformationFormClass } from "./health/2.0.1/form6/consumer_information_form";
import { MockStatusClass } from "./health/2.0.1/status/class";
import { MockOnStatusClass } from "./health/2.0.1/on_status/class";
import { MockOnStatusUnsolicitedClass } from "./health/2.0.1/on_status_unsolicited/class";
import { MockIndividualInformationFormClass } from "./health/2.0.1/form/individual_information_form";
import { MockFamilyInformationFormClass } from "./health/2.0.1/form2/family_information_form";
import { MockEkycDetailsFormClass } from "./health/2.0.1/form3/Ekyc_details_form";
import { MockNomineeDetailsFormClass } from "./health/2.0.1/form5/nominee_details_form";
import { MockProposerDetailsFormClass } from "./health/2.0.1/form4/Proposer_Details_form";
import { MockCancelClass } from "./health/2.0.1/cancel/class";
import { MockOnCancelClass } from "./health/2.0.1/on_cancel/class";
import { MockOnUpdateUnsolicited2Class } from "./health/2.0.1/on_update_unsolicited2/class";
import { MockOnUpdateUnsolicited3Class } from "./health/2.0.1/on_update_unsolicited3/class";
import { MockOnUpdateUnsolicited4Class } from "./health/2.0.1/on_update_unsolicited4/class";
import { MockOnUpdateUnsolicited5Class } from "./health/2.0.1/on_update_unsolicited5/class";
import { MockOnStatusUnsolicited2Class } from "./health/2.0.1/on_status_unsolicited2/class";
import { MockOnUpdateUnsolicited6Class } from "./health/2.0.1/on_update_unsolicited6/class";
import { MockOnUpdateUnsolicited7Class } from "./health/2.0.1/on_update_unsolicited7/class";

// Motor API imports
import { MockSearchClass as MotorMockSearchClass } from "./motor/2.0.1/search/class";
import { MockSearchClass as MotorMockSearchClass2 } from "./motor/2.0.1/search2/class";
import { MockOnSearchClass as MotorMockOnSearchClass } from "./motor/2.0.1/on_search/class";
import { MockOnSearchClass2 as MotorMockOnSearchClass2 } from "./motor/2.0.1/on_search2/class";
import { MockSelectClass as MotorMockSelectClass } from "./motor/2.0.1/select/class";
import { MockOnSelectClass as MotorMockOnSelectClass } from "./motor/2.0.1/on_select/class";
import { MockSelect2Class as MotorMockSelect2Class } from "./motor/2.0.1/select2/class";
import { MockOnSelect2Class as MotorMockOnSelect2Class } from "./motor/2.0.1/on_select2/class";
import { MockSelect3Class as MotorMockSelect3Class } from "./motor/2.0.1/select3/class";
import { MockOnSelect3Class as MotorMockOnSelect3Class } from "./motor/2.0.1/on_select3/class";
import { MockInitClass as MotorMockInitClass } from "./motor/2.0.1/init/class";
import { MockInitClass2 as MotorMockInitClass2 } from "./motor/2.0.1/init2/class";
import { MockInitClass3 as MotorMockInitClass3 } from "./motor/2.0.1/init3/class";
import { MockOnInitClass as MotorMockOnInitClass } from "./motor/2.0.1/on_init/class";
import { MockOnInitClass2 as MotorMockOnInitClass2 } from "./motor/2.0.1/on_init2/class";
import { MockOnInitClass3 as MotorMockOnInitClass3 } from "./motor/2.0.1/on_init3/class";
import { MockConfirmClass as MotorMockConfirmClass } from "./motor/2.0.1/confirm/class";
import { MockConfirm2Class as MotorMockConfirm2Class } from "./motor/2.0.1/confirm2/class";
import { MockOnConfirmClass as MotorMockOnConfirmClass } from "./motor/2.0.1/on_confirm/class";
import { MockOnConfirm2Class as MotorMockOnConfirm2Class } from "./motor/2.0.1/on_confirm2/class";
import { MockStatusClass as MotorMockStatusClass } from "./motor/2.0.1/status/class";
import { MockOnStatusClass as MotorMockOnStatusClass } from "./motor/2.0.1/on_status/class";
import { MockOnStatusUnsolicitedClass as MotorMockOnStatusUnsolicitedClass } from "./motor/2.0.1/on_status_unsolicited/class";
import { MockOnStatusUnsolicited2Class as MotorMockOnStatusUnsolicited2Class } from "./motor/2.0.1/on_status_unsolicited2/class";
import { MockOnStatusUnsolicited3Class as MotorMockOnStatusUnsolicited3Class } from "./motor/2.0.1/on_status_unsolicited3/class";
import { MockOnStatusUnsolicited4Class as MotorMockOnStatusUnsolicited4Class } from "./motor/2.0.1/on_status_unsolicited4/class";
import { MockOnStatusUnsolicited5Class as MotorMockOnStatusUnsolicited5Class } from "./motor/2.0.1/on_status_unsolicited5/class";
import { MockUpdateClass as MotorMockUpdateClass } from "./motor/2.0.1/update/class";
import { MockOnUpdateClass as MotorMockOnUpdateClass } from "./motor/2.0.1/on_update/class";
import { MockOnUpdateUnsolicitedClass as MotorMockOnUpdateUnsolicitedClass } from "./motor/2.0.1/on_update_unsolicited/class";
import { MockOnUpdateUnsolicited2Class as MotorMockOnUpdateUnsolicited2Class } from "./motor/2.0.1/on_update_unsolicited2/class";
import { MockOnUpdateUnsolicited3Class as MotorMockOnUpdateUnsolicited3Class } from "./motor/2.0.1/on_update_unsolicited3/class";
import { MockOnUpdateUnsolicited4Class as MotorMockOnUpdateUnsolicited4Class } from "./motor/2.0.1/on_update_unsolicited4/class";
import { MockOnUpdateUnsolicited5Class as MotorMockOnUpdateUnsolicited5Class } from "./motor/2.0.1/on_update_unsolicited5/class";
import { MockCancelClass as MotorMockCancelClass } from "./motor/2.0.1/cancel/class";
import { MockOnCancelClass as MotorMockOnCancelClass } from "./motor/2.0.1/on_cancel/class";
import { MockVehicleDetailsFormClass as MotorMockVehicleDetailsFormClass } from "./motor/2.0.1/form/vehicle_details_form";
import { MockVerificationStatusFormClass } from "./health/2.0.1/form7/verification_status";
import { MockSelect2Class } from "./health/2.0.1/select2/class";
import { MockOnSelect2Class } from "./health/2.0.1/on_select2/class";
import { MockPanDetailsFormClass as MotorMockPanDetailsFormClass} from "./motor/2.0.1/form3/pan_details_form";
import { MockkycDetailsFormClass as MotorMockkycDetailsFormClass } from "./motor/2.0.1/form4/kyc_details_form";
import { MockManualReviewFormClass as MotorMockManualReviewFormClass } from "./motor/2.0.1/form2/manual_review_form_motor";
import { MockConsumerInformationFormClass as MotorMockConsumerInformationFormClass } from "./motor/2.0.1/form7/consumer_information_form";
import { MockVehicleNomineeDetailsFormClass as MotorMockVehicleNomineeDetailsFormClass } from "./motor/2.0.1/form5/vehicle_nominee_details_form";
import { MockPersonalDetailsFormClass as MotorMockPersonalDetailsFormClass } from "./motor/2.0.1/form6/personal_details_form";
import { MockOnStatusUnsolicited3Class } from "./health/2.0.1/on_status_unsolicited3/class";
import { MockOnStatusUnsolicited4Class } from "./health/2.0.1/on_status_unsolicited4/class";
import { MockOnStatusUnsolicited5Class } from "./health/2.0.1/on_status_unsolicited5/class";
import { MockSearch2Class } from "./health/2.0.1/search2/class";
import { MockSearch3Class } from "./health/2.0.1/search3/class";
import { MockSearch4Class } from "./health/2.0.1/search4/class";
import { MockOnSearchClass4 } from "./health/2.0.1/on_search4/class";
import { MockOnConfirm2Class } from "./health/2.0.1/on_confirm2/class";
import { MockConfirm2Class } from "./health/2.0.1/confirm2/class";
import { MockPaymentFormClass } from "./health/2.0.1/form8/payment_form";
import { MockPaymentFormClass as MockPaymentFormMotorClass } from "./motor/2.0.1/form8/payment_form";
import { MockClaimFormClass } from "./health/2.0.1/form9/claim_form";
import { MockClaimFormMotorClass } from "./motor/2.0.1/form9/claim_form_motor";

import { MockRenewFormClass } from "./health/2.0.1/form10/renew_form";
import { MockOnConfirm3Class } from "./health/2.0.1/on_confirm3/class";
import { MockOnUpdateUnsolicited8Class } from "./health/2.0.1/on_update_unsolicited8/class";
import { MockUpdate2Class } from "./health/2.0.1/update2/class";
import { MockOnUpdate2Class } from "./health/2.0.1/on_update2/class";
import { MockPaymentFailureFormClass } from "./health/2.0.1/form11/payment_failure_form";


// types/helpers
type Ctor<T> = new () => T;

// === keep your imports exactly as they are ===

// Build a single source of truth registry
const registry = {
	//health api calls//
	// search
	search: MockSearchClass,
	search2: MockSearch2Class,
	search3: MockSearch3Class,
	search4: MockSearch4Class,

	// on_search
	on_search: MockOnSearchClass,
	on_search2: MockOnSearchClass2,
	on_search3: MockOnSearchClass3,
	on_search4: MockOnSearchClass4,

	// select
	select: MockSelectClass,
	on_select: MockOnSelectClass,
	select2: MockSelect2Class,
	on_select2: MockOnSelect2Class,


	// init / on_init
	init: MockInitClass,
	init2: MockInitClass2,
	init3: MockInitClass3,
	on_init: MockOnInitClass,
	on_init2: MockOnInitClass2,
	on_init3: MockOnInitClass3,

	// confirm / on_confirm
	confirm: MockConfirmClass,
	on_confirm: MockOnConfirmClass,
	confirm2: MockConfirm2Class,
	on_confirm2: MockOnConfirm2Class,
	on_confirm3: MockOnConfirm3Class,

	// status / on_status
	status: MockStatusClass,
	on_status: MockOnStatusClass,
	on_status_unsolicited: MockOnStatusUnsolicitedClass,
	on_status_unsolicited2: MockOnStatusUnsolicited2Class,
	on_status_unsolicited3: MockOnStatusUnsolicited3Class,
	on_status_unsolicited4: MockOnStatusUnsolicited4Class,
	on_status_unsolicited5: MockOnStatusUnsolicited5Class,

	// update / on_update
	update: MockUpdateClass,
	on_update: MockOnUpdateClass,
	update2: MockUpdate2Class,
	on_update2: MockOnUpdate2Class,
	on_update_unsolicited: MockOnUpdateUnsolicitedClass,
	on_update_unsolicited2: MockOnUpdateUnsolicited2Class,
	on_update_unsolicited3: MockOnUpdateUnsolicited3Class,
	on_update_unsolicited4: MockOnUpdateUnsolicited4Class,
	on_update_unsolicited5: MockOnUpdateUnsolicited5Class,
	on_update_unsolicited6: MockOnUpdateUnsolicited6Class,
	on_update_unsolicited7: MockOnUpdateUnsolicited7Class,
	on_update_unsolicited8: MockOnUpdateUnsolicited8Class,

	//cancel
    cancel:MockCancelClass,
    on_cancel:MockOnCancelClass,
	//form
	individual_information_form: MockIndividualInformationFormClass,
	family_information_form: MockFamilyInformationFormClass,
	Ekyc_details_form: MockEkycDetailsFormClass,
	Proposer_Details_form: MockProposerDetailsFormClass,
	nominee_details_form: MockNomineeDetailsFormClass,
	consumer_information_form: MockConsumerInformationFormClass,
	manual_review_form: MockVerificationStatusFormClass,
	payment_form:MockPaymentFormClass,
	claim_form:MockClaimFormClass,
	renew_form:MockRenewFormClass,
	payment_failure_form:MockPaymentFailureFormClass,


	//motor api calls//

	// search
	search_motor: MotorMockSearchClass,
	search2_motor: MotorMockSearchClass2,

	// on_search
	on_search_motor: MotorMockOnSearchClass,
	on_search2_motor: MotorMockOnSearchClass2,

	// select
	select_motor: MotorMockSelectClass,
	on_select_motor: MotorMockOnSelectClass,
	select2_motor: MotorMockSelect2Class,
	on_select2_motor: MotorMockOnSelect2Class,
	select3_motor: MotorMockSelect3Class,
	on_select3_motor: MotorMockOnSelect3Class,


	// init / on_init
	init_motor: MotorMockInitClass,
	init2_motor: MotorMockInitClass2,
	init3_motor: MotorMockInitClass3,
	on_init_motor: MotorMockOnInitClass,
	on_init2_motor: MotorMockOnInitClass2,
	on_init3_motor: MotorMockOnInitClass3,

	// confirm / on_confirm
	confirm_motor: MotorMockConfirmClass,
	on_confirm_motor: MotorMockOnConfirmClass,
	confirm_motor2: MotorMockConfirm2Class,
	on_confirm_motor2: MotorMockOnConfirm2Class,

	// status / on_status
	status_motor: MotorMockStatusClass,
	on_status_motor: MotorMockOnStatusClass,
	on_status_unsolicited_motor: MotorMockOnStatusUnsolicitedClass,
	on_status_unsolicited2_motor: MotorMockOnStatusUnsolicited2Class,
	on_status_unsolicited3_motor: MotorMockOnStatusUnsolicited3Class,
	on_status_unsolicited4_motor: MotorMockOnStatusUnsolicited4Class,
	on_status_unsolicited5_motor: MotorMockOnStatusUnsolicited5Class,

	// update / on_update
	update_motor: MotorMockUpdateClass,
	on_update_motor: MotorMockOnUpdateClass,
	on_update_unsolicited_motor: MotorMockOnUpdateUnsolicitedClass,
	on_update_unsolicited2_motor: MotorMockOnUpdateUnsolicited2Class,
	on_update_unsolicited3_motor: MotorMockOnUpdateUnsolicited3Class,
	on_update_unsolicited4_motor: MotorMockOnUpdateUnsolicited4Class,
	on_update_unsolicited5_motor: MotorMockOnUpdateUnsolicited5Class,


	//cancel
    cancel_motor: MotorMockCancelClass,
    on_cancel_motor: MotorMockOnCancelClass,
	
	//form

	vehicle_details_form:MotorMockVehicleDetailsFormClass,
	manual_review_form_motor:MotorMockManualReviewFormClass,
	pan_details_form: MotorMockPanDetailsFormClass,
	kyc_details_form:MotorMockkycDetailsFormClass,
	vehicle_nominee_details_form:MotorMockVehicleNomineeDetailsFormClass,
	personal_details_form:MotorMockPersonalDetailsFormClass,
	consumer_information_form_motor:MotorMockConsumerInformationFormClass,//need to update
	payment_form_motor:MockPaymentFormMotorClass,
	claim_form_motor:MockClaimFormMotorClass,




	






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
