export default interface Timetable {
  trainNo: number;
  driverName: string;
  category: string;
  stopName: string;
  stopType: string;
  arrivalTime: number;
  arrivalDelay: number;
  departureTime: number;
  departureDelay: number;
  confirmed: boolean;
  stopped: boolean;
  stopTime: number;
  beginsHere: boolean;
  terminatesHere: boolean;
}
