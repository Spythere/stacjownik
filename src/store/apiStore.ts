import { defineStore } from 'pinia';
import { API } from '../typings/api';
import { Status } from '../typings/common';
import { StationJSONData } from './typings';
import axios, { AxiosInstance } from 'axios';

export const useApiStore = defineStore('apiStore', {
  state: () => ({
    dataStatuses: {
      connection: Status.Data.Loading,
      sceneries: Status.Data.Loading,
      vehicles: Status.Data.Loading
    },

    activeData: undefined as API.ActiveData.Response | undefined,
    vehiclesData: undefined as API.Vehicles.Response | undefined,

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
      this.fetchVehiclesInfo();
    },

    async fetchActiveData() {
      if (import.meta.env.VITE_API_ACTIVE_DATA_MODE == 'mocking') {
        import('../../tests/data/getActiveData.json').then((data) => {
          console.warn('activeData: mocking mode');
          this.activeData = data.default as API.ActiveData.Response;
          this.lastFetchData = new Date();

          this.dataStatuses.connection = Status.Data.Loaded;
        });

        return;
      }

      if (!this.activeData) this.dataStatuses.connection = Status.Data.Loading;

      try {
        const response = await this.client!.get<API.ActiveData.Response>('api/getActiveData');

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
      try {
        const sceneryData: StationJSONData[] = (
          await this.client!.get<StationJSONData[]>('api/getSceneries')
        ).data;

        this.dataStatuses.sceneries = Status.Data.Loaded;
        this.sceneryData = sceneryData;
      } catch (error) {
        this.dataStatuses.sceneries = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o sceneriach:', error);
      }
    },

    async fetchVehiclesInfo() {
      if (import.meta.env.VITE_API_VEHICLES_MODE == 'mocking') {
        import('../../tests/data/vehicles.json').then((data) => {
          console.warn('vehicles.json: mocking mode');
          this.vehiclesData = data.default;
          this.dataStatuses.vehicles = Status.Data.Loaded;
        });

        return;
      }

      try {
        const response = await this.client!.get<API.Vehicles.Response>('vehicles');

        this.vehiclesData = response.data;
        this.dataStatuses.vehicles = response.data ? Status.Data.Loaded : Status.Data.Warning;
      } catch (error) {
        this.dataStatuses.vehicles = Status.Data.Error;
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o pojazdach:', error);
      }
    }
  }
});
