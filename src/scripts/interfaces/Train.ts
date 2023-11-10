import { TrainStop } from '../../store/typings';

export default interface Train {
  trainId: string;

  mass: number;
  length: number;
  speed: number;
  signal: string;
  distance: number;
  connectedTrack: string;
  driverId: number;
  trainNo: number;
  driverName: string;
  driverLevel: number;
  currentStationName: string;
  currentStationHash: string;
  locoType: string;
  online: boolean;
  lastSeen: number;
  region: string;
  stockList: string[];

  isTimeout: boolean;
  isSupporter: boolean;

  timetableData?: {
    timetableId: number;
    category: string;
    route: string;
    followingStops: TrainStop[];
    TWR: boolean;
    SKR: boolean;
    routeDistance: number;
    sceneries: string[];
  };
}
