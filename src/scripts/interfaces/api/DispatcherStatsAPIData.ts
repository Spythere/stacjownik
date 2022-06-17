export interface DispatcherTimetable {
  timetableId: number;
  trainNo: number;
  trainCategoryCode: string;
  driverId: number;
  driverName: string;
  route: string;
  twr: boolean;
  skr: boolean;
  sceneriesString: string;
  routeDistance: number;
  currentDistance: number;
  confirmedStopsCount: number;
  allStopsCount: number;
  beginDate: Date;
  endDate: Date;
  scheduledBeginDate: Date;
  scheduledEndDate: Date;
  terminated: boolean;
  fulfilled: boolean;
  authorName?: string;
  authorId?: number;
}

export interface Response {
  dispatcherName?: string;
  lastSceneryName?: string;
  maxTimetableDistance: number;
  minTimetableDistance: number;
  avgTimetableDistance: number;
  count: number;
  sumDistance: number;
  timetables?: DispatcherTimetable[];
}

export interface DispatcherStatsAPIData {
  response: Response;
  errorMessage?: string;
}

