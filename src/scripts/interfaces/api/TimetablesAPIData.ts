export interface TimetableHistory {
  id: number;
  createdAt: string;
  updatedAt: string;

  timetableId: number;
  trainNo: number;
  trainCategoryCode: string;

  driverId: number;
  driverName: string;
  driverLevel: number | null;
  driverIsSupporter: boolean;

  route: string;
  twr: number;
  skr: number;
  sceneriesString: string;

  routeDistance: number;
  currentDistance: number;

  confirmedStopsCount: number;
  allStopsCount: number;

  beginDate: string;
  endDate: string;

  scheduledBeginDate: string;
  scheduledEndDate: string;

  terminated: boolean;
  fulfilled: boolean;

  authorName?: string;
  authorId?: number;

  stopsString?: string;

  stockString?: string;
  stockHistory: string[];

  stockMass?: number;
  stockLength?: number;
  maxSpeed?: number;

  hashesString?: string;
  currentSceneryName?: string;
  currentSceneryHash?: string;

  routeSceneries?: string;

  checkpointArrivals?: string[];
  checkpointDepartures?: string[];
}

export interface SceneryTimetableHistory {
  timetables: TimetableHistory[];
  // totalCount: number;
  // sceneryName: string;
}
