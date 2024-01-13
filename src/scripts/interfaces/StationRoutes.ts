import { StationRoutesInfo } from '../../store/typings';

export interface StationRoutes {
  oneWay: StationRoutesInfo[];
  twoWay: StationRoutesInfo[];

  /* [catenary, noCatenary] */
  oneWayCatenaryRouteNames: string[];
  oneWayNoCatenaryRouteNames: string[];
  twoWayCatenaryRouteNames: string[];
  twoWayNoCatenaryRouteNames: string[];
  sblRouteNames: string[];
}
