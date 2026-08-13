import { Availability, StationRoutesInfo } from '../typings/common';

export type HeaderMode = 'STANDARD' | 'COMPACT';

export interface MainStoreState {
  region: { id: string; value: string; name: string };
  isOffline: boolean;
  appUpdate: { version: string; changelog: string; releaseURL: string } | null;
  chosenModalTrainId?: string;
  modalLastClickedTarget: EventTarget | null;
  currentLocale: string;
  headerMode: HeaderMode;
}

export interface StationJSONData {
  name: string;
  abbr: string;
  url: string;
  lines: string;
  project: string;
  projectUrl: string;
  hash: string;
  hidden: boolean;

  reqLevel: number;

  signalType: string;
  controlType: string;

  SUP: boolean;
  ASDEK: boolean;

  routesInfo: StationRoutesInfo[];

  checkpoints: string | null;
  authors?: string;

  availability: Availability;
}
