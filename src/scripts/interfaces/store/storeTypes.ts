import { Socket } from 'socket.io-client';
import { DataStatus } from '../../enums/DataStatus';
import StationAPIData from '../api/StationAPIData';
import { TrainAPIData } from '../api/TrainAPIData';
import { DispatcherStatsAPIData } from '../api/DispatcherStatsAPIData';
import { DriverStatsAPIData } from '../api/DriverStatsAPIData';
import { RollingStockGithubData } from '../github_api/StockInfoGithubData';
import Station from '../Station';
import { ScheduledTrain } from '../ScheduledTrain';
import { DispatcherStatus } from '../../enums/DispatcherStatus';
import ActiveSceneryAPIData from '../api/SceneryAPIData';

export type Availability = 'default' | 'unavailable' | 'nonPublic' | 'abandoned' | 'nonDefault';

export interface RegionCounters {
  stationCount: number;
  trainsCount: number;
  timetablesCount: number;
}

export interface StoreState {
  stationList: Station[];
  apiData: APIData;
  rollingStockData?: RollingStockGithubData;

  regionOnlineCounters: RegionCounters[];

  lastDispatcherStatuses: { hash: string; statusTimestamp: number; statusID: DispatcherStatus }[];

  sceneryData: any[][];

  region: { id: string; value: string };
  trainCount: number;
  stationCount: number;

  webSocket?: Socket;
  isOffline: boolean;

  dispatcherStatsName: string;
  dispatcherStatsData?: DispatcherStatsAPIData;

  driverStatsName: string;
  driverStatsData?: DriverStatsAPIData;
  driverStatsStatus: DataStatus;

  chosenModalTrainId?: string;

  currentStatsTab: 'daily' | 'driver' | null;

  dataStatuses: {
    connection: DataStatus;
    sceneries: DataStatus;
    timetables: DataStatus;
    dispatchers: DataStatus;
    trains: DataStatus;
  };

  listenerLaunched: boolean;
  blockScroll: boolean;
  modalLastClickedTarget: EventTarget | null;
}

export interface APIData {
  stations?: StationAPIData[];
  dispatchers?: string[][];
  trains?: TrainAPIData[];
  activeSceneries?: ActiveSceneryAPIData[];

  connectedSocketCount: number;
}

export interface StationRoutesInfo {
  routeName: string;
  isElectric: boolean;
  isInternal: boolean;
  isRouteSBL: boolean;
  routeLength: number;
  routeSpeed: number;
  routeTracks: number;
}

export interface StationJSONData {
  name: string;
  abbr: string;
  url: string;
  lines: string;
  project: string;
  projectUrl: string;

  reqLevel: number;

  signalType: string;
  controlType: string;

  SUP: boolean;

  // routes: string;
  routesInfo: StationRoutesInfo[];

  checkpoints: string | null;
  authors?: string;

  availability: Availability;
}

export interface StationTrain {
  driverName: string;
  driverId: number;
  trainNo: number;
  trainId: string;
  stopStatus: string;
}

export interface OnlineScenery {
  name: string;
  hash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawns: { spawnName: string; spawnLength: number; isElectrified: boolean }[];
  dispatcherName: string;
  dispatcherRate: number;
  dispatcherId: number;
  dispatcherExp: number;
  dispatcherIsSupporter: boolean;

  dispatcherStatus: DispatcherStatus | number;

  isOnline: boolean;

  stationTrains?: StationTrain[];
  scheduledTrains?: ScheduledTrain[];

  scheduledTrainCount: {
    all: number;
    confirmed: number;
    unconfirmed: number;
  };
}
