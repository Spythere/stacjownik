export default interface TrainStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  mainStop: boolean;

  arrivalLine: string;
  arrivalTimeString: string;
  arrivalTimestamp: number;
  arrivalRealTimeString: string;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine: string;
  departureTimeString: string;
  departureTimestamp: number;
  departureRealTimeString: string;
  departureRealTimestamp: number;
  departureDelay: number;

  comments?: any;

  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: boolean;
  stopped: boolean;
  stopTime: number;
}
