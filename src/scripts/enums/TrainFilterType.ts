export enum TrainFilterSection {
  TRAIN_TYPE = 'TRAIN_TYPE',
  TIMETABLE_TYPE = 'TIMETABLE_TYPE',
  COMMENTS = 'COMMENTS',
  TIMETABLE = 'TIMETABLE',
}

export const enum TrainFilterType {
  noComments = 'noComments',
  withComments = 'withComments',

  twr = 'twr',
  skr = 'skr',
  common = 'common',

  passenger = 'passenger',
  freight = 'freight',
  other = 'other',
  noTimetable = 'noTimetable',
  withTimetable = 'withTimetable',
}
