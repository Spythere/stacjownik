import { defineStore } from 'pinia';
import http from '../http';
import { API } from '../typings/api';
import axios from 'axios';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';

// Update seconds cron for active data scheduler
const UPDATE_SECONDS = [3, 23, 43];

export const useApiStore = defineStore('apiStore', {
  state: () => ({
    dataStatuses: {
      connection: Status.Data.Loading,
      sceneries: Status.Data.Loading
    },

    activeData: undefined as API.ActiveData.Response | undefined,
    rollingStockData: undefined as API.RollingStock.Response | undefined,
    donatorsData: [] as API.Donators.Response,
    sceneryData: [] as StationJSONData[],

    activeDataScheduler: undefined as number | undefined
  }),

  actions: {
    async setupAPIData() {
      // Static data
      this.fetchStockInfoData();
      this.fetchDonatorsData();
      this.fetchStationsGeneralInfo();

      // Active data schedueler
      this.fetchActiveData();
      this.setupActiveDataFetcher();
    },

    async setupActiveDataFetcher() {
      if (this.activeDataScheduler) return;

      this.dataStatuses.connection = Status.Data.Loading;

      this.activeDataScheduler = window.setInterval(() => {
        if (UPDATE_SECONDS.includes(new Date().getSeconds())) {
          this.fetchActiveData();
        }
      }, 1000);
    },

    async fetchActiveData() {
      try {
        const response = await http.get<API.ActiveData.Response>('api/getActiveData');

        this.activeData = response.data;
        this.dataStatuses.connection = Status.Data.Loaded;

        console.log('Fetching active data at ' + new Date().toLocaleTimeString('pl-PL'));
      } catch (error) {
        this.dataStatuses.connection = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania danych online:', error);
      }
    },

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
