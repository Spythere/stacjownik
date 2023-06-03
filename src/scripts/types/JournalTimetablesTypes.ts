import { JournalFilterType } from '../../scripts/enums/JournalFilterType';

export type JournalTimetableSearchKey =
  | 'search-driver'
  | 'search-train'
  | 'search-date'
  | 'search-dispatcher'
  | 'search-issuedFrom';

export type JournalTimetableSorterKey = 'timetableId' | 'beginDate' | 'distance' | 'total-stops';

export type JournalTimetableSearchType = {
  [key in JournalTimetableSearchKey]: string;
};

export interface JournalTimetableFilter {
  id: JournalFilterType;
  filterSection: string;
  isActive: boolean;
}

export interface JournalTimetableSorter {
  id: JournalTimetableSorterKey;
  dir: 'asc' | 'desc';
}
