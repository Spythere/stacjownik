export function parseStopListString(stopListString: string) {
  return stopListString.split('~~').map((stopStringData) => {
    const [
      arrivalLine,
      arrivalTimestamp,
      stopName,
      stopTime,
      mainStop,
      stopDistance,
      departureTimestamp,
      departureLine
    ] = stopStringData.split(';');

    return {
      arrivalLine,
      arrivalTimestamp,
      stopName,
      stopTime,
      mainStop,
      stopDistance,
      departureTimestamp,
      departureLine
    };
  });
}

export function parsePathString(pathString: string) {
  return pathString.split(';').map((pathEl) => {
    const [arrival, station, departure] = pathEl.split(',');

    return {
      arrivalLine: arrival,
      departureLine: departure,
      stationName: station.split(' ').slice(0, -1).join(' '),
      stationHash: station.split(' ').slice(-1).join(' ').replace('.sc', '')
    };
  });
}
