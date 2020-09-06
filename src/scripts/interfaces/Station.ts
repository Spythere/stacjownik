export default interface Station {
  stationName: string;
  stationHash: string;
  maxUsers: number;
  currentUsers: number;
  spawnString: string;
  dispatcherRate: number;
  dispatcherName: string;
  dispatcherExp: number;
  dispatcherId: number;
  stationLines: string;
  stationProject: string;
  reqLevel: string;
  supportersOnly: string;
  signalType: string;
  controlType: string;
  default: boolean;
  nonPublic: boolean;
  routes: {
    oneWay: { catenary: number; noCatenary: number };
    twoWay: { catenary: number; noCatenary: number };
  };
  online: boolean;
  occupiedTo: string;
  statusTimestamp: number;
  scheduledTrains: {
    trainNo: number;
    driverName: string;
    category: string;
    stopName: string;
    stopType: string;
    arrivalTime: number;
    arrivalDelay: number;
    departureTime: number;
    departureDelay: number;
    confirmed: boolean;
    stopped: boolean;
    stopTime: number;
    beginsHere: boolean;
    terminatesHere: boolean;
  }[];
}
