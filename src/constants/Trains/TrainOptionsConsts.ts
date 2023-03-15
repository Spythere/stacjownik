import { TrainFilterSection, TrainFilterType } from '../../scripts/enums/TrainFilterType';
import { TrainFilter } from '../../types/Trains/TrainOptionsTypes';

export const trainFilters: TrainFilter[] = [
  {
    id: TrainFilterType.twr,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true,
  },
  {
    id: TrainFilterType.skr,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true,
  },
  {
    id: TrainFilterType.common,
    section: TrainFilterSection.TRAIN_TYPE,
    isActive: true,
  },

  {
    id: TrainFilterType.passenger,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true,
  },
  {
    id: TrainFilterType.freight,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true,
  },
  {
    id: TrainFilterType.other,
    section: TrainFilterSection.TIMETABLE_TYPE,
    isActive: true,
  },

  {
    id: TrainFilterType.withComments,
    section: TrainFilterSection.COMMENTS,
    isActive: true,
  },
  {
    id: TrainFilterType.noComments,
    section: TrainFilterSection.COMMENTS,
    isActive: true,
  },

  {
    id: TrainFilterType.withTimetable,
    section: TrainFilterSection.TIMETABLE,
    isActive: true,
  },
  {
    id: TrainFilterType.noTimetable,
    section: TrainFilterSection.TIMETABLE,
    isActive: true,
  },
];

export const sorterOptions = [
  {
    id: 'distance',
    value: 'kilometraż',
  },
  {
    id: 'id',
    value: 'id rozkładu',
  },
  {
    id: 'progress',
    value: 'przebyta trasa',
  },
  {
    id: 'delay',
    value: 'opóźnienie',
  },
  {
    id: 'mass',
    value: 'masa',
  },
  {
    id: 'speed',
    value: 'prędkość',
  },
  {
    id: 'length',
    value: 'długość',
  },
];
