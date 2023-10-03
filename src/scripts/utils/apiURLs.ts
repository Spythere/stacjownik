export const URLs = {
  stacjownikAPI:
    import.meta.env.VITE_APP_API_DEV === "1" && !import.meta.env.PROD
      ? 'http://localhost:3001'
      : 'https://stacjownik.spythere.pl',
  stacjownikAPIDev: 'localhost:3000',
};
