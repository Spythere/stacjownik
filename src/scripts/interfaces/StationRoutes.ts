export default interface StationRoutes {
  oneWay: {
    name: string;
    catenary: boolean;
    SBL: boolean;
    TWB: boolean;
    isInternal: boolean;
    tracks: number;
    speed: number;
    length: number;
  }[];

  twoWay: {
    name: string;
    catenary: boolean;
    SBL: boolean;
    TWB: boolean;
    isInternal: boolean;
    tracks: number;
    speed: number;
    length: number;
  }[];

  /* [catenary, noCatenary] */
  oneWayCatenaryRouteNames: string[];
  oneWayNoCatenaryRouteNames: string[];
  twoWayCatenaryRouteNames: string[];
  twoWayNoCatenaryRouteNames: string[];
  sblRouteNames: string[];
}
