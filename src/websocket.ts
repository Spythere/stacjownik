import { io } from 'socket.io-client';

const URL =
  import.meta.env.VITE_WS_MODE === 'development'
    ? 'http://localhost:3001'
    : 'https://stacjownik.spythere.eu';

const socket = io(URL, {
  transports: ['websocket', 'polling'],
  rememberUpgrade: true,
  reconnection: true
});

export default socket;
