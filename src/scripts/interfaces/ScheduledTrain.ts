import TrainStop from './TrainStop';

export enum StopStatus {
  'arriving' = 'arriving',
  'departed' = 'departed',
  'departed-away' = 'departed-away',
  'online' = 'online',
  'stopped' = 'stopped',
  'terminated' = 'terminated'
}

export interface ScheduledTrain {
  checkpointName: string;

  trainId: string;
  trainNo: number;

  driverName: string;
  driverId: number;
  currentStationName: string;
  currentStationHash: string;
  category: string;
  stopInfo: TrainStop;

  terminatesAt: string;
  beginsAt: string;

  prevStationName: string;
  nextStationName: string;

  arrivingLine: string | null;
  departureLine: string | null;

  prevDepartureLine: string | null;
  nextArrivalLine: string | null;

  signal: string;
  connectedTrack: string;

  stopLabel: string;
  stopStatus: StopStatus;
  stopStatusID: number;
}
