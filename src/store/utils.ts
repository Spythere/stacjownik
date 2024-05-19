import {
  TrainStop,
  StopStatus,
  Train,
  Station,
  StationTrain,
  ScenerySpawn,
  ScenerySpawnType
} from '../typings/common';

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

export function parseSpawns(spawnString: string | null): ScenerySpawn[] {
  if (!spawnString) return [];
  if (spawnString === 'NO_SPAWN') return [];

  return spawnString.split(';').map((spawn) => {
    const spawnArray = spawn.split(',');
    const spawnName = spawnArray[6] ? spawnArray[6] : spawnArray[0];
    const spawnLength = parseInt(spawnArray[2]);
    const isElectrified = spawnArray[3] == 'True';

    let spawnType: ScenerySpawnType = /EZT|POS|OSOB|PAS/i.test(spawnName)
      ? 'passenger'
      : /TOW/i.test(spawnName)
        ? 'freight'
        : /LUZ/i.test(spawnName)
          ? 'loco'
          : 'all';

    return { spawnName, spawnLength, isElectrified, spawnType };
  });
}

export function getTimestamp(date: string | null): number {
  return date ? new Date(date).getTime() : 0;
}
