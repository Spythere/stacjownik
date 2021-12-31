import Station from "../interfaces/Station";
import TrainStop from "../interfaces/TrainStop";

export const getLocoURL = (locoType: string): string => (`https://rj.td2.info.pl/dist/img/thumbnails/${locoType.includes("EN") ? locoType + "rb" : locoType}.png`)

export const getStatusID = (stationStatus: any): string => {
  if (!stationStatus) return "not-signed";

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
      if (statusTimestamp - Date.now() > 21000000) return "no-limit";

      return "online";

    case 1:
      return "brb";

    case 2:
      if (statusTimestamp == 0) return "ending";
      break;

    case 3:
      return "no-space";

    default:
      break;
  }

  return "unavailable";
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
  if (spawnString === "NO_SPAWN") return [];

  return spawnString.split(";").map(spawn => {
    const spawnArray = spawn.split(",");
    const spawnName = spawnArray[6] ? spawnArray[6] : spawnArray[0];
    const spawnLength = parseInt(spawnArray[2]);

    return { spawnName, spawnLength };
  });
};

export const getTimestamp = (date: string | null): number => (date ? new Date(date).getTime() : 0);

export const timestampToString = (timestamp: number | null): string =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

export const getTrainStopStatus = (stopInfo: TrainStop, timetableData: { currentStationName: string }, station: Station) => {
  let stopStatus = "",
    stopLabel = "",
    stopStatusID = -1;

  if (stopInfo.terminatesHere && stopInfo.confirmed) {
    stopStatus = "terminated";
    stopLabel = "Skończył bieg";
    stopStatusID = 5;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && timetableData.currentStationName == station.name) {
    stopStatus = "departed";
    stopLabel = "Odprawiony";
    stopStatusID = 2;
  } else if (!stopInfo.terminatesHere && stopInfo.confirmed && timetableData.currentStationName != station.name) {
    stopStatus = "departed-away";
    stopLabel = "Odjechał";
    stopStatusID = 4;
  } else if (timetableData.currentStationName == station.name && !stopInfo.stopped) {
    stopStatus = "online";
    stopLabel = "Na stacji";
    stopStatusID = 0;
  } else if (timetableData.currentStationName == station.name && stopInfo.stopped) {
    stopStatus = "stopped";
    stopLabel = "Postój";
    stopStatusID = 1;
  } else if (timetableData.currentStationName != station.name) {
    stopStatus = "arriving";
    stopLabel = "W drodze";
    stopStatusID = 3;
  }

  return { stopStatus, stopLabel, stopStatusID };
};