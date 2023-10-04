import { TimetableHistory } from './TimetablesAPIData';

export interface ITimetablesDailyStats {
  totalTimetables: number;
  distanceSum: number;
  distanceAvg: number;

  timetableId: number;
  timetableAuthor: string;
  timetableDriver: string;
  timetableRouteDistance: number;

  mostActiveDispatchers: {
    name: string;
    count: number;
  }[];

  mostActiveDrivers: {
    name: string;
    distance: number;
  }[];

  longestDuties: {
    name: string;
    duration: number;
    station: string;
  }[];
}

export interface ITimetablesDailyStatsResponse {
  totalTimetables: number;
  distanceSum: number;
  distanceAvg: number;
  maxTimetable: TimetableHistory | null;

  mostActiveDispatchers: {
    name: string;
    count: number;
  }[];

  mostActiveDrivers: {
    name: string;
    distance: number;
  }[];

  longestDuties: {
    name: string;
    duration: number;
    station: string;
  }[];
}
