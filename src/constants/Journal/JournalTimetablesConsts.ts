import { JournalFilterSection, JournalFilterType } from '../../scripts/enums/JournalFilterType';
import { JournalFilter } from '../../scripts/types/JournalTimetablesTypes';

export const journalTimetableFilters: JournalFilter[] = [
  {
    id: JournalFilterType.ALL,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: true
  },

  {
    id: JournalFilterType.ACTIVE,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false
  },

  {
    id: JournalFilterType.FULFILLED,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false
  },

  {
    id: JournalFilterType.ABANDONED,
    filterSection: JournalFilterSection.TIMETABLE_STATUS,
    isActive: false
  },

  {
    id: JournalFilterType.TWR_SKR,
    filterSection: JournalFilterSection.TWRSKR,
    isActive: true
  },

  {
    id: JournalFilterType.TWR,
    filterSection: JournalFilterSection.TWRSKR,
    isActive: false
  },

  {
    id: JournalFilterType.SKR,
    filterSection: JournalFilterSection.TWRSKR,
    isActive: false
  }
];
