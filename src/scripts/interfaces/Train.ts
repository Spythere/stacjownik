import TrainStop from '@/scripts/interfaces/TrainStop';

export default interface Train {
  mass: number;
  length: number;
  speed: number;
  signal: string;
  distance: number;
  connectedTrack: string;
  driverId: number;
  trainNo: number;
  driverName: string;
  currentStationName: string;
  currentStationHash: string;
  locoURL: string;
  locoType: string;
  online: boolean;

  timetableData?: {
    timetableId: number;
    category: string;
    route: string;
    followingStops: TrainStop[];
    TWR: boolean;
    SKR: boolean;
    routeDistance: number;
  };

  stopStatus: string;
  stopLabel: string;
}
