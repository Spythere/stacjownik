import { Socket } from 'socket.io-client';
import { DataStatus } from '../../enums/DataStatus';
import StationAPIData from '../api/StationAPIData';
import { TrainAPIData } from '../api/TrainAPIData';
import { DispatcherStatsAPIData } from '../api/DispatcherStatsAPIData';
import { DriverStatsAPIData } from '../api/DriverStatsAPIData';
import { RollingStockGithubData } from '../github_api/StockInfoGithubData';
import Station from '../Station';
import { ScheduledTrain } from '../ScheduledTrain';
import { DispatcherStatusID } from '../../enums/DispatcherStatus';

export type Availability = 'default' | 'unavailable' | 'nonPublic' | 'abandoned' | 'nonDefault';

export interface StoreState {
  stationList: Station[];
  apiData: APIData;
  rollingStockData?: RollingStockGithubData;

  lastDispatcherStatuses: { hash: string; statusTimestamp: number; statusID: DispatcherStatusID }[];

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

  statusTimestamp: number;
  statusID: DispatcherStatusID;

  isOnline: boolean;

  stationTrains?: StationTrain[];
  scheduledTrains?: ScheduledTrain[];

  scheduledTrainCount: {
    all: number;
    confirmed: number;
    unconfirmed: number;
  }
}
