interface ISceneryInfoData {
  stationName: string;
  stationURL: string;
  stationLines: string;
  stationProject: string;

  reqLevel: string;
  supportersOnly: string;
  signalType: string;
  controlType: string;
  SBL: string;
  twoWayBlock: string;

  routesOneWayCatenary: number;
  routesOneWayOther: number;
  routesTwoWayCatenary: number;
  routesToWayOther: number;

  default: boolean;
  nonPublic: boolean;
  unavailable: boolean;
  hasData: boolean;

  stops: string[];
  checkpoints: string[];

  currentDispatcher: string;
  currentDispatcherId: number;
  currentDispatcherFrom: number;
  dispatcherHistory: { dispatcherName: string; dispatcherId: number; dispatcherFrom: number; dispatcherTo: number }[];
}

export default ISceneryInfoData;
