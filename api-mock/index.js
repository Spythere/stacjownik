import express from 'express';
import path from 'path';
import { cwd } from 'process';
import cors from 'cors';

const app = express();

app.use(cors());

app.get('/api/getActiveData', (_, res) => {
  res.sendFile(path.join(cwd(), 'endpoints', 'getActiveData.json'));
});

app.get('/api/getSceneries', (_, res) => {
  res.sendFile(path.join(cwd(), 'endpoints', 'getSceneries.json'));
});

app.get('/api/getVehiclesData', (_, res) => {
  res.sendFile(path.join(cwd(), 'endpoints', 'getVehiclesData.json'));
});

app.get('/api/getDonators', (_, res) => {
  res.sendFile(path.join(cwd(), 'endpoints', 'getDonators.json'));
});

app.listen(3123, () => {
  console.log('Mocking API server...');
});
