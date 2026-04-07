// 210
import { MockCancelHardBus210Class } from "./BUS/2.1.0/cancel/cancel_hard/class";
import { MockCancelSoftBus210Class } from "./BUS/2.1.0/cancel/cancel_soft/class";
import { MockCancelTechBus210Class, MockCancelTechSoftBus210Class } from "./BUS/2.1.0/cancel/cancel_tech/class";
import { MockConfirmBus210Class } from "./BUS/2.1.0/confirm/confirm/class";
import { MockConfirmVehConBus210Class } from "./BUS/2.1.0/confirm/confirm_veh_con/class";
import { MockConfirmVehConWithoutBus210Class } from "./BUS/2.1.0/confirm/confirm_veh_con_without/class";
import { MockInitBus210Class } from "./BUS/2.1.0/init/class";
import { MockOnCancelBus210Class, MockOnCancelBusTech_Soft210Class } from "./BUS/2.1.0/on_cancel/on_cancel/class";
import { MockOnCancelHardBus210Class } from "./BUS/2.1.0/on_cancel/on_cancel_hard/class";
import { MockOnCancelInitBus210Class } from "./BUS/2.1.0/on_cancel/on_cancel_init/class";
import { MockOnCancelSoftBus210Class } from "./BUS/2.1.0/on_cancel/on_cancel_soft/class";
import { MockOnConfirmBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm/class";
import { MockOnConfirmDelayedBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_delayed/class";
import { MockOnConfirmVehConBus210Class, MockOnConfirmVehConBusQr210Class } from "./BUS/2.1.0/on_confirm/on_confirm_vehicle/class";
import { MockOnConfirmVehConWithoutUpdateBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_vehicle_without_update/class";
import { MockOnInitBus210Class } from "./BUS/2.1.0/on_init/class";
import { MockOnSearch1Bus210Class } from "./BUS/2.1.0/on_search/on_search/class";
import {
  MockOnSearchCatalog1Bus210Class,
  MockOnSearchCatalog2Bus210Class,
  MockOnSearchCatalog3Bus210Class,
  MockOnSearchCatalog4Bus210Class,
  MockOnSearchCatalog5Bus210Class,
} from "./BUS/2.1.0/on_search/on_search_catalog/class";
import { MockOnSelectBus210Class } from "./BUS/2.1.0/on_select/class";
import { MockOnSelectBusUnlimitedPass210Class } from "./BUS/2.1.0/on_select/on_select_unlimited_pass/class";
import { MockOnStatusActiveBus210Class } from "./BUS/2.1.0/on_status/on_status_active/class";
import { MockOnStatusCancellationBus210Class } from "./BUS/2.1.0/on_status/on_status_cancellation/class";
import { MockOnUpdateAcceptedBus210Class } from "./BUS/2.1.0/on_update/on_update_accepted/class";
import { MockOnUpdateVehicleBus210Class } from "./BUS/2.1.0/on_update/on_update_vehicle/class";
import { MockOnUpdateVehicleQrBus210Class } from "./BUS/2.1.0/on_update/on_update_vehicle_qr/class";
import { MockSearch0Bus210Class } from "./BUS/2.1.0/search/search0/class";
import { MockSearch1Bus210Class } from "./BUS/2.1.0/search/search1/class";
import { MockSelectBus210Class } from "./BUS/2.1.0/select/class";
import { MockSelectUnlimitedPassBus210Class } from "./BUS/2.1.0/select/select_unlimited_pass/class";
import { MockStatusBus210Class } from "./BUS/2.1.0/status/status_ref_id/class";
import { MockUpdateBus210Class } from "./BUS/2.1.0/update/update_/class";
import { MockUpdateQrBus210Class } from "./BUS/2.1.0/update/update_qr/class";
// METRO 2.1.0
import { MockCancelMetro210Class } from "./METRO/2.1.0/cancel/cancel/class";
import { MockCancelHardMetro210Class } from "./METRO/2.1.0/cancel/cancel_hard/class";
import { MockCancelSoftMetro210Class } from "./METRO/2.1.0/cancel/cancel_soft/class";
import { MockCancelTechMetro210Class } from "./METRO/2.1.0/cancel/cancel_tech/class";
import { MockConfirmMetro210Class } from "./METRO/2.1.0/confirm/class";
import { MockInitMetro210Class } from "./METRO/2.1.0/init/class";
import { OnCancelMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel/class";
import { OnCancelHardMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel_hard/class";
import { OnCancelInitMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel_init/class";
import { OnCancelSoftMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel_soft/class";
import { MockOnConfirmMetro210Class } from "./METRO/2.1.0/on_confirm/on_confirm/class";
import { MockOnConfirmDelayedMetro210Class } from "./METRO/2.1.0/on_confirm/on_confirm_delayed/class";
import { MockOnInitMetro210Class } from "./METRO/2.1.0/on_init/class";
import { MockOnSearch1Metro210Class } from "./METRO/2.1.0/on_search/on_search1/class";
import { MockOnSearch2Metro210Class } from "./METRO/2.1.0/on_search/on_search2/class";
import { MockOnSelectMetro210Class } from "./METRO/2.1.0/on_select/class";
import { MockOnStatusActiveMetro210Class } from "./METRO/2.1.0/on_status/on_status_active/class";
import { MockOnStatusCancelMetro210Class } from "./METRO/2.1.0/on_status/on_status_cancelled/class";
import { MockOnStatusCompleteMetro210Class } from "./METRO/2.1.0/on_status/on_status_complete/class";
import { MockOnUpdateAcceptedMetro210Class } from "./METRO/2.1.0/on_update/on_update_accepted/class";
import { MockOnUpdateEndStop1MetroClass } from "./METRO/2.1.0/on_update/on_update_end_stop_1/class";
import { MockOnUpdateEndStop2MetroClass } from "./METRO/2.1.0/on_update/on_update_end_stop_2/class";
import { MockOnUpdateEndStop3MetroClass } from "./METRO/2.1.0/on_update/on_update_end_stop_3/class";
import { MockSearch1Metro210Class } from "./METRO/2.1.0/search/search1/class";
import { MockSearch2Metro210Class } from "./METRO/2.1.0/search/search2/class";
import { MockSelectMetro210Class } from "./METRO/2.1.0/select/class";
import { MockStatusMetro210Class } from "./METRO/2.1.0/status/status_active/class";
import { MockStatusTechCancelMetro210Class } from "./METRO/2.1.0/status/status_tech_cancel/class";
import { MockUpdateEndStop1MetroClass } from "./METRO/2.1.0/update/update_end_stop_1/class";
import { MockUpdateEndStop2MetroClass } from "./METRO/2.1.0/update/update_end_stop_2/class";
import { MockUpdateEndStop3MetroClass } from "./METRO/2.1.0/update/update_end_stop_3/class";

import { MockAction } from "./classes/mock-action";
import { MockStatusPurchaseFlowBus210Class } from "./BUS/2.1.0/status/class";
import { MockOnStatusCompleteBus210Class } from "./BUS/2.1.0/on_status/on_status_complete/class";
import { MockOnCancelMerchantBus210Class } from "./BUS/2.1.0/on_cancel/on_cancel_merchant/class";
import { MockOnSearchMonthlyPassBus210Class } from "./BUS/2.1.0/on_search/on_search_monthly_pass/class";
import { MockSearchMonthlyPassBus210Class } from "./BUS/2.1.0/search/search_monthly_pass/class";
import { MockOnSearchMonthlyPass1Bus210Class } from "./BUS/2.1.0/on_search/on_search_monthly_pass1/class";
import { MockOnConfirmMonthlyPassesBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_monthly_passes/class";

import { MockIssueEscalateClass, MockIssueOpenClass } from "./BUS/2.1.0/issue/issue_open/class";
import { MockIssueOpen2Class } from "./BUS/2.1.0/issue/issue_open_2/class";
import { MockIssueInfoProvidedClass } from "./BUS/2.1.0/issue/issue_info_provided/class";
import { MockOnIssueProvidedClass } from "./BUS/2.1.0/on_issue/on_issue_provided/class";
import { MockOnIssueProcessing1Class, MockOnIssueProcessing2Class, MockOnIssueProcessingClass } from "./BUS/2.1.0/on_issue/on_issue_processing/class";
import { MockOnIssueNeedMoreInfoClass } from "./BUS/2.1.0/on_issue/on_issue_need_more_info/class";
import { MockOnIssueResolution1Class, MockOnIssueResolution2Class, MockOnIssueResolutionClass, MockOnIssueResolutionIGM3Class } from "./BUS/2.1.0/on_issue/on_issue_resolution/class";
import { MockIssueResolutionAcceptClass, MockIssueResolutionAcceptIGM3Class, MockIssueResolutionRejectClass } from "./BUS/2.1.0/issue/issue_resolution_accept/class";
import { MockOnIssueResolvedClass, MockOnIssueResolvedIGM3Class } from "./BUS/2.1.0/on_issue/on_issue_resolved/class";
import { MockIssueCloseClass, MockIssueCloseIGM3Class } from "./BUS/2.1.0/issue/issue_close/class";
import { MockIssueEscalateMetro_210_Class, MockIssueOpenMetro_210_Class } from "./METRO/2.1.0/issue/issue_open/class";
import { MockIssueOpen2Metro_210_Class } from "./METRO/2.1.0/issue/issue_open_2/class";
import { MockOnIssueProcessing1Metro_210_Class, MockOnIssueProcessing2Metro_210_Class, MockOnIssueProcessingMetro_210_Class } from "./METRO/2.1.0/on_issue/on_issue_processing/class";
import { MockOnIssueNeedMoreInfoMetro_210_Class } from "./METRO/2.1.0/on_issue/on_issue_need_more_info/class";
import { MockIssueInfoProvidedMetro_210_Class } from "./METRO/2.1.0/issue/issue_info_provided/class";
import { MockOnIssueProvidedMetro_210_Class } from "./METRO/2.1.0/on_issue/on_issue_provided/class";
import { MockOnIssueResolution1Metro_210_Class, MockOnIssueResolution2Metro_210_Class, MockOnIssueResolutionIGM3Metro_210_Class, MockOnIssueResolutionMetro_210_Class } from "./METRO/2.1.0/on_issue/on_issue_resolution/class";
import { MockIssueResolutionAcceptIGM3Metro_210_Class, MockIssueResolutionAcceptMetro_210_Class, MockIssueResolutionRejectMetro_210_Class } from "./METRO/2.1.0/issue/issue_resolution_accept/class";
import { MockOnIssueResolvedIGM3Metro_210_Class, MockOnIssueResolvedMetro_210_Class } from "./METRO/2.1.0/on_issue/on_issue_resolved/class";
import { MockIssueCloseIGM3Metro_210_Class, MockIssueCloseMetro_210_Class } from "./METRO/2.1.0/issue/issue_close/class";
import { MockOnSearch0Bus210Class } from "./BUS/2.1.0/on_search/on_search0/class";
import { MockIssueOpenBus_100_Class } from "./BUS/2.1.0/issue/issue_100/issue_open/class";
import { MockIssueCloseBus_100_Class } from "./BUS/2.1.0/issue/issue_100/issue_close/class";
import { MockOnIssueProcessingBus_100_Class } from "./BUS/2.1.0/on_issue/on_issue_100/on_issue_processing/class";
import { MockOnIssueResolvedBus_100_Class } from "./BUS/2.1.0/on_issue/on_issue_100/on_issue_resolved/class";
import { MockIssueOpenMetro_100_Class } from "./METRO/2.1.0/issue/issue_100/issue_open/class";
import { MockIssueCloseMetro_100_Class } from "./METRO/2.1.0/issue/issue_100/issue_close/class";
import { MockOnIssueProcessingMetro_100_Class } from "./METRO/2.1.0/on_issue/on_issue_100/on_issue_processing/class";
import { MockOnIssueResolvedMetro_100_Class } from "./METRO/2.1.0/on_issue/on_issue_100/on_issue_resolved/class";
import { MockSearchMasterMetro210Class } from "./METRO/2.1.0/search/searchmaster/class";
import { MockOnSearchMasterMetro210Class } from "./METRO/2.1.0/on_search/on_searchmaster/class";
import { MockOnSearchMetro_Purchase210Class } from "./METRO/2.1.0/on_search/on_search_purchase/class";
import { MockOnSearchMetroRecharge210Class } from "./METRO/2.1.0/on_search/on_search_recharge/class";
import { MockSelectMetroPurchase210Class } from "./METRO/2.1.0/select/select_purchase/class";
import { MockSelectMetroRecharge210Class } from "./METRO/2.1.0/select/select_recharge/class";
import { MockInitMetroPurchase210Class } from "./METRO/2.1.0/init/init_purchase/class";
import { MockInitMetroRecharge210Class } from "./METRO/2.1.0/init/init_recharge/class";
import { MockOnInitMetroPurchase210Class } from "./METRO/2.1.0/on_init/on_init_purchase/class";
import { MockOnInitMetroRecharge210Class } from "./METRO/2.1.0/on_init/on_init_recharge/class";
import { MockConfirmMetroPurchase210Class } from "./METRO/2.1.0/confirm/confirm_purchase/class";
import { MockConfirmMetroRecharge210Class } from "./METRO/2.1.0/confirm/confirm_recharge/class";
import { MockOnConfirmMetroPurchase210Class } from "./METRO/2.1.0/on_confirm/on_confirm_purchase/class";
import { MockOnConfirmMetroRecharge210Class } from "./METRO/2.1.0/on_confirm/on_confirm_recharge/class";
import { MockOnSelectMetroPurchase210Class } from "./METRO/2.1.0/on_select/on_select_purchase/class";
import { MockOnSelectMetroRecharge210Class } from "./METRO/2.1.0/on_select/on_select_recharge/class";
import { MockOnStatusTechnicalMetro210Class } from "./METRO/2.1.0/on_status/on_status_technical/class";
import { OnCancelSoftTechnicalMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel_soft_technical/class";
import { OnCancelHardTechnicalMetro210Class } from "./METRO/2.1.0/on_cancel/on_cancel_hard_technical/class";
import { MockUpdatePurchaseHourneyBus210Class } from "./BUS/2.1.0/update/update_purchase_journey/class";
import { MockOnUpdatePurchaseJourneyBus210Class, MockUnsoliciatedOnStatusOrderCompletedBus210Class } from "./BUS/2.1.0/on_update/on_update_purchase_journey/class";
import { MockSelectAgentActivationBus210Class } from "./BUS/2.1.0/select/select_agent_activation/class";
import { MockOnSelectAgentActivationBus210Class } from "./BUS/2.1.0/on_select/on_select_agent_activation/class";
import { MockInitAgentActivationBus210Class } from "./BUS/2.1.0/init/init_agent_activation/class";
import { MockOnInitAgentActivationBus210Class } from "./BUS/2.1.0/on_init/on_init_agent_activation/class";
import { MockConfirmAgentActivationBus210Class } from "./BUS/2.1.0/confirm/confirm_agent_activation/class";
import { MockOnConfirmAgentActivationBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_agent_activation/class";
import { MockInitAgentLoginBus210Class } from "./BUS/2.1.0/init/init_agent_login/class";
import { MockOnInitAgentLoginBus210Class } from "./BUS/2.1.0/on_init/on_init_agent_login/class";
import { MockConfirmAgentLoginBus210Class } from "./BUS/2.1.0/confirm/confirm_agent_login/class";
import { MockOnConfirmAgentLoginBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_agent_login/class";
import { MockConfirmAgentPurchaseBus210Class } from "./BUS/2.1.0/confirm/confirm_agent_purchase/class";
import { MockOnConfirmAgentPurchaseBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_agent_purchase/class";
import { MockUpdateBaseOrderUpdateBus210Class } from "./BUS/2.1.0/update/update_base_order_update/class";
import { MockOnUpdateBaseOrderUpdateBus210Class } from "./BUS/2.1.0/on_update/on_update_base_order_update/class";
import { MockInitUnlimitedPassBus210Class } from "./BUS/2.1.0/init/init_unlimited_pass/class";
import { MockOnInitUnlimitedPassBus210Class } from "./BUS/2.1.0/on_init/on_init_unlimited_pass/class";
import { MockConfirmUnlimitedPassBus210Class } from "./BUS/2.1.0/confirm/confirm_unlimited_pass/class";
import { MockOnConfirmUnlimitedPassBus210Class } from "./BUS/2.1.0/on_confirm/on_confirm_unlimited_pass/class";
import { MockOnSearchMetro_UnlimitedPass210Class } from "./METRO/2.1.0/on_search/on_search_unlimitedpass/class";
import { MockSelectMetroUnlimitedPass210Class } from "./METRO/2.1.0/select/select_unlimitedpass/class";
import { MockOnSelectMetroUnlimitedPass210Class } from "./METRO/2.1.0/on_select/on_select_unlimitedpass/class";
import { MockInitMetroUnlimitedPass210Class } from "./METRO/2.1.0/init/init_unlimitedpass/class";
import { MockOnInitMetroUnlimitedPass210Class } from "./METRO/2.1.0/on_init/on_init_unlimitedpass/class";
import { MockConfirmMetroUnlimitedPass210Class } from "./METRO/2.1.0/confirm/confirm_unlimitedpass/class";
import { MockOnConfirmMetroUnlimitedPass210Class } from "./METRO/2.1.0/on_confirm/on_confirm_unlimitedpass/class";

// helpers
type Ctor<T> = new () => T;

const registry = {
  // BUS 2.1.0
  cancel_hard_BUS_210: MockCancelHardBus210Class,
  cancel_soft_BUS_210: MockCancelSoftBus210Class,
  cancel_tech_BUS_210: MockCancelTechBus210Class,
  confirm_BUS_210: MockConfirmBus210Class,
  confirm_BUS_Without_Update: MockConfirmVehConWithoutBus210Class,
  confirm_veh_con_BUS_210: MockConfirmVehConBus210Class,
  init_BUS_210: MockInitBus210Class,
  on_cancel_BUS_210: MockOnCancelBus210Class,
  on_cancel_hard_BUS_210: MockOnCancelHardBus210Class,
  on_cancel_init_BUS_210: MockOnCancelInitBus210Class,
  on_cancel_soft_BUS_210: MockOnCancelSoftBus210Class,
  on_confirm_BUS_210: MockOnConfirmBus210Class,
  on_confirm_BUS_Without_update: MockOnConfirmVehConWithoutUpdateBus210Class,
  on_confirm_delayed_BUS_210: MockOnConfirmDelayedBus210Class,
  on_confirm_veh_con_BUS_210: MockOnConfirmVehConBus210Class,
  on_confirm_BUS_QR_210: MockOnConfirmVehConBusQr210Class,
  cancel_tech_soft_BUS_210: MockCancelTechSoftBus210Class,
  on_cancel_tech_soft_BUS_210: MockOnCancelBusTech_Soft210Class,
  unsoliciated_on_status_complete_BUS_210: MockUnsoliciatedOnStatusOrderCompletedBus210Class,

  //________________INTRACITY_AGENT_ACTIVATION___________________
  select_BUS_Agent_Activation_210: MockSelectAgentActivationBus210Class,
  on_select_BUS_Agent_Activation_210: MockOnSelectAgentActivationBus210Class,
  init_BUS_Agent_Activation_210: MockInitAgentActivationBus210Class,
  on_init_BUS_Agent_Activation_210: MockOnInitAgentActivationBus210Class,
  confirm_BUS_Agent_Activation_210: MockConfirmAgentActivationBus210Class,
  on_confirm_BUS_Agent_Activation_210: MockOnConfirmAgentActivationBus210Class,

  //______________Intracity_AGENT_LOGIN___________________
  init_BUS_Agent_login_210: MockInitAgentLoginBus210Class,
  on_init_BUS_Agent_login_210: MockOnInitAgentLoginBus210Class,
  confirm_BUS_Agent_login_210: MockConfirmAgentLoginBus210Class,
  on_confirm_BUS_Agent_login_210: MockOnConfirmAgentLoginBus210Class,

  //________________Intacity_purchase_journey_agent_based__________________
  confirm_BUS_Agent_Purchase_210: MockConfirmAgentPurchaseBus210Class,
  on_confirm_BUS_Agent_Purchase_210: MockOnConfirmAgentPurchaseBus210Class,

  //________________Intacity_base_order_update_journey__________________
  update_BUS_Base_Order_Update_210: MockUpdateBaseOrderUpdateBus210Class,
  on_update_BUS_Base_Order_Update_210: MockOnUpdateBaseOrderUpdateBus210Class,

  //________________Intacity_unlimited_pass__________________
  select_BUS_Unlimited_Passes_210: MockSelectUnlimitedPassBus210Class,
  on_select_BUS_Unlimited_Passes_210: MockOnSelectBusUnlimitedPass210Class,
  init_BUS_Unlimited_Passes_210: MockInitUnlimitedPassBus210Class,
  on_init_BUS_Unlimited_Passes_210: MockOnInitUnlimitedPassBus210Class,
  confirm_BUS_Unlimited_Passes_210: MockConfirmUnlimitedPassBus210Class,
  on_confirm_BUS_Unlimited_Passes_210: MockOnConfirmUnlimitedPassBus210Class,

  // on_confirm_user_confirmation :MockOnConfirmUserConfirmationBusClass,
  on_init_BUS_210: MockOnInitBus210Class,
  on_search_BUS_210: MockOnSearch1Bus210Class,
  on_search_catalog1_BUS_210: MockOnSearchCatalog1Bus210Class,
  on_search_catalog2_BUS_210: MockOnSearchCatalog2Bus210Class,
  on_search_catalog3_BUS_210: MockOnSearchCatalog3Bus210Class,
  on_search_catalog4_BUS_210: MockOnSearchCatalog4Bus210Class,
  on_search_catalog5_BUS_210: MockOnSearchCatalog5Bus210Class,
  on_select_BUS_210: MockOnSelectBus210Class,
  on_select_unlimited_pass_BUS_210: MockOnSelectBusUnlimitedPass210Class,
  on_status_active_BUS_210: MockOnStatusActiveBus210Class,
  on_status_cancellation_BUS_210: MockOnStatusCancellationBus210Class,
  on_update_accepted_BUS_210: MockOnUpdateAcceptedBus210Class,
  on_update_veh_con_BUS_210: MockOnUpdateVehicleBus210Class,
  on_update_veh_QR_BUS_210: MockOnUpdateVehicleQrBus210Class,
  update_purchase_flow_BUS_210: MockUpdatePurchaseHourneyBus210Class,
  on_update_purchase_flow_BUS_210: MockOnUpdatePurchaseJourneyBus210Class,
  search0_BUS_210: MockSearch0Bus210Class,
  search_BUS_210: MockSearch1Bus210Class,
  select_BUS_210: MockSelectBus210Class,
  select_unlimited_pass_BUS_210: MockSelectUnlimitedPassBus210Class,
  status_BUS_210: MockStatusBus210Class,
  update_BUS_210: MockUpdateBus210Class,
  update_BUS_QR_210: MockUpdateQrBus210Class,
  on_search0_BUS_210: MockOnSearch0Bus210Class,
  
  // METRO 2.1.0
  search_MASTER_METRO_210: MockSearchMasterMetro210Class,
  on_search_MASTER_METRO_210: MockOnSearchMasterMetro210Class,
  cancel_METRO_210: MockCancelMetro210Class,
  cancel_hard_METRO_210: MockCancelHardMetro210Class,
  cancel_soft_METRO_210: MockCancelSoftMetro210Class,
  cancel_tech_METRO_210: MockCancelTechMetro210Class,
  confirm_METRO_210: MockConfirmMetro210Class,
  init_METRO_210: MockInitMetro210Class,
  on_cancel_METRO_210: OnCancelMetro210Class,
  on_cancel_hard_METRO_210: OnCancelHardMetro210Class,
  on_cancel_init_METRO_210: OnCancelInitMetro210Class,
  on_cancel_soft_METRO_210: OnCancelSoftMetro210Class,
  on_confirm_METRO_210: MockOnConfirmMetro210Class,
  on_confirm_delayed_METRO_210: MockOnConfirmDelayedMetro210Class,
  on_init_METRO_210: MockOnInitMetro210Class,
  on_search1_METRO_210: MockOnSearch1Metro210Class,
  on_search2_METRO_210: MockOnSearch2Metro210Class,
  on_select_METRO_210: MockOnSelectMetro210Class,
  on_status_active_METRO_210: MockOnStatusActiveMetro210Class,
  on_status_tech_METRO_210: MockOnStatusTechnicalMetro210Class,
  on_status_cancel_METRO_210: MockOnStatusCancelMetro210Class,
  on_status_complete_METRO_210: MockOnStatusCompleteMetro210Class,
  on_update_accepted_METRO_210: MockOnUpdateAcceptedMetro210Class,
  search1_METRO_210: MockSearch1Metro210Class,
  search2_METRO_210: MockSearch2Metro210Class,
  select_METRO_210: MockSelectMetro210Class,
  status_METRO_210: MockStatusMetro210Class,
  status_tech_cancel_METRO_210: MockStatusTechCancelMetro210Class,
  update_end_stop_1: MockUpdateEndStop1MetroClass,
  update_end_stop_2: MockUpdateEndStop2MetroClass,
  update_end_stop_3: MockUpdateEndStop3MetroClass,
  on_update_end_stop_1: MockOnUpdateEndStop1MetroClass,
  on_update_end_stop_2: MockOnUpdateEndStop2MetroClass,
  on_update_end_stop_3: MockOnUpdateEndStop3MetroClass,
  status_purchase_flow_BUS_210: MockStatusPurchaseFlowBus210Class,
  on_status_complete_BUS_210: MockOnStatusCompleteBus210Class,
  on_cancel_merchant_BUS_210: MockOnCancelMerchantBus210Class,
  on_cancel_soft_tech_METRO_210: OnCancelSoftTechnicalMetro210Class,
  on_cancel_hard_tech_METRO_210: OnCancelHardTechnicalMetro210Class,

  // ***************METRO_METRO_PURCHASE_AND_RECHARGE************
  on_search_Metro_purchase_210: MockOnSearchMetro_Purchase210Class,
  on_search_Metro_recharge_210: MockOnSearchMetroRecharge210Class,
  select_METRO_PURCHASE_210: MockSelectMetroPurchase210Class,
  select_METRO_RECHARGE_210: MockSelectMetroRecharge210Class,
  on_select_METRO_PURCHASE_210: MockOnSelectMetroPurchase210Class,
  on_select_METRO_RECHARGE_210: MockOnSelectMetroRecharge210Class,
  init_METRO_PURCHASE_210: MockInitMetroPurchase210Class,
  init_METRO_RECHARGE_210: MockInitMetroRecharge210Class,
  on_init_METRO_PURCHASE_210: MockOnInitMetroPurchase210Class,
  on_init_METRO_RECHARGE_210: MockOnInitMetroRecharge210Class,
  confirm_METRO_PURCHASE_210: MockConfirmMetroPurchase210Class,
  confirm_METRO_RECHARGE_210: MockConfirmMetroRecharge210Class,
  on_confirm_METRO_PURCHASE_210: MockOnConfirmMetroPurchase210Class,
  on_confirm_METRO_RECHARGE_210: MockOnConfirmMetroRecharge210Class,

  // ***************METRO_UNLIMITED_PASS************
  on_search_Metro_unlimitedpass_210: MockOnSearchMetro_UnlimitedPass210Class,
  select_METRO_UNLIMITEDPASS_210: MockSelectMetroUnlimitedPass210Class,
  on_select_METRO_UNLIMITEDPASS_210: MockOnSelectMetroUnlimitedPass210Class,
  init_METRO_UNLIMITEDPASS_210: MockInitMetroUnlimitedPass210Class,
  on_init_METRO_UNLIMITEDPASS_210: MockOnInitMetroUnlimitedPass210Class,
  confirm_METRO_UNLIMITEDPASS_210: MockConfirmMetroUnlimitedPass210Class,
  on_confirm_METRO_UNLIMITEDPASS_210: MockOnConfirmMetroUnlimitedPass210Class,

  // _____________________IGM BUS (2.1.0)____________________________
  issue_open: MockIssueOpenClass,
  issue_escalate: MockIssueEscalateClass,
  issue_open_2: MockIssueOpen2Class,

  on_issue_processing: MockOnIssueProcessingClass,
  on_issue_processing_1: MockOnIssueProcessing1Class,
  on_issue_processing_2: MockOnIssueProcessing2Class,

  on_issue_need_more_info: MockOnIssueNeedMoreInfoClass,

  issue_info_provided: MockIssueInfoProvidedClass,

  on_issue_provided: MockOnIssueProvidedClass,

  on_issue_resolution: MockOnIssueResolutionClass,
  on_issue_resolution_1: MockOnIssueResolution1Class,
  on_issue_resolution_2: MockOnIssueResolution2Class,
  on_issue_resolution_igm_3: MockOnIssueResolutionIGM3Class,

  issue_resolution_accept: MockIssueResolutionAcceptClass,
  issue_resolution_accept_igm_3: MockIssueResolutionAcceptIGM3Class,

  issue_resolution_reject: MockIssueResolutionRejectClass,

  on_issue_resolved: MockOnIssueResolvedClass,
  on_issue_resolved_igm_3: MockOnIssueResolvedIGM3Class,

  issue_close: MockIssueCloseClass,
  issue_close_igm_3: MockIssueCloseIGM3Class,


  // _____________________IGM METRO (2.1.0)____________________________
  issue_open_metro_210: MockIssueOpenMetro_210_Class,
  issue_escalate_metro_210: MockIssueEscalateMetro_210_Class,
  issue_open_2_metro_210: MockIssueOpen2Metro_210_Class,

  on_issue_processing_metro_210: MockOnIssueProcessingMetro_210_Class,
  on_issue_processing_1_metro_210: MockOnIssueProcessing1Metro_210_Class,
  on_issue_processing_2_metro_210: MockOnIssueProcessing2Metro_210_Class,

  on_issue_need_more_info_metro_210: MockOnIssueNeedMoreInfoMetro_210_Class,

  issue_info_provided_metro_210: MockIssueInfoProvidedMetro_210_Class,

  on_issue_provided_metro_210: MockOnIssueProvidedMetro_210_Class,

  on_issue_resolution_metro_210: MockOnIssueResolutionMetro_210_Class,
  on_issue_resolution_1_metro_210: MockOnIssueResolution1Metro_210_Class,
  on_issue_resolution_2_metro_210: MockOnIssueResolution2Metro_210_Class,
  on_issue_resolution_igm_3_metro_210: MockOnIssueResolutionIGM3Metro_210_Class,

  issue_resolution_accept_metro_210: MockIssueResolutionAcceptMetro_210_Class,
  issue_resolution_accept_igm_3_metro_210: MockIssueResolutionAcceptIGM3Metro_210_Class,

  issue_resolution_reject_metro_210: MockIssueResolutionRejectMetro_210_Class,

  on_issue_resolved_metro_210: MockOnIssueResolvedMetro_210_Class,
  on_issue_resolved_igm_3_metro_210: MockOnIssueResolvedIGM3Metro_210_Class,

  issue_close_metro_210: MockIssueCloseMetro_210_Class,
  issue_close_igm_3_metro_210: MockIssueCloseIGM3Metro_210_Class,
  on_search_monthly_pass_BUS_210: MockOnSearchMonthlyPassBus210Class,
  search_monthly_pass_BUS_210: MockSearchMonthlyPassBus210Class,
  on_search_monthly_pass1_BUS_210: MockOnSearchMonthlyPass1Bus210Class,
  on_confirm_monthly_pass_BUS_210: MockOnConfirmMonthlyPassesBus210Class,

        // _____________IGM_1.0.0 BUS______________
  issue_open_100:  MockIssueOpenBus_100_Class,
  issue_close_100: MockIssueCloseBus_100_Class,
  on_issue_processing_100: MockOnIssueProcessingBus_100_Class,
  on_issue_resolved_100: MockOnIssueResolvedBus_100_Class,

   // _____________IGM_1.0.0 METRO______________
  issue_open_metro_100:  MockIssueOpenMetro_100_Class,
  issue_close_metro_100: MockIssueCloseMetro_100_Class,
  on_issue_processing_metro_100: MockOnIssueProcessingMetro_100_Class,
  on_issue_resolved_metro_100: MockOnIssueResolvedMetro_100_Class
    
} as const satisfies Record<string, Ctor<MockAction>>;

type MockActionId = keyof typeof registry;

export function getMockAction(actionId: string): MockAction {
  const Ctor = registry[actionId as MockActionId];
  if (!Ctor) {
    throw new Error(`Action with ID ${actionId} not found`);
  }
  return new Ctor();
}

export function listMockActions(): MockActionId[] {
  return Object.keys(registry) as MockActionId[];
}
