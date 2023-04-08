import axios from 'axios';
import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { DataStatus } from '../scripts/enums/DataStatus';
import StationAPIData from '../scripts/interfaces/api/StationAPIData';
import ScheduledTrain from '../scripts/interfaces/ScheduledTrain';
import Station from '../scripts/interfaces/Station';
import StationRoutes from '../scripts/interfaces/StationRoutes';
import Train from '../scripts/interfaces/Train';
import { URLs } from '../scripts/utils/apiURLs';
import {
  getLocoURL,
  getStatusTimestamp,
  getStatusID,
  getScheduledTrain,
  parseSpawns,
} from '../scripts/utils/storeUtils';
import { APIData, StationJSONData, StoreState } from '../scripts/interfaces/store/storeTypes';

export const useStore = defineStore('store', {
  state: () =>
    ({
      apiData: {} as unknown,

      stationList: [],
      trainList: [],
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
        trains: DataStatus.Loading,
      },

      currentStatsTab: 'daily',

      blockScroll: false,
      listenerLaunched: false,
    } as StoreState),

  actions: {
    setTrainsOnlineData() {
      const { trains } = this.apiData;

      if (!trains) return [];

      this.trainList = trains
        .filter(
          (train) =>
            train.region === this.region.id && (train.online || train.timetable || train.lastSeen > Date.now() - 180000)
        )
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
            locoType,
            locoURL: getLocoURL(locoType),
            cars: stock.slice(1),

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
                  sceneries: timetable.sceneries,
                }
              : undefined,
          } as Train;
        });
    },

    getDispatcherStatus(onlineStationData: StationAPIData) {
      const { dispatchers } = this.apiData;

      const prevDispatcherStatus = this.lastDispatcherStatuses.find(
        (dispatcher) => dispatcher.hash === onlineStationData.stationHash
      );

      const stationStatus = !dispatchers
        ? undefined
        : dispatchers.find(
            (status: string[]) => status[0] == onlineStationData.stationHash && status[1] == this.region.id
          ) || -1;

      const statusTimestamp =
        prevDispatcherStatus && !dispatchers ? prevDispatcherStatus.statusTimestamp : getStatusTimestamp(stationStatus);
      const statusID =
        prevDispatcherStatus && !dispatchers ? prevDispatcherStatus.statusID : getStatusID(stationStatus);

      return {
        hash: onlineStationData.stationHash,
        statusID,
        statusTimestamp,
      };
    },

    getScheduledTrains(stationGeneralInfo: Station['generalInfo'], stationAPIData: StationAPIData) {
      const stationName = stationAPIData.stationName.toLowerCase();

      stationGeneralInfo?.checkpoints.forEach((cp) => (cp.scheduledTrains.length = 0));

      return this.trainList.reduce((acc: ScheduledTrain[], train) => {
        if (!train.timetableData) return acc;

        const timetable = train.timetableData;
        if (!timetable.sceneries.includes(stationAPIData.stationHash)) return acc;

        const stopInfoIndex = timetable.followingStops.findIndex((stop) => {
          const stopName = stop.stopNameRAW.toLowerCase();

          if (stationName === stopName) return true;
          if (stopName.includes(stationName) && !stop.stopName.includes('po.') && !stop.stopName.includes('podg.'))
            return true;

          if (stationName.includes(stopName) && !stop.stopName.includes('po.') && !stop.stopName.includes('podg.'))
            return true;

          if (
            stopName.includes('podg.') &&
            stopName.split(', podg.')[0] &&
            stationName.includes(stopName.split(', podg.')[0])
          )
            return true;

          if (
            stationGeneralInfo &&
            stationGeneralInfo.checkpoints &&
            stationGeneralInfo.checkpoints.length > 0 &&
            stationGeneralInfo.checkpoints.some((cp) =>
              cp.checkpointName.toLowerCase().includes(stop.stopNameRAW.toLowerCase())
            )
          )
            return true;

          return false;
        });

        if (stopInfoIndex == -1) return acc;

        const scheduledStopTrain = getScheduledTrain(train, stopInfoIndex, stationAPIData.stationName);

        if (stationGeneralInfo?.checkpoints) {
          for (const checkpoint of stationGeneralInfo.checkpoints) {
            const index = timetable.followingStops.findIndex(
              (stop) => stop.stopNameRAW.toLowerCase() == checkpoint.checkpointName.toLowerCase()
            );

            if (index == -1) continue;

            const scheduledCheckpointTrain = getScheduledTrain(train, index, stationAPIData.stationName);
            checkpoint.scheduledTrains.push(scheduledCheckpointTrain);
          }
        }

        acc.push(scheduledStopTrain);
        return acc;
      }, []) as ScheduledTrain[];
    },

    getStationTrains(stationAPIData: StationAPIData) {
      return this.trainList
        .filter(
          (train) =>
            train?.region === this.region.id && train.online && train.currentStationName === stationAPIData.stationName
        )
        .map((train) => ({
          driverName: train.driverName,
          driverId: train.driverId,
          trainNo: train.trainNo,
          trainId: train.trainId,
        }));
    },

    setStationsOnlineInfo() {
      const onlineStationNames: string[] = [];
      const prevDispatcherStatuses: StoreState['lastDispatcherStatuses'] = [];

      if (this.isOffline) {
        this.stationList.forEach((station) => {
          station.onlineInfo = undefined;
        });

        return;
      }

      this.apiData.stations?.forEach((stationAPIData) => {
        if (stationAPIData.region !== this.region.id || !stationAPIData.isOnline) return;
        const station = this.stationList.find((s) => s.name === stationAPIData.stationName);

        onlineStationNames.push(stationAPIData.stationName);

        const dispatcherStatus = this.getDispatcherStatus(stationAPIData);
        prevDispatcherStatuses.push(dispatcherStatus);

        const stationTrains = this.getStationTrains(stationAPIData);
        const scheduledTrains = this.getScheduledTrains(station?.generalInfo, stationAPIData);

        const onlineInfo = {
          name: stationAPIData.stationName,
          hash: stationAPIData.stationHash,
          region: stationAPIData.region,
          maxUsers: stationAPIData.maxUsers,
          currentUsers: stationAPIData.currentUsers,
          spawns: parseSpawns(stationAPIData.spawnString),
          dispatcherName: stationAPIData.dispatcherName,
          dispatcherRate: stationAPIData.dispatcherRate,
          dispatcherId: stationAPIData.dispatcherId,
          dispatcherExp: stationAPIData.dispatcherExp,
          dispatcherIsSupporter: stationAPIData.dispatcherIsSupporter,
          stationTrains,
          statusTimestamp: dispatcherStatus.statusTimestamp,
          statusID: dispatcherStatus.statusID,
          scheduledTrains,
        };

        if (!station) {
          this.stationList.push({
            name: stationAPIData.stationName,
            onlineInfo,
          });

          return;
        }

        station.onlineInfo = { ...onlineInfo };

        this.stationList
          .filter((station) => !onlineStationNames.includes(station.name) && station.onlineInfo)
          .forEach((offlineStation) => {
            offlineStation.onlineInfo = undefined;
          });
      });

      if (this.apiData.dispatchers != null) this.lastDispatcherStatuses = prevDispatcherStatuses;
    },

    async fetchStationsGeneralInfo() {
      const sceneryData: StationJSONData[] = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getSceneries?timestamp=${Math.floor(Date.now() / 1800000)}`)
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
              scenery.routes
                ?.split(';')
                .filter((routeString) => routeString)
                .reduce(
                  (acc, routeString) => {
                    const specs1 = routeString.split('_')[0];
                    const isInternal = specs1.startsWith('!');
                    const name = isInternal ? specs1.replace('!', '') : specs1;

                    const specs2 = routeString.split('_')[1].split('');
                    const twoWay = specs2[0] == '2';
                    const catenary = specs2[1] == 'E';
                    const SBL = specs2[2] == 'S';
                    const TWB = specs2[3] ? true : false;
                    const speed = Number(routeString.split(':')[1]) || 0;
                    const length = Number(routeString.split(':')[2]) || 0;

                    const propName = twoWay
                      ? catenary
                        ? 'twoWayCatenaryRouteNames'
                        : 'twoWayNoCatenaryRouteNames'
                      : catenary
                      ? 'oneWayCatenaryRouteNames'
                      : 'oneWayNoCatenaryRouteNames';

                    acc[twoWay ? 'twoWay' : 'oneWay'].push({
                      name,
                      SBL,
                      TWB,
                      catenary,
                      isInternal,
                      tracks: twoWay ? 2 : 1,
                      length,
                      speed,
                    });
                    if (!isInternal) acc[propName].push(name);

                    if (SBL) acc['sblRouteNames'].push(name);

                    return acc;
                  },
                  {
                    oneWay: [],
                    twoWay: [],
                    sblRouteNames: [],
                    oneWayCatenaryRouteNames: [],
                    oneWayNoCatenaryRouteNames: [],
                    twoWayCatenaryRouteNames: [],
                    twoWayNoCatenaryRouteNames: [],
                  } as StationRoutes
                ) || {},
            checkpoints: scenery.checkpoints
              ? scenery.checkpoints.split(';').map((sub) => ({ checkpointName: sub, scheduledTrains: [] }))
              : [],
          },
        };
      });
    },

    connectToWebsocket() {
      const socket = io(URLs.stacjownikAPI, {
        // transports: ['websocket', 'polling'],
        rememberUpgrade: true,
        reconnection: true,
      });

      socket.on('connect_error', (err) => {
        this.dataStatuses.connection = DataStatus.Error;
      });

      socket.on('UPDATE', (data: APIData) => {
        this.apiData = data;
        this.dataStatuses.connection = DataStatus.Loaded;
        this.setOnlineData();
      });

      socket.emit('FETCH_DATA', {}, (data: APIData) => {
        this.dataStatuses.connection = DataStatus.Loaded;

        this.apiData = data;
        this.setOnlineData();
      });

      this.webSocket = socket;
    },

    async connectToAPI() {
      await this.fetchStationsGeneralInfo();

      this.connectToWebsocket();
    },

    async changeRegion(region: StoreState['region']) {
      this.region = region;

      await this.setOnlineData();
    },

    async setOnlineData() {
      if (!this.apiData.stations) {
        this.dataStatuses.sceneries = DataStatus.Error;
        this.dataStatuses.trains = DataStatus.Error;
        this.dataStatuses.dispatchers = DataStatus.Error;

        return;
      }

      this.dataStatuses.sceneries = DataStatus.Loaded;
      this.dataStatuses.trains = !this.apiData.trains ? DataStatus.Warning : DataStatus.Loaded;
      this.dataStatuses.dispatchers = !this.apiData.dispatchers ? DataStatus.Warning : DataStatus.Loaded;

      this.setTrainsOnlineData();
      this.setStationsOnlineInfo();
    },
  },
});
