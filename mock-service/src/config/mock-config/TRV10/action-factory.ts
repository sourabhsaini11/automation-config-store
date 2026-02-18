import { MockAction } from "./classes/mock-action";

// search
import {
  MockSearchFemaleRideClass,
  MockSearchMultipleStopsClass,
} from "./2.0.1/search/class_multiple_stops";
import { MockSearchClass } from "./2.0.1/search/class";
import { MockSearchRentalClass } from "./2.0.1/search/class_rental";
import { MockSearchRentalEndClass } from "./2.0.1/search/class_rental_end";
import { MockSearchScheduleRentalClass } from "./2.0.1/search/class_schedule_rental";
import { MockSearchScheduleTripClass } from "./2.0.1/search/class_schedule_trip";

// on_search
import {
  MockOnSearchFemaleRideClass,
  MockOnSearchMultipleStopsClass,
  MockOnSearchMultipleStopsClass2,
  MockOnSearchMultipleStopsClass3,
} from "./2.0.1/on_search/class_multiple_stops";
import { MockOnSearchClass } from "./2.0.1/on_search/class";
import { MockOnSearchRentalClass } from "./2.0.1/on_search/class_rental";
import { MockOnSearchScheduleRentalClass } from "./2.0.1/on_search/class_schedule_rental";

// select
import {
  MockSelectMultipleStopsGenerator,
  MockSelectMultipleStopsGenerator2,
} from "./2.0.1/select/class";
import { MockSelectRentalClass } from "./2.0.1/select/class_rental";
import { MockSelectPreOrderBidClass } from "./2.0.1/select/class_preorder_bid";

// on_select
import { MockOnSelectMultipleStopsClass } from "./2.0.1/on_select/class_multiple_stops";
import { MockOnSelectClass } from "./2.0.1/on_select/class";
import { MockOnSelectRentalClass } from "./2.0.1/on_select/class_rental";
import { MockOnSelectPreOrderClass } from "./2.0.1/on_select/class_preorder";

// init
import { MockInitMultipleStopsGenerator } from "./2.0.1/init/class_multiple_stops";
import { MockInitClass } from "./2.0.1/init/class";

// on_init
import { MockOnInitMultipleStopsClass } from "./2.0.1/on_init/class_multiple_stops";
import { MockOnInitClass, MockOnInitPrupleClass } from "./2.0.1/on_init/class";

// confirm
import { MockConfirmMultipleStopsClass } from "./2.0.1/confirm/class_multiple_stops";
import { MockConfirmClass } from "./2.0.1/confirm/class";

// on_confirm
import { MockOnConfirmDriverAssignedMultipleStopsClass } from "./2.0.1/on_confirm/on_confirm_driver_assigned/class_multiple_stops";
import { MockOnConfirmClass } from "./2.0.1/on_confirm/class";
import { MockOnConfirmRentalClass } from "./2.0.1/on_confirm/class_rental";
import { MockOnConfirmDriverNotFoundClass } from "./2.0.1/on_confirm/on_confirm_driver_not_found/class";
import { MockOnConfirmDriverNotAssignedClass } from "./2.0.1/on_confirm/on_confirm_driver_not_assigned/class";

// status
import { MockStatusClass, MockStatusClass2 } from "./2.0.1/status/class";

// on_status
import { MockOnStatusRideEnrouteGenerator } from "./2.0.1/on_status/class";
import { MockOnStatusRidePaidGenerator } from "./2.0.1/on_status/class_ride_paid";
import {
  MockOnStatusRideArrivedGenerator,
  MockOnStatusRideArrivedGenerator2,
} from "./2.0.1/on_status/class_ride_arrived";
import {
  MockOnStatusRideStartedGenerator,
  MockOnStatusRideStartedGenerator2,
} from "./2.0.1/on_status/class_ride_started";

// track
import { MockTrackMultipleStopsGenerator } from "./2.0.1/track/class_multiple_stops";
import { MockTrackClass, MockTrackClass2 } from "./2.0.1/track/class";

// on_track
import {
  MockOnTrackMultipleStopsGenerator,
  MockOnTrackMultipleStopsGenerator2,
} from "./2.0.1/on_track/class";

// update
import { MockUpdateSoftClass } from "./2.0.1/update_/class";
import { MockUpdateHardClass } from "./2.0.1/update_/class_hard";
import { MockUpdateQuoteClass } from "./2.0.1/update_/class_quote";

// on_update
import { MockOnUpdateRideEndedClass } from "./2.0.1/on_update/class_ride_ended";
import { MockOnUpdateRideSoftUpdateClass } from "./2.0.1/on_update/class_ride_soft_update";
import { MockOnUpdateRideUpdatedClass } from "./2.0.1/on_update/class_ride_updated";
import { MockOnUpdateQuoteClass } from "./2.0.1/on_update/class_update_quote";
import { MockOnUpdateClass } from "./2.0.1/on_update/class";
import { MockOnUpdateRideAssignedClass } from "./2.0.1/on_update/class_ride_assigned";

// cancel
import { MockMultipleStopSoftCancelClass } from "./2.0.1/cancel/class";
import { MockCancelHardClass } from "./2.0.1/cancel/class_hard";

// on_cancel
import {
  MockOnCancelSoftClass,
  MockOnCancelSoftClass2,
} from "./2.0.1/on_cancel/on_cancel_soft/class";
import { MockOnCancelAsyncClass } from "./2.0.1/on_cancel/on_cancel_async/class";
import { MockOnCancelHardClass } from "./2.0.1/on_cancel/on_cancel_hard/class";
import { MockOnCancelRiderNotFoundClass } from "./2.0.1/on_cancel/on_cancel_rider_not_found/class";

