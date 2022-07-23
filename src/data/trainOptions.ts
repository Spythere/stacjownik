import { TrainFilter } from "vue";
import { TrainFilterType } from "../scripts/enums/TrainFilterType";

export const trainFilters: TrainFilter[] = [
  {
    id: TrainFilterType.twr,
    isActive: true,
  },
  {
    id: TrainFilterType.skr,
    isActive: true,
  },
  {
    id: TrainFilterType.passenger,
    isActive: true,
  },
  {
    id: TrainFilterType.freight,
    isActive: true,
  },
  {
    id: TrainFilterType.other,
    isActive: true,
  },
  {
    id: TrainFilterType.comments,
    isActive: true,
  },
  {
    id: TrainFilterType.noTimetable,
    isActive: true,
  },
];

export const sorterOptions = [
  {
    id: 'distance',
    value: 'kilometraż',
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
  }
];