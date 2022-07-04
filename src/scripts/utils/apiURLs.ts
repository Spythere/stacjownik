export const URLs = {
  stacjownikAPI: process.env.VUE_APP_API_DEV != 1 ? 'https://stacjownik.eu-4.evennode.com' : 'http://localhost:3000',
  stacjownikAPIDev: 'localhost:3000',
  // trains: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
  // getTimetableURL: (trainNo: string | number, region = "eu") => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3B${region}`
};
