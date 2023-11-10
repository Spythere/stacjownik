import { Socket } from 'socket.io-client';
import Station from '../scripts/interfaces/Station';
import { API, Websocket } from '../typings/api';
import { Status } from '../typings/common';

export type Availability = 'default' | 'unavailable' | 'nonPublic' | 'abandoned' | 'nonDefault';

export interface RegionCounters {
  stationCount: number;
  trainsCount: number;
  timetablesCount: number;
}

export interface StoreState {
  stationList: Station[];
  activeData: Websocket.ActiveData;
  rollingStockData?: API.RollingStock.Response;

  regionOnlineCounters: RegionCounters[];

  lastDispatcherStatuses: {
    hash: string;
    statusTimestamp: number;
    statusID: Status.ActiveDispatcher;
  }[];

  sceneryData: any[][];

  region: { id: string; value: string };
  trainCount: number;
  stationCount: number;

  webSocket?: Socket;
  isOffline: boolean;

  dispatcherStatsName: string;
  dispatcherStatsData?: API.DispatcherStats.Response;

  driverStatsName: string;
  driverStatsData?: API.DriverStats.Response;
  driverStatsStatus: Status.Data;

  chosenModalTrainId?: string;

  currentStatsTab: 'daily' | 'driver' | null;

  dataStatuses: {
    connection: Status.Data;
    sceneries: Status.Data;
    timetables: Status.Data;
    dispatchers: Status.Data;
    trains: Status.Data;
  };

  listenerLaunched: boolean;
  blockScroll: boolean;
  modalLastClickedTarget: EventTarget | null;
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

  dispatcherStatus: Status.ActiveDispatcher | number;

  isOnline: boolean;

  stationTrains?: StationTrain[];
  scheduledTrains?: ScheduledTrain[];

  scheduledTrainCount: {
    all: number;
    confirmed: number;
    unconfirmed: number;
  };
}

export interface StationTrain {
  driverName: string;
  driverId: number;
  trainNo: number;
  trainId: string;
  stopStatus: string;
}

export interface ScheduledTrain {
  checkpointName: string;

  trainId: string;
  trainNo: number;

  driverName: string;
  driverId: number;
  currentStationName: string;
  currentStationHash: string;
  category: string;
  stopInfo: TrainStop;

  terminatesAt: string;
  beginsAt: string;

  prevStationName: string;
  nextStationName: string;

  arrivingLine: string | null;
  departureLine: string | null;

  prevDepartureLine: string | null;
  nextArrivalLine: string | null;

  signal: string;
  connectedTrack: string;

  stopLabel: string;
  stopStatus: StopStatus;
  stopStatusID: number;
}

export enum StopStatus {
  ARRIVING = 'arriving',
  DEPARTED = 'departed',
  DEPARTED_AWAY = 'departed-away',
  ONLINE = 'online',
  STOPPED = 'stopped',
  TERMINATED = 'terminated'
}

export interface TrainStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  mainStop: boolean;

  arrivalLine: string | null;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine: string | null;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;
  pointId: number;

  comments?: any;

  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: boolean;
  stopped: boolean;
  stopTime: number | null;
}