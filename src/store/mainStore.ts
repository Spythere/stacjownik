import axios from 'axios';
import { defineStore } from 'pinia';
import StationRoutes from '../scripts/interfaces/StationRoutes';
import Train from '../scripts/interfaces/Train';
import { URLs } from '../scripts/utils/apiURLs';
import { parseSpawns, getScheduledTrains, getStationTrains } from './utils';

import { OnlineScenery, ScheduledTrain, StationJSONData, StoreState } from './typings';

import { API } from '../typings/api';
import { Status } from '../typings/common';

const API_INTERVAL_MS = 30000;

export const useStore = defineStore('store', {
  state: () =>
    ({
      activeData: {} as unknown,
      rollingStockData: undefined,
      donatorsData: [],

      stationList: [],
      regionOnlineCounters: [],

      routesList: [],

      sceneryData: [],
      lastDispatcherStatuses: [],

      region: { id: 'eu', value: 'PL1' },

      trainCount: 0,
      stationCount: 0,

      isOffline: false,

      dispatcherStatsName: '',
      dispatcherStatsData: undefined,

      driverStatsName: '',
      driverStatsData: undefined,
      driverStatsStatus: Status.Data.Initialized,

      chosenModalTrainId: undefined,

      dataStatuses: {
        connection: Status.Data.Loading,
        sceneries: Status.Data.Loading,
        timetables: Status.Data.Loading,
        dispatchers: Status.Data.Loading,
        trains: Status.Data.Loading
      },

      currentStatsTab: null,

      blockScroll: false,
      listenerLaunched: false,
      modalLastClickedTarget: null,

      tooltip: {
        content: '',
        visible: false,
        x: 0,
        y: 0
      }
    }) as StoreState,

  getters: {
    trainList(): Train[] {
      return (this.activeData?.trains ?? [])
        .filter((train) => train.timetable || train.online)
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
            online: Boolean(train.online),
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
      if (!state.activeData?.activeSceneries) return [];

      return state.activeData?.activeSceneries.reduce((list, scenery) => {
        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return list;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return list;

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

        const dispatcherTimestamp =
          scenery.dispatcherStatus == Status.ActiveDispatcher.NO_LIMIT
            ? Date.now() + 25500000
            : scenery.dispatcherStatus > 5
            ? scenery.dispatcherStatus
            : null;

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
          dispatcherTimestamp: dispatcherTimestamp,

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
    async processStationsOnlineInfo() {
      if (!this.activeData.activeSceneries) return;

      const onlineSceneries = this.activeData.activeSceneries.reduce((acc, scenery) => {
        const savedStation = this.stationList.find((st) => scenery.stationName === st.name);

        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return acc;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return acc;

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

        const dispatcherTimestamp =
          scenery.dispatcherStatus == Status.ActiveDispatcher.NO_LIMIT
            ? Date.now() + 25500000
            : scenery.dispatcherStatus > 5
            ? scenery.dispatcherStatus
            : null;

        const onlineInfo = {
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
          dispatcherTimestamp: dispatcherTimestamp,

          isOnline: scenery.isOnline == 1,

          scheduledTrainCount: {
            all: uniqueScheduledTrains.length,
            confirmed: uniqueScheduledTrains.filter((train) => train.stopInfo.confirmed).length,
            unconfirmed: uniqueScheduledTrains.filter((train) => !train.stopInfo.confirmed).length
          }
        };

        if (savedStation) savedStation.onlineInfo = onlineInfo;
        else
          this.stationList.push({
            name: onlineInfo.name,
            onlineInfo: onlineInfo
          });

        acc.push(onlineInfo);

        return acc;
      }, [] as OnlineScenery[]);

      // Reset online info of already offline sceneries
      this.stationList
        .filter(
          (station) =>
            station.onlineInfo &&
            onlineSceneries.findIndex(
              (os) => os.region == station.onlineInfo!.region && station.name == os.name
            ) != -1
        )
        .forEach((station) => (station.onlineInfo = undefined));
    },
    async fetchStationsGeneralInfo() {
      const sceneryData: StationJSONData[] = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getSceneries`)
      ).data;

      if (!sceneryData) {
        this.dataStatuses.sceneries = Status.Data.Error;
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

    async fetchActiveData() {
      if (import.meta.env.VITE_APP_API_MODE === 'mock') {
        const mockActiveData = await import('../data/mockActiveData.json');
        this.dataStatuses.connection = Status.Data.Loaded;
        this.activeData = mockActiveData;
        this.setStatuses();

        console.warn('Stacjownik działa w trybie mockowania danych z WS');

        return;
      }

      try {
        const data = (
          await axios.get<API.ActiveData.Response>(`${URLs.stacjownikAPI}/api/getActiveData`)
        ).data;

        this.activeData = data;
        this.dataStatuses.connection = Status.Data.Loaded;

        this.setStatuses();
      } catch (error) {
        this.dataStatuses.connection = Status.Data.Error;
        console.error('Wystąpił błąd podczas pobierania danych online z API!');
      }
    },

    async setupAPI() {
      this.fetchActiveData();

      setInterval(() => {
        this.fetchActiveData();
      }, API_INTERVAL_MS);

      this.fetchStockInfoData();
      this.fetchDonatorsData();
      this.fetchStationsGeneralInfo();
    },

    async changeRegion(region: StoreState['region']) {
      this.region = region;
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

    async fetchDonatorsData() {
      try {
        const response = await axios.get<API.Donators.Response>(
          `${URLs.stacjownikAPI}/api/getDonators`
        );

        if (response.data) this.donatorsData = response.data;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania informacji o donatorach:', error);
      }
    },

    async setStatuses() {
      if (!this.activeData.activeSceneries) {
        this.dataStatuses.sceneries = Status.Data.Error;
        this.dataStatuses.trains = Status.Data.Error;
        this.dataStatuses.dispatchers = Status.Data.Error;

        return;
      }

      this.dataStatuses.sceneries = Status.Data.Loaded;
      this.dataStatuses.trains = !this.activeData.trains ? Status.Data.Warning : Status.Data.Loaded;
      this.dataStatuses.dispatchers = Status.Data.Loaded;
    }
  }
});
