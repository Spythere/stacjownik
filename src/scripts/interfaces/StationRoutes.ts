export default interface StationRoutes {
    oneWay:
    {
        name: string;
        catenary: boolean;
        SBL: boolean;
        TWB: boolean
    }[];

    twoWay: {
        name: string;
        catenary: boolean;
        SBL: boolean;
        TWB: boolean
    }[];

    /* [catenary, noCatenary] */
    oneWayCatenaryRouteNames: string[];
    oneWayNoCatenaryRouteNames: string[];
    twoWayCatenaryRouteNames: string[];
    twoWayNoCatenaryRouteNames: string[];
    sblRouteNames: string[];
}