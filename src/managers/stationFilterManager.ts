import StorageManager from './storageManager';

export const sections = [
  'status',
  'timetables',
  'reality',
  'packageAccess',
  'stationType',
  'access',
  'control',
  'blockades',
  'signals',
  'addons'
] as const;

export const initFilters = {
  default: false,
  notDefault: false,
  real: false,
  fictional: false,
  SPK: false,
  SCS: false,
  SPE: false,
  SUP: false,
  noSUP: false,
  ASDEK: false,
  noASDEK: false,
  manual: false,
  'SPK-R': false,
  'SCS-R': false,
  mechanical: false,
  'SPK-M': false,
  'SCS-M': false,
  'SCS-SPK': false,
  modern: false,
  semaphores: false,
  historical: false,
  mixed: false,
  SBL: false,
  PBL: false,
  'include-selected': false,
  'no-1track': false,
  'no-2track': false,
  free: true,
  occupied: false,
  nonPublic: false,
  unavailable: true,
  abandoned: true,
  afkStatus: false,
  endingStatus: false,
  noSpaceStatus: false,
  unavailableStatus: false,
  unsignedStatus: false,
  withActiveTimetables: false,
  withoutActiveTimetables: false,
  junction: false,
  nonJunction: false,
  maxVmax: 200,
  minVmax: 0,
  onlineFromHours: 0,
  minLevel: 0,
  maxLevel: 20,
  minOneWay: 0,
  minOneWayCatenary: 0,
  minOneWayInt: 0,
  minOneWayCatenaryInt: 0,
  minTwoWay: 0,
  minTwoWayCatenary: 0,
  minTwoWayInt: 0,
  minTwoWayCatenaryInt: 0,
  authors: '',
  projects: '',
  lines: ''
};

export const sliderStates = [
  { id: 'maxVmax', minRange: 0, maxRange: 200, step: 10 },
  { id: 'minVmax', minRange: 0, maxRange: 200, step: 10 },
  { id: 'minLevel', minRange: 0, maxRange: 20, step: 1 },
  { id: 'maxLevel', minRange: 0, maxRange: 20, step: 1 },
  { id: 'minOneWay', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minOneWayCatenary', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minOneWayInt', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minOneWayCatenaryInt', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minTwoWay', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minTwoWayCatenary', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minTwoWayInt', minRange: 0, maxRange: 5, step: 1 },
  { id: 'minTwoWayCatenaryInt', minRange: 0, maxRange: 5, step: 1 }
];

export type StationFilter = keyof typeof initFilters;
export type StationFilterSection = (typeof sections)[number];

export const filtersSections: Record<StationFilterSection, StationFilter[]> = {
  status: ['free', 'occupied', 'endingStatus', 'afkStatus', 'noSpaceStatus', 'unavailableStatus'],
  timetables: ['withActiveTimetables', 'withoutActiveTimetables'],
  reality: ['real', 'fictional'],
  packageAccess: ['default', 'notDefault'],
  stationType: ['junction', 'nonJunction'],
  access: ['nonPublic', 'unavailable', 'abandoned'],
  addons: ['SUP', 'ASDEK', 'noSUP', 'noASDEK'],
  control: [
    'SPK',
    'SCS',
    'SPE',
    'SCS-SPK',
    'SPK-M',
    'SCS-M',
    'mechanical',
    'SPK-R',
    'SCS-R',
    'manual'
  ],
  blockades: ['SBL', 'PBL'],
  signals: ['modern', 'semaphores', 'mixed', 'historical']
};

export function setupFilters(currentFilters: Record<string, any>) {
  if (!StorageManager.isRegistered('options_saved')) return;

  Object.keys(currentFilters).forEach((filterKey) => {
    const savedValue = StorageManager.getValue(filterKey);

    if (savedValue != null) {
      if (typeof currentFilters[filterKey] == 'boolean')
        currentFilters[filterKey] = savedValue === 'true';
      else if (typeof currentFilters[filterKey] == 'number')
        currentFilters[filterKey] = Number(savedValue);
      else currentFilters[filterKey] = savedValue.toString();
    }
  });
}

export function getChangedFilters(currentFilters: Record<string, any>): string[] {
  return (
    Object.keys(currentFilters).filter(
      (filterKey) =>
        currentFilters[filterKey] !== initFilters[filterKey as keyof typeof initFilters]
    ) ?? []
  );
}
