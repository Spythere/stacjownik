export namespace Journal {
  export type DispatcherSearchKey =
    | 'search-dispatcher'
    | 'search-station'
    | 'search-date-from'
    | 'search-date-to';

  export type TimetableSearchKey =
    | 'search-driver'
    | 'search-train'
    | 'search-date-from'
    | 'search-dispatcher'
    | 'search-issuedFrom'
    | 'search-terminatingAt'
    | 'search-via'
    | 'select-categoryCode';

  export type TimetableSearchType = {
    [key in TimetableSearchKey]: string;
  };

  export type DispatcherSearchType = {
    [key in DispatcherSearchKey]: string;
  };

  export type TimetableSorterKey = 'timetableId' | 'beginDate' | 'distance' | 'total-stops';
  export type DispatcherSorterKey = 'timestampFrom' | 'currentDuration';

  export interface DispatcherSorter {
    id: DispatcherSorterKey;
    dir: -1 | 1;
  }

  export interface TimetableSorter {
    id: TimetableSorterKey;
    dir: 'asc' | 'desc';
  }

  export const enum TimetableFilterId {
    ALL_STATUSES = 'all-statuses',
    ACTIVE = 'active',
    FULFILLED = 'fulfilled',
    ABANDONED = 'abandoned',
    ALL_SPECIALS = 'all-specials',
    TWR = 'twr',
    SKR = 'skr',
    PN = 'pn',
    TN = 'tn',
    TWR_SKR = 'twr-skr'
  }

  export enum FilterSection {
    TIMETABLE_STATUS = 'timetable-status',
    SPECIAL = 'special'
  }

  export interface TimetableFilter {
    id: TimetableFilterId;
    filterSection: string;
    isActive: boolean;
    default: boolean;
  }

  export enum StatsTab {
    DRIVER_STATS = 'journal-driver-stats',
    DISPATCHER_STATS = 'journal-dispatcher-stats',
    DAILY_STATS = 'journal-daily-stats'
  }

  export interface StatsButton {
    tab: StatsTab;
    localeKey: string;
    iconName: string;
    disabled: boolean;
  }

  export interface TimetableStopDetails {
    stopName: string;
    arrivalTimestamp: number;
    scheduledArrivalTimestamp: number;
    departureTimestamp: number;
    scheduledDepartureTimestamp: number;
    stopTime: number;
    stopType: string;
    isConfirmed: boolean;
  }
}
