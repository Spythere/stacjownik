import TrainStop from "./TrainStop";

export default interface Timetable {
  trainNo: number;

  success: boolean;

  data?: {
    trainNo: number;
    driverName: string;
    driverId: number;
    currentStationName: string;
    currentStationHash: string;
    timetableId: number;
    category: string;
    route: string;
    TWR: boolean;
    SKR: boolean;
    routeDistance: number;
    followingStops: TrainStop[];
    followingSceneries: string[];
  }
}
