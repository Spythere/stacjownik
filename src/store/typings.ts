import { API } from '../typings/api';
import { Availability, CheckpointTrain, StationRoutesInfo, Status } from '../typings/common';

export interface MainStoreState {
  region: { id: string; value: string; name: string };
  isOffline: boolean;
  appUpdate: { version: string; changelog: string; releaseURL: string } | null;
  dispatcherStatsName: string;
  dispatcherStatsData?: API.DispatcherStats.Response;
  driverStatsName: string;
  driverStatsData?: API.DriverStats.Response;
  driverStatsStatus: Status.Data;
  chosenModalTrainId?: string;
  modalLastClickedTarget: EventTarget | null;
}

export interface StationJSONData {
  name: string;
  abbr: string;
  url: string;
  lines: string;
  project: string;
  projectUrl: string;
  hash: string;

  reqLevel: number;

  signalType: string;
  controlType: string;

  SUP: boolean;
  ASDEK: boolean;

  // routes: string;
  routesInfo: StationRoutesInfo[];

  checkpoints: string | null;
  authors?: string;

  availability: Availability;
}
