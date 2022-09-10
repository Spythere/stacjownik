import { JournalFilterType } from '../../scripts/enums/JournalFilterType';

export type JorunalTimetableSearchType = {
  [key in 'search-driver' | 'search-train' | 'search-date']: string;
};

export interface JournalFilter {
  id: JournalFilterType;
  filterSection: string;
  isActive: boolean;
}

export interface JournalSorter {
  id: 'timetableId' | 'beginDate' | 'distance' | 'total-stops';
  dir: -1 | 1;
}
