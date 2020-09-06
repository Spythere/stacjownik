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
  route: string | null;
  timetableId: number | null;
  category: string | null;
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

    arrivalScenery?: string;
    departureScenery?: string;
  }[];
  TWR: boolean | null;
  SKR: boolean | null;
  noTimetable: boolean;
  locoURL: string;
  locoType: string;
  routeDistance: number;
  online: boolean;
}
