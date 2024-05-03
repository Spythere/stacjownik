import { StationRoutesInfo } from '../../store/typings';

export interface StationRoutes {
  single: StationRoutesInfo[];
  double: StationRoutesInfo[];

  singleElectrifiedNames: string[];
  singleOtherNames: string[];
  doubleElectrifiedNames: string[];
  doubleOtherNames: string[];
  sblNames: string[];

  minRouteSpeed: number;
  maxRouteSpeed: number;
}
