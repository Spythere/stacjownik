import { JournalFilterType } from "../../scripts/enums/JournalFilterType";
import { JournalFilter } from "../../types/Journal/JournalTimetablesTypes";

export const journalTimetableFilters: JournalFilter[] = [
  {
    id: JournalFilterType.all,
    filterSection: 'timetable-status',
    isActive: true,
  },

  {
    id: JournalFilterType.active,
    filterSection: 'timetable-status',
    isActive: false,
  },

  {
    id: JournalFilterType.fulfilled,
    filterSection: 'timetable-status',
    isActive: false,
  },

  {
    id: JournalFilterType.abandoned,
    filterSection: 'timetable-status',
    isActive: false,
  },
];
