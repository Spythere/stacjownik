import StationAPIData from "./StationAPIData";

export default interface TrainAPIData {
  trainNo: number;
  driverId: number;
  driverName: string;
  driverIsSupporter: boolean;
  station: StationAPIData;
  dataSignal: string;
  dataSceneryConnection: string;
  dataDistance: number;
  dataCon: string;
  dataSpeed: number;
  dataMass: number;
  dataLength: number;
  region: string;
  isOnline: boolean;
  lastSeen: number;
}
