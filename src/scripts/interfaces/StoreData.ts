import DataStatus from "../enums/DataStatus";
import Station from "./Station";
import Train from "./Train";

export interface StoreData {
  stationList: Station[];
  trainList: Train[];

  activeTrainCount: number;
  activeStationCount: number;

  dataConnectionStatus: DataStatus;
  timetableDataStatus: DataStatus;
}
