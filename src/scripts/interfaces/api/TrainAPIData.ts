export default interface TrainAPIData {
  trainNo: number;

  mass: number;
  length: number;
  speed: number;
  stockString: string;

  signal: string;
  distance: number;
  connectedTrack: string;

  driverName: string;
  driverId: number;
  driverIsSupporter: boolean;

  currentStationName: string;
  currentStationHash: string;

  online: boolean;
  lastSeen: number;

  region: string;
  isTimeout: boolean;

  timetable?: {
    timetableId: number;
    category: string;
    route: string;

    stopList: {
      stopName: string;
      stopNameRAW: string;
      stopType: string;
      stopDistance: number;
      pointId: number;

      mainStop: boolean;

      arrivalLine: string;
      arrivalTimestamp: number;
      arrivalRealTimestamp: number;
      arrivalDelay: number;

      departureLine: string;
      departureTimestamp: number;
      departureRealTimestamp: number;
      departureDelay: number;

      comments?: any;

      beginsHere: boolean;
      terminatesHere: boolean;
      confirmed: boolean;
      stopped: boolean;
      stopTime: number;
    }[];

    TWR: boolean;
    SKR: boolean;
    sceneries: string[];
  };
}
