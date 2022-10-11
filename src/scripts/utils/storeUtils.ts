import ScheduledTrain from '../interfaces/ScheduledTrain';
import Train from '../interfaces/Train';
import TrainStop from '../interfaces/TrainStop';

export const getLocoURL = (locoType: string): string =>
  `https://rj.td2.info.pl/dist/img/thumbnails/${locoType.includes('EN') ? locoType + 'rb' : locoType}.png`;

export const getStatusID = (stationStatus: any): string => {
  if (!stationStatus) return 'unknown';
  if (stationStatus == -1) return 'not-signed';

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
      if (statusTimestamp - Date.now() > 21000000) return 'no-limit';

      return 'online';

    case 1:
      return 'brb';

    case 2:
      if (statusTimestamp == 0) return 'ending';
      break;

    case 3:
      return 'no-space';

    default:
      break;
  }

  return 'unavailable';
};

export const getStatusTimestamp = (stationStatus: any): number => {
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
};

export const parseSpawns = (spawnString: string) => {
  if (!spawnString) return [];
  if (spawnString === 'NO_SPAWN') return [];

  return spawnString.split(';').map((spawn) => {
    const spawnArray = spawn.split(',');
    const spawnName = spawnArray[6] ? spawnArray[6] : spawnArray[0];
    const spawnLength = parseInt(spawnArray[2]);

    return { spawnName, spawnLength };
  });
};

export const getTimestamp = (date: string | null): number => (date ? new Date(date).getTime() : 0);

export const getTrainStopStatus = (stopInfo: TrainStop, currentStationName: string, stationName: string) => {
  let stopStatus = '',
    stopLabel = '',
    stopStatusID = -1;

  if (stopInfo.terminatesHere && stopInfo.confirmed) {
    stopStatus = 'terminated';
    stopLabel = 'Skończył bieg';
    stopStatusID = 5;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName == stationName) {
    stopStatus = 'departed';
    stopLabel = 'Odprawiony';
    stopStatusID = 2;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && currentStationName != stationName) {
    stopStatus = 'departed-away';
    stopLabel = 'Odjechał';
    stopStatusID = 4;
  } else if (currentStationName == stationName && !stopInfo.stopped) {
    stopStatus = 'online';
    stopLabel = 'Na stacji';
    stopStatusID = 0;
  } else if (currentStationName == stationName && stopInfo.stopped) {
    stopStatus = 'stopped';
    stopLabel = 'Postój';
    stopStatusID = 1;
  } else if (currentStationName != stationName) {
    stopStatus = 'arriving';
    stopLabel = 'W drodze';
    stopStatusID = 3;
  }

  return { stopStatus, stopLabel, stopStatusID };
};

export function getScheduledTrain(train: Train, trainStopIndex: number, stationName: string): ScheduledTrain {
  const timetable = train.timetableData!;
  const followingStops = timetable.followingStops;
  const trainStop = followingStops[trainStopIndex];

  const trainStopStatus = getTrainStopStatus(trainStop, train.currentStationName, stationName);

  let prevStationName = '',
    nextStationName = '';

  let prevDepartureLine: string | null = null,
    nextArrivalLine: string | null = null;

  for (let i = trainStopIndex - 1; i >= 0; i--) {
    if (/strong|podg/g.test(followingStops[i].stopName)) {
      prevStationName = followingStops[i].stopNameRAW.replace(/,.*/g,"");

      break;
    }
  }

  for (let i = trainStopIndex + 1; i < followingStops.length; i++) {
    if (/strong|podg/g.test(followingStops[i].stopName)) {
      nextStationName = followingStops[i].stopNameRAW.replace(/,.*/g,"");

      break;
    }
  }

  let departureLine: string | null = trainStop.departureLine;
  let arrivingLine: string | null = trainStop.arrivalLine;

  for (let i = trainStopIndex; i < followingStops.length; i++) {
    const currentStop = followingStops[i];

    if (currentStop.departureLine == null) continue;

    if (!/-|_|it|sbl/gi.test(currentStop.departureLine)) {
      departureLine = currentStop.departureLine;
      nextArrivalLine = followingStops[i + 1]?.arrivalLine || null;

      break;
    }
  }

  for (let i = trainStopIndex; i >= 0; i--) {
    const currentStop = followingStops[i];

    if (currentStop.arrivalLine == null) continue;

    if (!/-|_|it|sbl/gi.test(currentStop.arrivalLine)) {
      arrivingLine = currentStop.arrivalLine;
      prevDepartureLine = followingStops[i - 1]?.departureLine || null;

      break;
    }
  }

  return {
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

    arrivingLine,
    departureLine,

    nextArrivalLine,
    prevDepartureLine,
  };
}
