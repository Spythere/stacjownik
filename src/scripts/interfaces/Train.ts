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
  locoURL: string;
  locoType: string;
  online: boolean;

  timetableData?: {
    timetableId: number;
    category: string;
    route: string;
    followingStops: {
      stopName: string;
      stopType: string;
      arrivalLine?: string;
      arrivalTime: number;
      arrivalDelay: number;
      departureLine?: string;
      departureTime: number;
      beginsHere: boolean;
      terminatesHere: boolean;
      departureDelay: number;
      confirmed: boolean;
      stopped: boolean;
      stopTime: number;
    }[];
    TWR: boolean;
    SKR: boolean;
    routeDistance: number;
  };
}
