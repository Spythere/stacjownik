import { JournalFilterType } from '../../scripts/enums/JournalFilterType';

export type JournalTimetableSearchKey = 'search-driver' | 'search-train' | 'search-date' | 'search-dispatcher'; 

export type JournalTimetableSearchType = {
  [key in JournalTimetableSearchKey]: string;
};

export interface JournalTimetableFilter {
  id: JournalFilterType;
  filterSection: string;
  isActive: boolean;
}

export interface JournalTimetableSorter {
  id:  'beginDate' | 'distance' | 'total-stops';
  dir: -1 | 1;
}
