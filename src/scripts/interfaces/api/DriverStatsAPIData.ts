export interface DriverStatsResponse {
  driverName: string;
  fulfilled: number;
  abandoned: number;
  totalDistance: number;
  confirmedDistance: number;
  totalStops: number;
  confirmedStops: number;
}

export interface DriverStatsAPIData {
  response?: DriverStatsResponse;
  errorMessage?: string;
}
