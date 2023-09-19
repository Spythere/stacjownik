export interface Sum {
  routeDistance: number;
}

export interface Max {
  routeDistance: number;
}

export interface Min {
  routeDistance: number;
}

export interface Avg {
  routeDistance: number;
}

export interface Count {
  _all: number;
}

export interface DispatcherStatsAPIData {
  _sum: Sum;
  _max: Max;
  _min: Min;
  _avg: Avg;
  _count: Count;
}
