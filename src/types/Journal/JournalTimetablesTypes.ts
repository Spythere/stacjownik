import { JournalFilterType } from '../../scripts/enums/JournalFilterType';

export type JournalTimetableSearcher = {
  [key in 'search-driver' | 'search-train' | 'search-date']: string;
};

export interface JournalFilter {
  id: JournalFilterType;
  filterSection: string;
  isActive: boolean;
}