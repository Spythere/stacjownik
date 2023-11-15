export interface FilterOption {
  id: string;
  name: string;
  value: boolean;
  defaultValue: boolean;
}

export interface Filter {
  [key: string]: boolean | number | string;
  default: boolean;
  notDefault: boolean;
  real: boolean;
  fictional: boolean;
  SPK: boolean;
  SCS: boolean;
  SPE: boolean;
  SUP: boolean;
  noSUP: boolean;
  ręczne: boolean;
  'ręczne+SPK': boolean;
  'ręczne+SCS': boolean;
  mechaniczne: boolean;
  'mechaniczne+SPK': boolean;
  'mechaniczne+SCS': boolean;
  SBL: boolean;
  PBL: boolean;
  współczesna: boolean;
  kształtowa: boolean;
  historyczna: boolean;
  mieszana: boolean;
  minLevel: number;
  maxLevel: number;
  minOneWayCatenary: number;
  minOneWay: number;
  minTwoWayCatenary: number;
  minTwoWay: number;
  'no-1track': boolean;
  'no-2track': boolean;
  'include-selected': boolean;
  free: boolean;
  occupied: boolean;
  nonPublic: boolean;
  unavailable: boolean;
  abandoned: boolean;

  endingStatus: boolean;
  afkStatus: boolean;
  noSpaceStatus: boolean;
  unavailableStatus: boolean;
  unsignedStatus: boolean;

  authors: string;

  onlineFromHours: number;
}
