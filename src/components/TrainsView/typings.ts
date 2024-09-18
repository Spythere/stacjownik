import { StationRoutesInfo } from "../../typings/common";

export enum TrainFilterSection {
  TRAIN_TYPE = 'TRAIN_TYPE',
  TIMETABLE_TYPE = 'TIMETABLE_TYPE',
  COMMENTS = 'COMMENTS',
  TIMETABLE = 'TIMETABLE'
}

export const enum TrainFilterId {
  noComments = 'noComments',
  withComments = 'withComments',

  twr = 'twr',
  skr = 'skr',
  common = 'common',

  passenger = 'passenger',
  freight = 'freight',
  other = 'other',
  noTimetable = 'noTimetable',
  withTimetable = 'withTimetable'
}

export interface TrainFilter {
  id: TrainFilterId;
  section: TrainFilterSection;
  isActive: boolean;
}

export interface TrainSorter {
  id: string;
  value: string;
}

export const trainFilters: TrainFilter[] = [
  {
    id: TrainFilterId.twr,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true
  },
  {
    id: TrainFilterId.skr,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true
  },
  {
    id: TrainFilterId.common,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true
  },

  {
    id: TrainFilterId.passenger,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true
  },
  {
    id: TrainFilterId.freight,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true
  },
  {
    id: TrainFilterId.other,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true
  },

  {
    id: TrainFilterId.withComments,
    section: TrainFilterSection.COMMENTS,
    isActive: true
  },
  {
    id: TrainFilterId.noComments,
    section: TrainFilterSection.COMMENTS,
    isActive: true
  },

  {
    id: TrainFilterId.withTimetable,
    section: TrainFilterSection.TIMETABLE,
    isActive: true
  },
  {
    id: TrainFilterId.noTimetable,
    section: TrainFilterSection.TIMETABLE,
    isActive: true
  }
];

export const sorterOptions: TrainSorter[] = [
  {
    id: 'distance',
    value: 'kilometraż'
  },
  {
    id: 'id',
    value: 'id rozkładu'
  },
  {
    id: 'progress',
    value: 'przebyta trasa'
  },
  {
    id: 'delay',
    value: 'opóźnienie'
  },
  {
    id: 'mass',
    value: 'masa'
  },
  {
    id: 'speed',
    value: 'prędkość'
  },
  {
    id: 'length',
    value: 'długość'
  }
];

export interface TrainScheduleStop {
  nameHtml: string;
  nameRaw: string;

  status: 'confirmed' | 'unconfirmed' | 'stopped';
  type: string;
  position: 'begin' | 'end' | 'en-route';

  arrivalScheduled: number;
  arrivalReal: number;

  departureScheduled: number;
  departureReal: number;

  departureDelay: number;
  arrivalDelay: number;

  duration: number | null;

  isActive: boolean;
  isLastConfirmed: boolean;
  isSBL: boolean;

  sceneryName: string | null;
  distance: number;

  arrivalLine: string | null;
  departureLine: string | null;

  arrivalLineInfo?: StationRoutesInfo;
  departureLineInfo?: StationRoutesInfo;

  isExternal: boolean;

  comments: string | null;
}