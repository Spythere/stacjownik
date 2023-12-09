import axios from 'axios';

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_MODE === 'development'
      ? 'http://localhost:3001'
      : 'https://stacjownik.spythere.eu'
});

export default http;
