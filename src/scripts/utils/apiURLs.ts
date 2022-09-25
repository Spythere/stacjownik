export const URLs = {
  stacjownikAPI:
    import.meta.env.VITE_APP_API_DEV == 1 && !import.meta.env.PROD
      ? 'http://localhost:3000'
      : 'https://stacjownik-api.up.railway.app',
  stacjownikAPIDev: 'localhost:3000',
  // trains: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
  // getTimetableURL: (trainNo: string | number, region = "eu") => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3B${region}`
};
