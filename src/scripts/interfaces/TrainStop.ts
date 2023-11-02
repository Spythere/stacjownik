export default interface TrainStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  mainStop: boolean;

  arrivalLine: string | null;
  // arrivalTimeString: string | null;
  arrivalTimestamp: number;
  // arrivalRealTimeString: string | null;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine: string | null;
  // departureTimeString: string | null;
  departureTimestamp: number;
  // departureRealTimeString: string | null;
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
