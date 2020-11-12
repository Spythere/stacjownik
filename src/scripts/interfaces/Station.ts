import Train from './Train';
import ScheduledTrain from './ScheduledTrain';

export default interface Station {
  stationName: string;
  stationHash: string;
  maxUsers: number;
  currentUsers: number;
  spawnString: string;
  dispatcherRate: number;
  dispatcherName: string;
  dispatcherExp: number;
  dispatcherId: number;
  dispatcherIsSupporter: boolean;
  stationLines: string;
  stationProject: string;
  reqLevel: string;
  supportersOnly: string;
  signalType: string;
  controlType: string;
  default: boolean;
  nonPublic: boolean;
  routes: {
    oneWay: { catenary: number; noCatenary: number };
    twoWay: { catenary: number; noCatenary: number };
  };
  subStations: {
    scheduledTrains: ScheduledTrain[],
  }[];
  online: boolean;
  occupiedTo: string;
  statusTimestamp: number;
  stationTrains: Train[];
  scheduledTrains: ScheduledTrain[];
}
