import { DispatcherStatus } from '../../enums/DispatcherStatus';

export default interface ActiveSceneryAPIData {
  dispatcherId: number;
  dispatcherName: string;
  dispatcherIsSupporter: boolean;
  stationName: string;
  stationHash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawn: number;
  lastSeen: number;
  dispatcherExp: number;
  nameFromHeader: string;
  spawnString: string | null;
  networkConnectionString: string;
  isOnline: number;
  dispatcherRate: number;
  dispatcherStatus: DispatcherStatus | number;
}
