import {
  TrainStop,
  StopStatus,
  Train,
  ScheduledTrain,
  Station,
  StationTrain
} from '../typings/common';

export function getLocoURL(locoType: string): string {
  return `https://rj.td2.info.pl/dist/img/thumbnails/${
    locoType.includes('EN') ? locoType + 'rb' : locoType
  }.png`;
}

export function getStatusTimestamp(stationStatus: any): number {
  if (!stationStatus) return -2;

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
    case 1:
    case 3:
      return statusTimestamp;

    case 2:
      if (statusTimestamp == 0) return 0;
      break;

    default:
      break;
  }

  return -1;
}

export function parseSpawns(spawnString: string | null) {
  if (!spawnString) return [];
  if (spawnString === 'NO_SPAWN') return [];

  return spawnString.split(';').map((spawn) => {
    const spawnArray = spawn.split(',');
    const spawnName = spawnArray[6] ? spawnArray[6] : spawnArray[0];
    const spawnLength = parseInt(spawnArray[2]);
    const isElectrified = spawnArray[3] == 'True';

    return { spawnName, spawnLength, isElectrified };
  });
}

export function getTimestamp(date: string | null): number {
  return date ? new Date(date).getTime() : 0;
}

export function getTrainStopStatus(
  stopInfo: TrainStop,
  currentStationName: string,
  sceneryName: string
) {
  let stopStatus = StopStatus.ARRIVING,
    stopLabel = '',
    stopStatusID = -1;

  if (stopInfo.terminatesHere && stopInfo.confirmed) {
    stopStatus = StopStatus.TERMINATED;
    stopLabel = 'Skończył bieg';
    stopStatusID = 5;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName == sceneryName) {
    stopStatus = StopStatus.DEPARTED;
    stopLabel = 'Odprawiony';
    stopStatusID = 2;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName != sceneryName) {
    stopStatus = StopStatus.DEPARTED_AWAY;
    stopLabel = 'Odjechał';
    stopStatusID = 4;
  } else if (currentStationName == sceneryName && !stopInfo.stopped) {
    stopStatus = StopStatus.ONLINE;
    stopLabel = 'Na stacji';
    stopStatusID = 0;
  } else if (currentStationName == sceneryName && stopInfo.stopped) {
    stopStatus = StopStatus.STOPPED;
    stopLabel = 'Postój';
    stopStatusID = 1;
  } else if (currentStationName != sceneryName) {
    stopStatus = StopStatus.ARRIVING;
    stopLabel = 'W drodze';
    stopStatusID = 3;
  }

  return { stopStatus, stopLabel, stopStatusID };
}

export function getCheckpointTrain(
  train: Train,
  trainStopIndex: number,
  sceneryName: string
): ScheduledTrain {
  const timetable = train.timetableData!;
  const followingStops = timetable.followingStops;
  const trainStop = followingStops[trainStopIndex];

  const trainStopStatus = getTrainStopStatus(trainStop, train.currentStationName, sceneryName);

  let prevStationName = '',
    nextStationName = '';

  let departureLine: string | null = null;
  let arrivingLine: string | null = null;

  let prevDepartureLine: string | null = null,
    nextArrivalLine: string | null = null;

  for (let i = trainStopIndex; i >= 0; i--) {
    const stop = followingStops[i];

    if (/strong|podg\.|pe\./g.test(stop.stopName) && !prevStationName && i <= trainStopIndex - 1)
      prevStationName = stop.stopNameRAW.replace(/,.*/g, '');

    if (stop.arrivalLine != null && !arrivingLine && !/-|_|it|sbl/gi.test(stop.arrivalLine)) {
      arrivingLine = stop.arrivalLine;
      prevDepartureLine = followingStops[i - 1]?.departureLine || null;
    }
  }

  for (let i = trainStopIndex; i < followingStops.length; i++) {
    const stop = followingStops[i];

    if (/strong|podg\.|pe\./g.test(stop.stopName) && !nextStationName && i > trainStopIndex)
      nextStationName = stop.stopNameRAW.replace(/,.*/g, '');

    if (stop.departureLine && !departureLine && !/-|_|it|sbl/gi.test(stop.departureLine)) {
      departureLine = stop.departureLine;
      nextArrivalLine = followingStops[i + 1]?.arrivalLine || null;
    }
  }

  return {
    checkpointName: trainStop.stopNameRAW,

    trainNo: train.trainNo,
    trainId: train.trainId,

    signal: train.signal,
    connectedTrack: train.connectedTrack,

    driverName: train.driverName,
    driverId: train.driverId,
    currentStationName: train.currentStationName,
    currentStationHash: train.currentStationHash,
    category: timetable.category,
    beginsAt: timetable.followingStops[0].stopNameRAW,
    terminatesAt: timetable.followingStops[timetable.followingStops.length - 1].stopNameRAW,

    nextStationName,
    prevStationName,

    stopInfo: trainStop,
    stopLabel: trainStopStatus.stopLabel,
    stopStatus: trainStopStatus.stopStatus,
    stopStatusID: trainStopStatus.stopStatusID,

    region: train.region,

    arrivingLine: arrivingLine,
    departureLine: departureLine,

    nextArrivalLine,
    prevDepartureLine
  };
}

export function getScheduledTrains(
  trainList: Train[],
  stationGeneralInfo: Station['generalInfo'],
  stationName: string,
  region: string
  // sceneryData: API.ActiveSceneries.Data,
): ScheduledTrain[] {
  // stationGeneralInfo?.checkpoints.forEach((cp) => (cp.scheduledTrains.length = 0));

  return trainList.reduce((acc: ScheduledTrain[], train) => {
    if (!train.timetableData) return acc;
    if (train.region != region) return acc;

    const timetable = train.timetableData;
    if (!timetable.sceneryNames.includes(stationName)) return acc;

    const checkpoints = [stationName];
    if (stationGeneralInfo?.checkpoints) checkpoints.push(...stationGeneralInfo.checkpoints);

    const checkpointScheduledTrains: ScheduledTrain[] = [];
    for (let i = 0; i < timetable.followingStops.length; i++) {
      if (
        new RegExp(`^(${checkpoints.join('|')})$`, 'i').test(
          timetable.followingStops[i].stopNameRAW
        )
      ) {
        checkpointScheduledTrains.push(getCheckpointTrain(train, i, stationName));
      }
    }

    acc.push(...checkpointScheduledTrains);
    return acc;
  }, []) as ScheduledTrain[];
}

export function getStationTrains(
  trainList: Train[],
  scheduledTrainList: ScheduledTrain[],
  region: string,
  stationName: string
): StationTrain[] {
  return trainList
    .filter(
      (train) =>
        train?.region === region && train.online && train.currentStationName === stationName
    )
    .map((train) => ({
      driverName: train.driverName,
      driverId: train.driverId,
      trainNo: train.trainNo,
      trainId: train.trainId,
      stopStatus:
        scheduledTrainList.find((st) => st.trainNo === train.trainNo)?.stopStatus || 'no-timetable'
    }));
}
