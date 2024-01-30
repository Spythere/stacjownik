import { defineStore } from 'pinia';
import http from '../http';
import { API, Websocket } from '../typings/api';
import axios from 'axios';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';
import { io } from 'socket.io-client';
import packageInfo from '../../package.json';

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

    websocketData: undefined as Websocket.Payload | undefined

    // activeDataTimeout: undefined as number | undefined
  }),

  actions: {
    async setupStaticAPIData() {
      // Static data
      this.fetchStockInfoData();
      this.fetchDonatorsData();
      this.fetchStationsGeneralInfo();
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
