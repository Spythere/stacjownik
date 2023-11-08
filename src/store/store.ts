import axios from 'axios';
import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { DataStatus } from '../scripts/enums/DataStatus';
import StationRoutes from '../scripts/interfaces/StationRoutes';
import Train from '../scripts/interfaces/Train';
import { URLs } from '../scripts/utils/apiURLs';
import { parseSpawns, getScheduledTrains, getStationTrains } from '../scripts/utils/storeUtils';

import {
  APIData,
  OnlineScenery,
  StationJSONData,
  StoreState
} from '../scripts/interfaces/store/storeTypes';

import packageInfo from '../../package.json';
import { RollingStockGithubData } from '../scripts/interfaces/github_api/StockInfoGithubData';
import { ScheduledTrain } from '../scripts/interfaces/ScheduledTrain';
import { DispatcherStatus } from '../scripts/enums/DispatcherStatus';

export const useStore = defineStore('store', {
  state: () =>
    ({
      apiData: {} as unknown,
      rollingStockData: undefined,

      stationList: [],
      regionOnlineCounters: [],

      routesList: [],

      sceneryData: [],
      lastDispatcherStatuses: [],

      region: { id: 'eu', value: 'PL1' },

      trainCount: 0,
      stationCount: 0,

      webSocket: undefined,
      isOffline: false,

      dispatcherStatsName: '',
      dispatcherStatsData: undefined,

      driverStatsName: '',
      driverStatsData: undefined,
      driverStatsStatus: DataStatus.Initialized,

      chosenModalTrainId: undefined,

      dataStatuses: {
        connection: DataStatus.Loading,
        sceneries: DataStatus.Loading,
        timetables: DataStatus.Loading,
        dispatchers: DataStatus.Loading,
        trains: DataStatus.Loading
      },

      currentStatsTab: null,

      blockScroll: false,
      listenerLaunched: false,
      modalLastClickedTarget: null
    }) as StoreState,

  getters: {
    trainList(): Train[] {
      return (this.apiData?.trains ?? [])
        .filter((train) => train.online || train.timetable || train.lastSeen > Date.now() - 180000)
        .map((train) => {
          const stock = train.stockString.split(';');
          const locoType = stock ? stock[0] : train.stockString;

          const timetable = train.timetable;

          return {
            trainId: train.driverName + train.trainNo.toString(),

            trainNo: train.trainNo,
            mass: train.mass,
            length: train.length,
            speed: train.speed,
            region: train.region,

            distance: train.distance,
            signal: train.signal,
            online: train.online,
            driverId: train.driverId,
            driverName: train.driverName,
            currentStationName: train.currentStationName,
            currentStationHash: train.currentStationHash,
            connectedTrack: train.connectedTrack,
            stockList: stock,
            locoType,

            lastSeen: train.lastSeen,
            isTimeout: train.isTimeout,

            isSupporter: train.driverIsSupporter,
            driverLevel: train.driverLevel,

            timetableData: timetable
              ? {
                  timetableId: timetable.timetableId,
                  SKR: timetable.SKR,
                  TWR: timetable.TWR,
                  route: timetable.route,
                  category: timetable.category,
                  followingStops: timetable.stopList,
                  routeDistance: timetable.stopList[timetable.stopList.length - 1].stopDistance,
                  sceneries: timetable.sceneries
                }
              : undefined
          } as Train;
        });
    },

    onlineSceneryList(state): OnlineScenery[] {
      if (state.isOffline) return [];
      if (!state.apiData?.activeSceneries) return [];

      return state.apiData?.activeSceneries.reduce((list, scenery) => {
        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return list;
        if (scenery.dispatcherStatus == DispatcherStatus.UNKNOWN) return list;

        const station = this.stationList.find((s) => s.name === scenery.stationName);

        const scheduledTrains = getScheduledTrains(this.trainList, scenery, station?.generalInfo);

        const stationTrains = getStationTrains(
          this.trainList,
          scheduledTrains,
          this.region.id,
          scenery
        );

        // Remove checkpoint duplicates
        const uniqueScheduledTrains = scheduledTrains.reduce(
          (uniqueList, sTrain) =>
            uniqueList.find((v) => v.trainId === sTrain.trainId)
              ? uniqueList
              : [...uniqueList, sTrain],
          [] as ScheduledTrain[]
        );

        list.push({
          name: scenery.stationName,
          hash: scenery.stationHash,
          region: scenery.region,
          maxUsers: scenery.maxUsers,
          currentUsers: scenery.currentUsers,
          spawns: parseSpawns(scenery.spawnString),
          dispatcherName: scenery.dispatcherName,
          dispatcherRate: scenery.dispatcherRate,
          dispatcherId: scenery.dispatcherId,
          dispatcherExp: scenery.dispatcherExp,
          dispatcherIsSupporter: scenery.dispatcherIsSupporter,
          scheduledTrains: scheduledTrains,
          stationTrains: stationTrains,
          dispatcherStatus: scenery.dispatcherStatus,

          isOnline: scenery.isOnline == 1,

          scheduledTrainCount: {
            all: uniqueScheduledTrains.length,
            confirmed: uniqueScheduledTrains.filter((train) => train.stopInfo.confirmed).length,
            unconfirmed: uniqueScheduledTrains.filter((train) => !train.stopInfo.confirmed).length
          }
        });

        return list;
      }, [] as OnlineScenery[]);
    }
  },
  actions: {
    async fetchStationsGeneralInfo() {
      const sceneryData: StationJSONData[] = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getSceneries`)
      ).data;

      if (!sceneryData) {
        this.dataStatuses.sceneries = DataStatus.Error;
        return;
      }

      this.stationList = sceneryData.map((scenery) => {
        return {
          name: scenery.name,

          generalInfo: {
            ...scenery,
            authors: scenery.authors?.split(',').map((a) => a.trim()),
            routes:
              scenery.routesInfo.reduce(
                (acc, route) => {
                  const propName: keyof StationRoutes = `${
                    route.routeTracks == 2 ? 'twoWay' : 'oneWay'
                  }${route.isElectric ? '' : 'No'}CatenaryRouteNames`;

                  acc[route.routeTracks == 2 ? 'twoWay' : 'oneWay'].push({
                    name: route.routeName,
                    SBL: route.isRouteSBL,
                    TWB: false,
                    catenary: route.isElectric,
                    isInternal: route.isInternal,
                    tracks: route.routeTracks,
                    length: route.routeLength,
                    speed: route.routeSpeed
                  });

                  if (!route.isInternal) acc[propName].push(route.routeName);

                  if (route.isRouteSBL) acc['sblRouteNames'].push(route.routeName);

                  return acc;
                },
                {
                  oneWay: [],
                  twoWay: [],
                  sblRouteNames: [],
                  oneWayCatenaryRouteNames: [],
                  oneWayNoCatenaryRouteNames: [],
                  twoWayCatenaryRouteNames: [],
                  twoWayNoCatenaryRouteNames: []
                } as StationRoutes
              ) || {},
            checkpoints: scenery.checkpoints
              ? scenery.checkpoints
                  .split(';')
                  .map((sub) => ({ checkpointName: sub, scheduledTrains: [] }))
              : []
          }
        };
      });
    },

    async connectToWebsocket() {
      if (import.meta.env.VITE_APP_WS_DEV === '1') {
        const mockWebsocketData = await import('../data/mockWebsocketData.json');
        this.dataStatuses.connection = DataStatus.Loaded;
        this.apiData = mockWebsocketData as any;
        this.setStatuses();

        console.warn('Stacjownik działa w trybie mockowania danych z WS');

        return;
      }

      const socket = io(URLs.stacjownikAPI, {
        transports: ['websocket', 'polling'],
        rememberUpgrade: true,
        reconnection: true
      });

      socket.emit('CONNECTION', { version: packageInfo.version });

      socket.on('connect_error', () => {
        this.dataStatuses.connection = DataStatus.Error;
      });

      socket.on('UPDATE', (data: APIData) => {
        this.apiData = data;
        this.dataStatuses.connection = DataStatus.Loaded;

        this.setStatuses();
      });

      socket.emit('FETCH_DATA', { version: packageInfo.version }, (data: APIData) => {
        this.dataStatuses.connection = DataStatus.Loaded;
        this.apiData = data;
        this.setStatuses();
      });

      this.webSocket = socket;
    },

    async connectToAPI() {
      this.connectToWebsocket();
      this.fetchStockInfoData();
      this.fetchStationsGeneralInfo();
    },

    async changeRegion(region: StoreState['region']) {
      this.region = region;
    },

    async fetchStockInfoData() {
      try {
        this.rollingStockData = (
          await axios.get<RollingStockGithubData>(
            'https://raw.githubusercontent.com/Spythere/api/main/td2/data/stockInfo.json'
          )
        ).data;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o taborze z API:', error);
      }
    },

    async setStatuses() {
      if (!this.apiData.stations) {
        this.dataStatuses.sceneries = DataStatus.Error;
        this.dataStatuses.trains = DataStatus.Error;
        this.dataStatuses.dispatchers = DataStatus.Error;

        return;
      }

      this.dataStatuses.sceneries = DataStatus.Loaded;
      this.dataStatuses.trains = !this.apiData.trains ? DataStatus.Warning : DataStatus.Loaded;
      this.dataStatuses.dispatchers = !this.apiData.dispatchers
        ? DataStatus.Warning
        : DataStatus.Loaded;

      // if (this.apiData.dispatchers != null) this.lastDispatcherStatuses = prevDispatcherStatuses;
    }
  }
});
