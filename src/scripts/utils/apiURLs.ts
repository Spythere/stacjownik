export const URLs = {
  sceneryData: "https://spythere.github.io/api/stationDataDev.json",
  sceneryDataDev: "http://127.0.0.1:8000/data",
  stations: "https://api.td2.info.pl:9640/?method=getStationsOnline",
  trains: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
  dispatchers: "https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1",
  getTimetableURL: (trainNo: string | number, region = "eu") => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3B${region}`
};