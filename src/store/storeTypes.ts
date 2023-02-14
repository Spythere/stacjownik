import { Socket } from 'socket.io-client';
import { DataStatus } from '../scripts/enums/DataStatus';
import StationAPIData from '../scripts/interfaces/api/StationAPIData';
import TrainAPIData from '../scripts/interfaces/api/TrainAPIData';
import Station from '../scripts/interfaces/Station';
import Train from '../scripts/interfaces/Train';
import { DispatcherStatsAPIData } from '../scripts/interfaces/api/DispatcherStatsAPIData';
import { DriverStatsAPIData } from '../scripts/interfaces/api/DriverStatsAPIData';

export type Availability = 'default' | 'unavailable' | 'nonPublic' | 'abandoned' | 'nonDefault';

export interface StoreState {
  stationList: Station[];
  trainList: Train[];
  apiData: APIData;

  lastDispatcherStatuses: { hash: string; statusTimestamp: number; statusID: string }[];

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

  currentStatsTab: 'daily' | 'driver';

  dataStatuses: {
    connection: DataStatus;
    sceneries: DataStatus;
    timetables: DataStatus;
    dispatchers: DataStatus;
    trains: DataStatus;
  };

  listenerLaunched: boolean;
  blockScroll: boolean;
}

export interface APIData {
  stations?: StationAPIData[];
  dispatchers?: string[][];
  trains?: TrainAPIData[];
  connectedSocketCount: number;
}

export interface StationJSONData {
  name: string;
  url: string;
  lines: string;
  project: string;
  projectUrl: string;

  reqLevel: number;

  signalType: string;
  controlType: string;

  SUP: boolean;

  routes: string;
  
  checkpoints: string | null;
  authors?: string;

  availability: Availability;
}