import { API } from '../typings/api';
import { Availability, Station, StationRoutesInfo, Status, Train } from '../typings/common';

export const popupKeys = ['DonatorPopUp', 'TrainCommentsPopUp', 'VehiclePreviewPopUp'] as const;
export type PopUpType = (typeof popupKeys)[number];

export interface MainStoreState {
  region: { id: string; value: string; name: string };
  isOffline: boolean;
  isNewUpdate: boolean;
  dispatcherStatsName: string;
  dispatcherStatsData?: API.DispatcherStats.Response;
  driverStatsName: string;
  driverStatsData?: API.DriverStats.Response;
  driverStatsStatus: Status.Data;
  chosenModalTrainId?: string;
  modalLastClickedTarget: EventTarget | null;
  mousePos: { x: number; y: number };
  popUpData: { key: PopUpType | null; content: string };
  stations: Station[];
  trainsOnline: Train[];
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
