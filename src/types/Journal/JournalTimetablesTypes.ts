import { JournalFilterType } from '../../scripts/enums/JournalFilterType';

export type JorunalTimetableSearchType = {
  [key in 'search-driver' | 'search-train' | 'search-date' | 'search-author']: string;
};

export interface JournalTimetableFilter {
  id: JournalFilterType;
  filterSection: string;
  isActive: boolean;
}

export interface JournalTimetableSorter {
  id: 'timetableId' | 'beginDate' | 'distance' | 'total-stops';
  dir: -1 | 1;
}
