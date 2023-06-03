import { JournalFilterSection, JournalFilterType } from '../../scripts/enums/JournalFilterType';
import { JournalTimetableFilter } from '../../types/Journal/JournalTimetablesTypes';

export const journalTimetableFilters: JournalTimetableFilter[] = [
  {
    id: JournalFilterType.ALL,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: true,
  },

  {
    id: JournalFilterType.ACTIVE,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false,
  },

  {
    id: JournalFilterType.FULFILLED,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false,
  },

  {
    id: JournalFilterType.ABANDONED,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false,
  },
];
