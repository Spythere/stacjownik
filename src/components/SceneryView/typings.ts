import { StopStatus, TimetablePathElement, Train, TrainStop } from '../../typings/common';

export interface SceneryTimetableRow {
  checkpointStop: TrainStop;
  train: Train;
  prevElement: TimetablePathElement | null;
  nextElement: TimetablePathElement | null;
  currentElement: TimetablePathElement;
  status: StopStatus;
}
