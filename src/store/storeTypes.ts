import { DataStatus } from '@/scripts/enums/DataStatus';
import { Response } from '@/scripts/interfaces/api/DispatcherStatsAPIData';
import StationAPIData from '@/scripts/interfaces/api/StationAPIData';
import TrainAPIData from '@/scripts/interfaces/api/TrainAPIData';
import Station from '@/scripts/interfaces/Station';
import Train from '@/scripts/interfaces/Train';
import { Socket } from 'socket.io-client';

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
  dispatcherStatsName: string;
  dispatcherStatsData?: Response; 

  dataStatuses: {
    connection: DataStatus;
    sceneries: DataStatus;
    timetables: DataStatus;
    dispatchers: DataStatus;
    trains: DataStatus;
  };

  listenerLaunched: boolean;
}

export interface APIData {
  stations?: StationAPIData[];
  dispatchers?: string[][];
  trains?: TrainAPIData[];
}

export interface StationJSONData {
  name: string;
  url: string;
  lines: string;
  project: string;

  reqLevel: number;

  signalType: string;
  controlType: string;

  SUP: boolean;

  routes: string;
  checkpoints: string | null;
  authors?: string;

  availability: Availability;
}
