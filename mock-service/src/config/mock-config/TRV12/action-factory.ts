import { MockSelect1Airline200 } from "./Airline/2.0.0/select/select_1/class";
import { MockInitAirline200 } from "./Airline/2.0.0/init/class";
import { MockOnInitAirline200 } from "./Airline/2.0.0/on_init/class";
import { MockConfirmAirline200 } from "./Airline/2.0.0/confirm/class";
import { MockOnConfirmAirline200, MockOnStatusUnsoliciatedAirline200 } from "./Airline/2.0.0/on_confirm/class";
import { MockCancelAirline200 } from "./Airline/2.0.0/cancel/class";
import { MockSoftCancelAirline } from "./Airline/2.0.0/cancel/cancel_soft_user_cancellation/class";
import { MockOnCancelAirline200 } from "./Airline/2.0.0/on_cancel/class";
import { MockSoftOnCancelAirline } from "./Airline/2.0.0/on_cancel/on_cancel_soft_user_cancellation/class";
import { MockSellerOnCancelAirline } from "./Airline/2.0.0/on_cancel/on_cancel_confirm_seller_cancellation/class";
import { search1Airline200 } from "./Airline/2.0.0/search/search_1/class";
import { MockOnSearch1Airline200 } from "./Airline/2.0.0/on_search/on_search_1/class";
import { MockOnSearch2Airline200 } from "./Airline/2.0.0/on_search/on_search_2/class";
import { MockOnSearch3Airline200 } from "./Airline/2.0.0/on_search/on_search_3/class";
import { MockOnSearch4Airline200 } from "./Airline/2.0.0/on_search/on_search_4/class";
import { MockSelect2Airline200 } from "./Airline/2.0.0/select/select_2/class";

import type { MockAction } from "./classes/mock-action";
import { MockOnSelect1Airline200 } from "./Airline/2.0.0/on_select/on_select_1/class";
import { MockOnSelect2Airline200 } from "./Airline/2.0.0/on_select/on_select_2/class";

//  -----------------------------Intercity-----------------------------
import { MockCancelCancelFlow1Class } from "./Intercity/2.0.0/cancel/cancel_cancel_flow_1/class";
import { MockCancelCancelFlow2Class } from "./Intercity/2.0.0/cancel/cancel_cancel_flow_2/class";
import { MockConfirmStationCodeClass } from "./Intercity/2.0.0/confirm/confirm_station_code/class";
import { MockConfirmSellerCancellationClass } from "./Intercity/2.0.0/confirm/confirm_seller_cancellation/class";
import { MockInitErrorResponseClass } from "./Intercity/2.0.0/init/init_error_response/class";
import { MockInitStationCodeClass } from "./Intercity/2.0.0/init/init_station_code/class";
import { MockOnCancelCancelFlow1Class } from "./Intercity/2.0.0/on_cancel/on_cancel_cancel_flow_1/class";
import { MockOnCancelCancelFlow2Class } from "./Intercity/2.0.0/on_cancel/on_cancel_cancel_flow_2/class";
import { MockOnCancelSellerCancellationClass } from "./Intercity/2.0.0/on_cancel/on_cancel_seller_cancellation/class";
import { MockOnConfirmCancelFlowClass } from "./Intercity/2.0.0/on_confirm/on_confirm_cancel_flow/class";
import { MockOnConfirmPartialCancellationClass } from "./Intercity/2.0.0/on_confirm/on_confirm_partial_cancellation/class";
import { MockOnConfirmRatingErrorClass } from "./Intercity/2.0.0/on_confirm/on_confirm_rating_error/class";
import { MockOnConfirmRatingSuccessClass } from "./Intercity/2.0.0/on_confirm/on_confirm_rating_success/class";
import { MockOnConfirmSellerCancellationClass } from "./Intercity/2.0.0/on_confirm/on_confirm_seller_cancellation/class";
import { MockOnConfirmStationCodeClass } from "./Intercity/2.0.0/on_confirm/on_confirm_station_code/class";
import { MockOnInitErrorResponseClass } from "./Intercity/2.0.0/on_init/on_init_error_response/class";
import { MockOnInitStationCodeClass } from "./Intercity/2.0.0/on_init/on_init_station_code/class";
import { MockOnRatingErrorClass } from "./Intercity/2.0.0/on_rating/on_rating_error/class";
import { MockOnSearchStationCode1Class } from "./Intercity/2.0.0/on_search/on_search_station_code_1/class";
import { MockOnSearchStationCode2Class } from "./Intercity/2.0.0/on_search/on_search_station_code_2/class";
import { MockOnSearchStationCode3Class } from "./Intercity/2.0.0/on_search/on_search_station_code_3/class";
import { MockOnSelectErrorResponseClass } from "./Intercity/2.0.0/on_select/on_select_error_response/class";
import { MockOnSelectStationCode1Class } from "./Intercity/2.0.0/on_select/on_select_station_code_1/class";
import { MockOnSelectStationCode2Class } from "./Intercity/2.0.0/on_select/on_select_station_code_2/class";
import { MockOnStatusRatingErrorClass } from "./Intercity/2.0.0/on_status/on_status_rating_error/class";
import { MockOnStatusRatingSuccessClass } from "./Intercity/2.0.0/on_status/on_status_rating_success/class";
import { MockOnStatusStationCode1Class } from "./Intercity/2.0.0/on_status/on_status_station_code_1/class";
import { MockOnStatusStationCode2Class } from "./Intercity/2.0.0/on_status/on_status_station_code_2/class";
import { MockOnUpdatePartialCancellation1Class } from "./Intercity/2.0.0/on_update/on_update_partial_cancellation_flow_1/class";
import { MockOnUpdatePartialCancellation2Class } from "./Intercity/2.0.0/on_update/on_update_partial_cancellation_flow_2/class";
import { MockRatingErrorClass } from "./Intercity/2.0.0/rating/rating_error/class";
import { MockRatingSuccessClass } from "./Intercity/2.0.0/rating/rating_success/class";
import { MockSearchStationCode1Class } from "./Intercity/2.0.0/search/search_station_code_1/class";
import { MockSearchStationCode2Class } from "./Intercity/2.0.0/search/search_station_code_2/class";
import { MockSearchStationCode3Class } from "./Intercity/2.0.0/search/search_station_code_3/class";
import { MockSelectErrorResponseClass } from "./Intercity/2.0.0/select/select_error_response/class";
import { MockSelectStationCode1Class } from "./Intercity/2.0.0/select/select_station_code_1/class";
import { MockSelectStationCode2Class } from "./Intercity/2.0.0/select/select_station_code_2/class";
import { MockStatusStationCodeClass } from "./Intercity/2.0.0/status/status_station_code/class";
import { MockUpdatePartialCancellation1Class } from "./Intercity/2.0.0/update/update_partial_cancellation_flow_1/class";
import { MockUpdatePartialCancellation2Class } from "./Intercity/2.0.0/update/update_partial_cancellation_flow_2/class";

