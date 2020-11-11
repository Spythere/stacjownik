import Train from '@/scripts/interfaces/Train';
import TrainStop from '@/scripts/interfaces/TrainStop';

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
  online: boolean;
  occupiedTo: string;
  statusTimestamp: number;
  stationTrains: Train[];
  scheduledTrains: {
    trainNo: number;
    driverName: string;
    driverId: number;
    currentStationName: string;
    currentStationHash: string;
    category: string;
    stopInfo: TrainStop;

    terminatesAt: string;
    beginsAt: string;
    nearestStop: string;

    stopLabel: string;
    stopStatus: string;
  }[];
}
