import { defineStore } from 'pinia';
import { API } from '../typings/api';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';
import { HttpClient } from '../http';
import { getRandomDurationFromRange } from './utils';

let baseURL = 'https://stacjownik.spythere.eu';

switch (import.meta.env.VITE_API_MODE) {
  case 'development':
    baseURL = 'http://localhost:3001';
    break;
  case 'mocking':
    baseURL = 'http://localhost:3123';
    break;
  default:
    break;
}

export const useApiStore = defineStore('apiStore', {
  state: () => ({
    dataStatuses: {
      allData: Status.Data.Loading,
      connection: Status.Data.Loading,
      sceneries: Status.Data.Loading,
      vehicles: Status.Data.Loading,
      dailyStatsData: Status.Data.Loading
    },

    activeData: undefined as API.ActiveData.Response | undefined,
    vehiclesData: undefined as API.VehiclesData.Response | undefined,

    donatorsData: [] as API.Donators.Response,
    sceneryData: [] as StationJSONData[],

    dailyStatsData: null as API.DailyStats.Response | null,

    nextUpdateTime: 0,
    nextDataCheckTime: 0,

    client: new HttpClient(baseURL),

    activeDataScheduler: undefined as number | undefined
  }),

  actions: {
    async setupAPIData() {
      this.connectToAPI();
    },

    async connectToAPI() {
      window.requestAnimationFrame(this.updateTick);
    },

    async updateTick(t: number) {
      // Static data refresh
      if (t >= this.nextDataCheckTime) {
        await Promise.all([
          this.fetchStationsGeneralInfo(),
          this.fetchVehiclesInfo(),
          this.fetchDonatorsData()
        ]);

        if (this.nextDataCheckTime == 0) {
          this.nextDataCheckTime = getRandomDurationFromRange(5000, 7500);
        } else {
          this.nextDataCheckTime = getRandomDurationFromRange(600000, 720000);
        }

        console.log(
          'Next data check at:',
          new Date(Date.now() + this.nextDataCheckTime).toLocaleTimeString()
        );
      }

      // Active data fefresh
      if (t >= this.nextUpdateTime) {
        await this.fetchActiveData();
        this.nextUpdateTime = t + 31000;
      }

      window.requestAnimationFrame(this.updateTick);
    },

    async fetchActiveData() {
      if (this.dataStatuses.connection == Status.Data.Offline) return;
      if (!this.activeData) this.dataStatuses.connection = Status.Data.Loading;

      try {
        const response = await this.client.get<API.ActiveData.Response>('api/getActiveData');

        this.activeData = response;
        this.dataStatuses.connection = Status.Data.Loaded;
      } catch (error) {
        this.dataStatuses.connection = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania danych online:', error);
      }
    },

    async fetchDonatorsData() {
      try {
        const response = await this.client.get<API.Donators.Response>('api/getDonators');

        this.donatorsData = response;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o donatorach:', error);
      }
    },

    async fetchStationsGeneralInfo() {
      try {
        const sceneryData = await this.client.get<StationJSONData[]>(`api/getSceneries`);

        this.dataStatuses.sceneries = Status.Data.Loaded;
        this.sceneryData = sceneryData;
      } catch (error) {
        this.dataStatuses.sceneries = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o sceneriach:', error);
      }
    },

    async fetchVehiclesInfo() {
      try {
        const response = await this.client.get<API.VehiclesData.Response>('api/getVehiclesData');

        this.vehiclesData = response;
        this.dataStatuses.vehicles = response ? Status.Data.Loaded : Status.Data.Warning;
      } catch (error) {
        this.dataStatuses.vehicles = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o pojazdach:', error);
      }
    },

    async fetchDailyStats() {
      try {
        const res = await this.client.get<API.DailyStats.Response>('api/getDailyStats');

        this.dailyStatsData = res;

        this.dataStatuses.dailyStatsData = Status.Data.Loaded;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
        this.dataStatuses.dailyStatsData = Status.Data.Error;
      }
    }
  }
});
