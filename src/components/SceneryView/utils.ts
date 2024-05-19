import { StopStatus, TrainStop } from '../../typings/common';

export const stopStatusPriority = [
  StopStatus.ONLINE,
  StopStatus.STOPPED,
  StopStatus.DEPARTED,
  StopStatus.ARRIVING,
  StopStatus.DEPARTED_AWAY,
  StopStatus.TERMINATED
];

export function getTrainStopStatus(
  stopInfo: TrainStop,
  currentStationName: string,
  sceneryName: string
) {
  if (stopInfo.terminatesHere && stopInfo.confirmed) {
    return StopStatus.TERMINATED;
  }

  if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName == sceneryName) {
    return StopStatus.DEPARTED;
  }

  if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName != sceneryName) {
    return StopStatus.DEPARTED_AWAY;
  }

  if (currentStationName == sceneryName && !stopInfo.stopped) {
    return StopStatus.ONLINE;
  }

  if (currentStationName == sceneryName && stopInfo.stopped) {
    return StopStatus.STOPPED;
  }

  if (currentStationName != sceneryName) {
    return StopStatus.ARRIVING;
  }

  return StopStatus.ONLINE;
}
