export interface DriverStatsResponse {
  driverName: string;
  fulfilled: number;
  abandoned: number;
  totalDistance: number;
  confirmedDistance: number;
  totalStops: number;
  confirmedStops: number;
  maxServiceDuration: number;
  avgServiceDuration: number;
  maxDistance: number;
  avgDistance: number;
  maxDelay: number;
  avgDelay: number;
}

export interface DriverStatsAPIData {
  response?: DriverStatsResponse;
  errorMessage?: string;
}
