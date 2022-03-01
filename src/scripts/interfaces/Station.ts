import ScheduledTrain from "./ScheduledTrain";
import StationRoutes from "./StationRoutes";

export default interface Station {
  name: string;

  generalInfo?: {
    name: string;
    url: string;

    reqLevel: number;
    // supportersOnly: boolean;

    lines: string;
    project: string;

    signalType: string;
    controlType: string;

    SUP: boolean;

    default: boolean;
    nonPublic: boolean;
    unavailable: boolean;

    routes: StationRoutes;

    checkpoints: {
      checkpointName: string;
      scheduledTrains: ScheduledTrain[];
    }[];
  };

  onlineInfo?: {
    hash: string;
    name: string;

    maxUsers: number;
    currentUsers: number;

    spawns: { spawnName: string; spawnLength: number }[];
    dispatcherRate: number;
    dispatcherName: string;
    dispatcherExp: number;
    dispatcherId: number;
    dispatcherIsSupporter: boolean;

    statusTimestamp: number;
    statusTimeString: string;
    statusID: string;

    stationTrains?: {
      driverName: string;
      trainNo: number;
      stopStatus?: string;
    }[];

    scheduledTrains?: ScheduledTrain[];
  }

  // stationName: string;
  // stationHash: string;
  // stationURL: string;

  // maxUsers: number;
  // currentUsers: number;


  // stationLines: string;
  // stationProject: string;

  // reqLevel: number;
  // supportersOnly: boolean;

  // SBL: string;
  // TWB: string;
  // signalType: string;
  // controlType: string;

  // default: boolean;
  // nonPublic: boolean;
  // unavailable: boolean;

  // routes: {
  //   oneWay: { catenary: number; noCatenary: number };
  //   twoWay: { catenary: number; noCatenary: number };
  // };

  // checkpoints: {
  //   checkpointName: string;
  //   scheduledTrains: ScheduledTrain[];
  // }[];

}
