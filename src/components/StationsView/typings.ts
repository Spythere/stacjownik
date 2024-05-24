export interface FilterOption {
  id: string;
  name: string;
  value: boolean;
  defaultValue: boolean;
}

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

export type HeadIdsType = (typeof headIds)[number] | (typeof headIconsIds)[number];

export interface ActiveSorter {
  headerName: HeadIdsType;
  dir: number;
}