// IGM 1.0.0
import { MockIssueOpenTRV10_201_100_Class } from "./2.0.1/issue/issue_100/issue_open/class";
import { MockIssueCloseTRV10_201_100_Class } from "./2.0.1/issue/issue_100/issue_close/class";
import { MockOnIssueProcessingTRV10_201_100_Class } from "./2.0.1/on_issue/on_issue_100/on_issue_processing/class";
import { MockOnIssueResolvedTRV10_201_100_Class } from "./2.0.1/on_issue/on_issue_100/on_issue_resolved/class";
import { MockDelayOnConfirmClass } from "./2.0.1/on_confirm/delay-on-confirm";
import { MockOnStatusRideAssignedClass } from "./2.0.1/on_status/class_ride_assigned";

type Ctor<T> = new () => T;

const registry = {
  // core flows
  search: MockSearchMultipleStopsClass,
  on_search: MockOnSearchMultipleStopsClass,
  select: MockSelectMultipleStopsGenerator2,
  on_select: MockOnSelectMultipleStopsClass,
  init: MockInitMultipleStopsGenerator,
  on_init: MockOnInitMultipleStopsClass,
  confirm: MockConfirmMultipleStopsClass,
  on_confirm: MockOnConfirmDriverAssignedMultipleStopsClass,
  status: MockStatusClass2,
  update: MockUpdateSoftClass,
  cancel: MockMultipleStopSoftCancelClass,
  on_cancel: MockOnCancelSoftClass2,

  // status variants
  on_status_ride_assigned: MockOnStatusRideAssignedClass,
  on_status_unsolicited: MockOnStatusRideEnrouteGenerator,
  on_status_solicited: MockOnStatusRidePaidGenerator,
  on_status_ride_arrived: MockOnStatusRideArrivedGenerator,
  on_status_ride_arrived_2: MockOnStatusRideArrivedGenerator2,
  on_status_ride_started: MockOnStatusRideStartedGenerator2,
  on_status_ride: MockOnStatusRideStartedGenerator,

  // Female Driver
  search_ride_female: MockSearchFemaleRideClass,
  on_search_female: MockOnSearchFemaleRideClass,

  // track
  track: MockTrackMultipleStopsGenerator,
  on_track: MockOnTrackMultipleStopsGenerator2,

  // update variants
  on_update: MockOnUpdateRideEndedClass,
  on_update_soft_update: MockOnUpdateRideSoftUpdateClass,
  update_hard: MockUpdateHardClass,
  on_update_ride_updated: MockOnUpdateRideUpdatedClass,
  update_quote: MockUpdateQuoteClass,
  on_update_quote: MockOnUpdateQuoteClass,
  on_update_ride: MockOnUpdateClass,
  on_update_ride_assigned: MockOnUpdateRideAssignedClass,

  // rental
  search_rental: MockSearchRentalClass,
  on_search_rental: MockOnSearchRentalClass,
  search_rental_end: MockSearchRentalEndClass,
  on_search_rental_end: MockOnSearchMultipleStopsClass2,
  select_rental: MockSelectRentalClass,
  on_select_rental: MockOnSelectRentalClass,
  on_confirm_rental: MockOnConfirmRentalClass,

  // ride-specific
  search_ride: MockSearchClass,
  on_search_ride: MockOnSearchClass,
  select_ride: MockSelectMultipleStopsGenerator,
  on_select_ride: MockOnSelectClass,
  init_ride: MockInitClass,
  on_init_driver_pruple: MockOnInitPrupleClass,
  on_init_ride: MockOnInitClass,
  confirm_ride: MockConfirmClass,
  on_confirm_ride: MockOnConfirmClass,
  on_confirm_ride_delay: MockDelayOnConfirmClass,
  track_ride: MockTrackClass2,
  on_track_ride: MockOnTrackMultipleStopsGenerator,
  status_ride: MockStatusClass,

  // cancel variants
  cancel_hard: MockCancelHardClass,
  on_cancel_ride_cancel: MockOnCancelSoftClass,
  on_cancel_async: MockOnCancelAsyncClass,
  on_cancel_hard: MockOnCancelHardClass,
  on_cancel_rider_not_found: MockOnCancelRiderNotFoundClass,

  // special flows
  select_preorder_bid: MockSelectPreOrderBidClass,
  on_select_preorder: MockOnSelectPreOrderClass,
  search_schedule_rental: MockSearchScheduleRentalClass,
  on_search_schedule_rental: MockOnSearchScheduleRentalClass,
  search_schedule_trip: MockSearchScheduleTripClass,
  on_search_schedule_trip: MockOnSearchMultipleStopsClass3,

  // driver edge cases
  on_confirm_driver_not_found: MockOnConfirmDriverNotFoundClass,
  on_confirm_driver_not_assigned: MockOnConfirmDriverNotAssignedClass,
  track_ride_update: MockTrackClass,

  // _____________IGM_1.0.0 METRO______________
  issue_open_100: MockIssueOpenTRV10_201_100_Class,
  issue_close_100: MockIssueCloseTRV10_201_100_Class,
  on_issue_processing_100: MockOnIssueProcessingTRV10_201_100_Class,
  on_issue_resolved_100: MockOnIssueResolvedTRV10_201_100_Class,
} as const;

type MockActionId = keyof typeof registry;

// Construct by id
export function getMockAction(actionId: string): MockAction {
  const Ctor = registry[actionId as MockActionId];
  if (!Ctor) {
    throw new Error(`Action with ID ${actionId as string} not found`);
  }
  return new Ctor() as MockAction;
}

// List all possible ids — stays in sync automatically
export function listMockActions(): MockActionId[] {
  return Object.keys(registry) as MockActionId[];
}
