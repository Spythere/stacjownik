export interface Sum {
  routeDistance: number;
  confirmedStopsCount: number;
  allStopsCount: number;
  currentDistance: number;
}

export interface Count {
  fulfilled: number;
  terminated: number;
  _all: number;
}

export interface Max {
  routeDistance: number;
}

export interface Avg {
  routeDistance: number;
}

export interface DriverStatsAPIData {
  _sum: Sum;
  _count: Count;
  _max: Max;
  _avg: Avg;
}
