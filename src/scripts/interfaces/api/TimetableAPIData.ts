export default interface TimetableAPIData {
  trainInfo: {
    timetableId: number;
    trainNo: number;
    trainCategoryCode: string;
    driverId: number;
    driverName: string;
    route: string;
    twr: boolean;
    skr: boolean;
    sceneries: string[];
  };

  stopPoints: {
    arrivalLine: string | null;
    arrivalTime: string | null;
    arrivalDelay: number;
    arrivalRealTime: string | null;
    pointDistance: number;
    pointName: string;
    pointNameRAW: string;
    entryId: number;
    pointId: number;
    comments: string | null;
    confirmed: boolean;
    isStopped: boolean;
    pointStopTime: number | null;
    pointStopType: string;
    departureLine: string | null;
    departureTime: string | null;
    departureDelay: number;
    departureRealTime: string | null;
  }[];
}