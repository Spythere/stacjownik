import { defineStore } from 'pinia';
import { API } from '../typings/api';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';
import axios, { AxiosInstance } from 'axios';

export enum APIMode {
  PRODUCTION = 0,
  DEV = 1,
  MOCK = 2
}

export const useApiStore = defineStore('apiStore', {
  state: () => ({
    dataStatuses: {
      connection: Status.Data.Loading,
      sceneries: Status.Data.Loading
    },

    activeData: undefined as API.ActiveData.Response | undefined,
    donatorsData: [] as API.Donators.Response,
    sceneryData: [] as StationJSONData[],

    lastFetchData: new Date(),

    client: undefined as AxiosInstance | undefined,

    activeDataScheduler: undefined as number | undefined
  }),

  actions: {
    async setupAPIData() {
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

      this.client = axios.create({
        baseURL
      });

      this.connectToAPI();
    },

    async connectToAPI() {
      // Static data
      this.fetchDonatorsData();
      this.fetchStationsGeneralInfo();

      // Active data schedueler
      this.fetchActiveData();
      // this.setupActiveDataFetcher();
    },

    async setupActiveDataFetcher() {
      if (this.activeDataScheduler) return;

      this.activeDataScheduler = window.setInterval(() => {
        this.fetchActiveData();
      }, 25000);
    },

    async fetchActiveData() {
      if (!this.activeData) this.dataStatuses.connection = Status.Data.Loading;

      try {
        console.log('Fetching active data at ' + new Date().toLocaleTimeString('pl-PL'));

        const response = await this.client!.get<API.ActiveData.Response>('api/getActiveData');
        console.log(response);

        this.activeData = response.data;
        this.lastFetchData = new Date();
        this.dataStatuses.connection = Status.Data.Loaded;
      } catch (error) {
        this.dataStatuses.connection = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania danych online:', error);
      }
    },

    async fetchDonatorsData() {
      try {
        const response = await this.client!.get<API.Donators.Response>('api/getDonators');

        this.donatorsData = response.data;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o donatorach:', error);
      }
    },

    async fetchStationsGeneralInfo() {
      const sceneryData: StationJSONData[] = (
        await this.client!.get<StationJSONData[]>('api/getSceneries')
      ).data;

      if (!sceneryData) {
        this.dataStatuses.sceneries = Status.Data.Error;
        return;
      }

      this.dataStatuses.sceneries = Status.Data.Loaded;
      this.sceneryData = sceneryData;
    }
  }
});
