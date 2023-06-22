import { JournalTimetableSorter } from '../../types/JournalTimetablesTypes';

export interface TimetablesQueryParams {
  driverName?: string;
  trainNo?: string;
  timetableId?: string;

  authorName?: string;
  timestampFrom?: number;
  timestampTo?: number;
  issuedFrom?: string;

  countFrom?: number;
  countLimit?: number;

  fulfilled?: number;
  terminated?: number;

  twr?: number;
  skr?: number;

  sortBy?: JournalTimetableSorter['id'];
}
