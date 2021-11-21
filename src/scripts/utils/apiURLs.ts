export const URLs = {
  sceneryData: "https://spythere.github.io/api/stationData.json",
  stations: "https://api.td2.info.pl:9640/?method=getStationsOnline",
  trains: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
  dispatchers: "https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1",
  getTimetableURL: (trainNo: string | number) => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`
};