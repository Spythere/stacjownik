export interface DispatcherHistory {
  currentDuration: number;
  dispatcherId: number;
  dispatcherName: string;
  isOnline: boolean;
  lastOnlineTimestamp: number;
  region: string;
  stationHash: string;
  stationName: string;
  timestampFrom: number;
  timestampTo?: number;
}