export interface DispatcherHistory {
  id: string;
  
  currentDuration: number;
  dispatcherId: number;
  dispatcherName: string;
  dispatcherLevel: number | null;
  dispatcherIsSupporter: boolean;
  isOnline: boolean;
  lastOnlineTimestamp: number;
  region: string;
  stationHash: string;
  stationName: string;
  timestampFrom: number;
  timestampTo?: number;
}