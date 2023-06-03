import { JournalFilterSection, JournalFilterType } from '../enums/JournalFilterType';

export type JournalTimetableSearchKey =
  | 'search-driver'
  | 'search-train'
  | 'search-date'
  | 'search-dispatcher'
  | 'search-issuedFrom';

export type JournalTimetableSearchType = {
  [key in JournalTimetableSearchKey]: string;
};

export interface JournalTimetableFilter {
  id: JournalFilterType;
  filterSection: JournalFilterSection;
  isActive: boolean;
}

export interface JournalTimetableSorter {
  id: 'timetableId' | 'beginDate' | 'routeDistance' | 'allStopsCount';
  dir: 'asc' | 'desc';
}
