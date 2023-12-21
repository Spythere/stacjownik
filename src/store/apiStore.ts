import { defineStore } from 'pinia';
import http from '../http';
import { API } from '../typings/api';
import axios from 'axios';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';

export const useApiStore = defineStore('apiStore', {
  state: () => ({
    dataStatuses: {
      connection: Status.Data.Loading,
      sceneries: Status.Data.Loading,
      timetables: Status.Data.Loading,
      dispatchers: Status.Data.Loading,
      trains: Status.Data.Loading
    },

    activeData: undefined as API.ActiveData.Response | undefined,
    rollingStockData: undefined as API.RollingStock.Response | undefined,
    donatorsData: [] as API.Donators.Response,
    sceneryData: [] as StationJSONData[],

    activeDataTimeout: undefined as number | undefined
  }),

  actions: {
    async setupAPI() {
      // Static data
      this.fetchStockInfoData();
      this.fetchDonatorsData();
      this.fetchStationsGeneralInfo();

      if (this.activeDataTimeout === undefined) this.startActiveDataScheduler();
    },

    // async setDataStatuses() {
    //   if (!window.navigator.onLine) {
    //     this.dataStatuses.connection = Status.Data.Offline;
    //     this.dataStatuses.sceneries = Status.Data.Offline;
    //     this.dataStatuses.trains = Status.Data.Offline;
    //     this.dataStatuses.dispatchers = Status.Data.Offline;
    //     this.dataStatuses.timetables = Status.Data.Offline;
    //   }

    //   if (!this.activeData?.activeSceneries) {
    //     this.dataStatuses.connection = Status.Data.Loaded;
    //     this.dataStatuses.sceneries = Status.Data.Error;
    //     this.dataStatuses.trains = Status.Data.Error;
    //     this.dataStatuses.dispatchers = Status.Data.Error;

    //     return;
    //   }

    //   this.dataStatuses.connection = Status.Data.Loaded;
    //   this.dataStatuses.sceneries = Status.Data.Loaded;
    //   this.dataStatuses.trains = !this.activeData.trains ? Status.Data.Warning : Status.Data.Loaded;
    //   this.dataStatuses.dispatchers = Status.Data.Loaded;
    // },

    async fetchDonatorsData() {
      try {
        const response = await http.get<API.Donators.Response>('api/getDonators');

        this.donatorsData = response.data;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o donatorach:', error);
      }
    },

    async fetchStockInfoData() {
      try {
        this.rollingStockData = (
          await axios.get<API.RollingStock.Response>(
            'https://raw.githubusercontent.com/Spythere/api/main/td2/data/stockInfo.json'
          )
        ).data;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o taborze z API:', error);
      }
    },

    async startActiveDataScheduler() {
      if (!window.navigator.onLine) {
        this.dataStatuses.connection = Status.Data.Offline;
        return;
      }

      if (import.meta.env.VITE_API_MODE === 'mock') {
        const mockActiveData = await import('../data/mockActiveData.json');
        this.dataStatuses.connection = Status.Data.Loaded;
        this.activeData = mockActiveData;

        console.warn('Stacjownik działa w trybie mockowania danych z WS');

        return;
      }

      try {
        const data = (await http.get<API.ActiveData.Response>('api/getActiveData')).data;

        this.activeData = data;
        this.dataStatuses.connection = Status.Data.Loaded;
      } catch (error) {
        this.dataStatuses.connection = Status.Data.Error;
        console.error('Wystąpił błąd podczas pobierania danych online z API!');
      } finally {
        this.activeDataTimeout = window.setTimeout(
          () => {
            this.startActiveDataScheduler();
          },
          ~~(1000 * (Math.random() * (25 - 20) + 25))
        );
      }
    },

    async stopActiveDataScheduler() {
      window.clearTimeout(this.activeDataTimeout);
      this.activeDataTimeout = undefined;
    },

    async fetchStationsGeneralInfo() {
      const sceneryData: StationJSONData[] = (await http.get<StationJSONData[]>('api/getSceneries'))
        .data;

      if (!sceneryData) {
        this.dataStatuses.sceneries = Status.Data.Error;
        return;
      }

      this.dataStatuses.sceneries = Status.Data.Loaded;
      this.sceneryData = sceneryData;
    }
  }
});
