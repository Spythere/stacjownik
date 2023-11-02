export interface DispatcherHistory {
  id: string;

  currentDuration: number;
  dispatcherId: number;
  dispatcherName: string;
  dispatcherLevel: number | null;
  dispatcherRate: number;
  dispatcherIsSupporter: boolean;
  dispatcherStatus?: number;
  isOnline: boolean;
  lastOnlineTimestamp: number;
  region: string;
  stationHash: string;
  stationName: string;
  timestampFrom: number;
  timestampTo?: number;
}
