export namespace Journal {
  export type DispatcherSearcher = {
    [key in 'search-dispatcher' | 'search-station' | 'search-date']: string;
  };

  export interface DispatcherSorter {
    id: 'timestampFrom' | 'duration';
    dir: -1 | 1;
  }

  export type TimetableSearchKey =
    | 'search-driver'
    | 'search-train'
    | 'search-date'
    | 'search-dispatcher'
    | 'search-issuedFrom';

  export type TimetableSearchType = {
    [key in TimetableSearchKey]: string;
  };

  export const enum TimetableFilterId {
    ACTIVE = 'active',
    FULFILLED = 'fulfilled',
    ABANDONED = 'abandoned',
    ALL = 'all',
    TWR = 'twr',
    SKR = 'skr',
    TWR_SKR = 'twr-skr'
  }

  export enum FilterSection {
    TIMETABLE_STATUS = 'timetable-status',
    TWRSKR = 'twrskr'
  }

  export interface TimetableFilter {
    id: TimetableFilterId;
    filterSection: string;
    isActive: boolean;
  }

  export type TimetableSorterKey = 'timetableId' | 'beginDate' | 'distance' | 'total-stops';

  export interface TimetableSorter {
    id: TimetableSorterKey;
    dir: 'asc' | 'desc';
  }
}
