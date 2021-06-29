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
  free: boolean;
  occupied: boolean;
  ending: boolean;
  nonPublic: boolean;
}
