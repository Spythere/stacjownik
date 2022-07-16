import { JournalFilter } from "vue";
import { JournalFilterType } from "../scripts/enums/JournalFilterType";

export const journalTimetableFilters: JournalFilter[] = [
    {
        id: JournalFilterType.all,
        filterSection: "timetable-status",
        isActive: true
    },

    {
        id: JournalFilterType.active,
        filterSection: "timetable-status",
        isActive: false
    },

    {
        id: JournalFilterType.fulfilled,
        filterSection: "timetable-status",
        isActive: false
    },

    {
        id: JournalFilterType.abandoned,
        filterSection: "timetable-status",
        isActive: false
    },
]

export const journalDispatcherFilters: JournalFilter[] = []