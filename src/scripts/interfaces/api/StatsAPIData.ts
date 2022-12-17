import { TimetableHistory } from './TimetablesAPIData';

export interface ITimetablesDailyStats {
  totalTimetables: number;
  distanceSum: number;
  distanceAvg: number;

  timetableId: number;
  timetableAuthor: string;
  timetableDriver: string;
  timetableRouteDistance: number;

  dispatcherName: string;
  dispatcherTimetablesCount: number;
}

export interface ITimetablesDailyStatsResponse {
  totalTimetables: number;
  distanceSum: number;
  distanceAvg: number;
  maxTimetable: TimetableHistory | null;
  mostActiveDispatcher: {
    name: string;
    count: number;
  } | null;
}
