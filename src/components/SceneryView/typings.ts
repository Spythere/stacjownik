import { StopStatus, Train, TrainStop } from '../../typings/common';

export interface SceneryTimetableRow {
  checkpointStop: TrainStop;
  train: Train;
  prevDepartureLine: string | null;
  nextArrivalLine: string | null;
  departureLine: string | null;
  arrivingLine: string | null;
  prevStationName: string | null;
  nextStationName: string | null;
  status: StopStatus;
}
