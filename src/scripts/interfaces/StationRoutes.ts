export default interface StationRoutes {
    oneWay:
    {
        name: string;
        catenary: boolean;
        SBL: boolean;
        TWB: boolean;
        isInternal: boolean;
    }[];

    twoWay: {
        name: string;
        catenary: boolean;
        SBL: boolean;
        TWB: boolean;
        isInternal: boolean;
    }[];

    /* [catenary, noCatenary] */
    oneWayCatenaryRouteNames: string[];
    oneWayNoCatenaryRouteNames: string[];
    twoWayCatenaryRouteNames: string[];
    twoWayNoCatenaryRouteNames: string[];
    sblRouteNames: string[];
}