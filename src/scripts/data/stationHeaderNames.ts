export const headIds = [
  'station',
  'min-lvl',
  'status',
  'dispatcher',
  'dispatcher-lvl',
  'routes-single',
  'routes-double',
  'general'
] as const;

export const headIconsIds = [
  'user',
  'like',
  'spawn',
  'timetableAll',
  'timetableUnconfirmed',
  'timetableConfirmed'
] as const;

export type HeadIdsTypes = (typeof headIds)[number] | (typeof headIconsIds)[number];