type Ctor<T> = new () => T;
const registry = {
  //--------------------Airline--------------------
  search_1_Airline_200: search1Airline200,
  on_search_1_Airline_200: MockOnSearch1Airline200,
  on_search_2_Airline_200: MockOnSearch2Airline200,
  on_search_3_Airline_200: MockOnSearch3Airline200,
  on_search_4_Airline_200: MockOnSearch4Airline200,

  select_1_Airline_200: MockSelect1Airline200,
  on_select_1_Airline_200: MockOnSelect1Airline200,
  select_2_Airline_200: MockSelect2Airline200,
  on_select_2_Airline_200: MockOnSelect2Airline200,

  init_Airline_200: MockInitAirline200,
  on_init_Airline_200: MockOnInitAirline200,

  confirm_Airline_200: MockConfirmAirline200,
  on_confirm_Airline_200: MockOnConfirmAirline200,
  on_status_unsoliciated_Airline_200: MockOnStatusUnsoliciatedAirline200,
  
  cancel_Airline_201: MockSoftCancelAirline,
  on_cancel_Airline_201: MockSoftOnCancelAirline,

  cancel_Airline_200: MockCancelAirline200,
  on_cancel_Airline_200: MockOnCancelAirline200,
  on_cancel_Airline_203: MockSellerOnCancelAirline,

  //--------------------Intercity (BUS)--------------------
  
  search_BUS_201: MockSearchStationCode1Class,
  search_BUS_202: MockSearchStationCode2Class,
  search_BUS_203: MockSearchStationCode3Class,

  on_search_BUS_201: MockOnSearchStationCode1Class,
  on_search_BUS_202: MockOnSearchStationCode2Class,
  on_search_BUS_203: MockOnSearchStationCode3Class,

  select_BUS_201: MockSelectStationCode1Class,
  select_BUS_202: MockSelectStationCode2Class,
  select_BUS_221: MockSelectErrorResponseClass,

  on_select_BUS_201: MockOnSelectStationCode1Class,
  on_select_BUS_202: MockOnSelectStationCode2Class,
  on_select_BUS_221: MockOnSelectErrorResponseClass,

  init_BUS_201: MockInitStationCodeClass,
  init_BUS_221: MockInitErrorResponseClass,

  on_init_BUS_201: MockOnInitStationCodeClass,
  on_init_BUS_221: MockOnInitErrorResponseClass,

  confirm_BUS_201: MockConfirmStationCodeClass,
  confirm_BUS_241: MockConfirmSellerCancellationClass,

  on_confirm_BUS_201: MockOnConfirmStationCodeClass,
  on_confirm_BUS_211: MockOnConfirmCancelFlowClass,
  on_confirm_BUS_231: MockOnConfirmPartialCancellationClass,
  on_confirm_BUS_241: MockOnConfirmSellerCancellationClass,
  on_confirm_BUS_251: MockOnConfirmRatingSuccessClass,
  on_confirm_BUS_261: MockOnConfirmRatingErrorClass,

  cancel_BUS_211: MockCancelCancelFlow1Class,
  cancel_BUS_212: MockCancelCancelFlow2Class,

  on_cancel_BUS_211: MockOnCancelCancelFlow1Class,
  on_cancel_BUS_212: MockOnCancelCancelFlow2Class,
  on_cancel_BUS_241: MockOnCancelSellerCancellationClass,

  status_BUS_201: MockStatusStationCodeClass,
  on_status_BUS_201: MockOnStatusStationCode1Class,
  on_status_unsolicited_201: MockOnStatusStationCode2Class,
  on_status_BUS_251: MockOnStatusRatingSuccessClass,
  on_status_BUS_261: MockOnStatusRatingErrorClass,

  update_BUS_231: MockUpdatePartialCancellation1Class,
  update_BUS_232: MockUpdatePartialCancellation2Class,

  on_update_BUS_231: MockOnUpdatePartialCancellation1Class,
  on_update_BUS_232: MockOnUpdatePartialCancellation2Class,

  rating_251: MockRatingSuccessClass,
  rating_261: MockRatingErrorClass,
  on_rating_261: MockOnRatingErrorClass,
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
