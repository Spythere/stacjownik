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
  sceneries: string | null;
  TWR: boolean | null;
  SKR: boolean | null;
  noTimetable: boolean;
  locoURL: string;
  locoType: string;
  routeDistance: number;
}
