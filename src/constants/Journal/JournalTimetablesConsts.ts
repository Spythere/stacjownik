import { JournalFilterType } from '../../scripts/enums/JournalFilterType';
import { JournalTimetableFilter } from '../../scripts/types/JournalTimetablesTypes';

export const journalTimetableFilters: JournalTimetableFilter[] = [
  {
    id: JournalFilterType.ALL,
    filterSection: 'timetable-status',
    isActive: true,
  },

  {
    id: JournalFilterType.ACTIVE,
    filterSection: 'timetable-status',
    isActive: false,
  },

  {
    id: JournalFilterType.FULFILLED,
    filterSection: 'timetable-status',
    isActive: false,
  },

  {
    id: JournalFilterType.ABANDONED,
    filterSection: 'timetable-status',
    isActive: false,
  },
];
