export default interface Filter {
  [key: string]: (boolean | number),
  default: boolean;
  notDefault: boolean;
  real: boolean;
  fictional: boolean;
  "SPK": boolean;
  "SCS": boolean;
  "SPE": boolean;
  ręczne: boolean;
  mechaniczne: boolean;
  "SBL": boolean;
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

  endingStatus: boolean;
  afkStatus: boolean;
  noSpaceStatus: boolean;
  unavailableStatus: boolean;
  unsignedStatus: boolean;

  onlineToTimestamp: number;
}
