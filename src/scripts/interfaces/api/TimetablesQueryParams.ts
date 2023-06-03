import { JournalTimetableSorter } from '../../../types/Journal/JournalTimetablesTypes';

export interface TimetablesQueryParams {
  driverName?: string;
  trainNo?: string;
  authorName?: string;
  timestampFrom?: number;
  timestampTo?: number;
  issuedFrom?: string;

  countFrom?: number;
  countLimit?: number;

  fulfilled?: number;
  terminated?: number;

  sortBy?: JournalTimetableSorter['id'];
}
