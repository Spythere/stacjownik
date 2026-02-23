export enum ServerRegion {
  'eu' = 'PL1',
  'cae' = 'PL2',
  'usw' = 'DE',
  'us' = 'CZE',
  'ru' = 'ENG'
}

export const regions: Record<string, string> = {
  eu: 'PL1',
  cae: 'PL2',
  usw: 'DE',
  us: 'CZE',
  ru: 'ENG'
};

export function getRegionNameById(id: string) {
  return regions[id] ?? 'PL1';
}
