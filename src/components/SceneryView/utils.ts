import { StopStatus, TrainStop } from '../../typings/common';

export const stopStatusPriorities = [
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

  if (
    !stopInfo.terminatesHere &&
    stopInfo.confirmed &&
    currentStationName.startsWith(sceneryName)
  ) {
    return StopStatus.DEPARTED;
  }

  if (
    !stopInfo.terminatesHere &&
    stopInfo.confirmed &&
    !currentStationName.startsWith(sceneryName)
  ) {
    return StopStatus.DEPARTED_AWAY;
  }

  if (currentStationName.startsWith(sceneryName) && !stopInfo.stopped) {
    return StopStatus.ONLINE;
  }

  if (currentStationName.startsWith(sceneryName) && stopInfo.stopped) {
    return StopStatus.STOPPED;
  }

  if (!currentStationName.startsWith(sceneryName)) {
    return StopStatus.ARRIVING;
  }

  return StopStatus.ONLINE;
}
