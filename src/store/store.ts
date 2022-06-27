import { DataStatus } from '@/scripts/enums/DataStatus';
import { DispatcherStatsAPIData } from '@/scripts/interfaces/api/DispatcherStatsAPIData';
import StationAPIData from '@/scripts/interfaces/api/StationAPIData';
import TrainAPIData from '@/scripts/interfaces/api/TrainAPIData';
import ScheduledTrain from '@/scripts/interfaces/ScheduledTrain';
import Station from '@/scripts/interfaces/Station';
import StationRoutes from '@/scripts/interfaces/StationRoutes';
import { StoreData } from '@/scripts/interfaces/StoreData';
import Train from '@/scripts/interfaces/Train';
import { URLs } from '@/scripts/utils/apiURLs';
import {
  getLocoURL,
  getScheduledTrain,
  getStatusID,
  getStatusTimestamp,
  parseSpawns,
} from '@/scripts/utils/storeUtils';
import axios from 'axios';
import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { APIData, StationJSONData, StoreState } from './storeTypes';

export const useStore = defineStore('store', {
  state: () =>
    ({
      apiData: {} as unknown,

      stationList: [],
      trainList: [],

      sceneryData: [],
      lastDispatcherStatuses: [],

      region: { id: 'eu', value: 'PL1' },

      trainCount: 0,
      stationCount: 0,

      webSocket: undefined,

      dispatcherStatsName: '',
      dispatcherStatsData: undefined,

      driverStatsName: '',
      driverStatsData: undefined,

      dataStatuses: {
        connection: DataStatus.Loading,
        sceneries: DataStatus.Loading,
        timetables: DataStatus.Loading,
        dispatchers: DataStatus.Loading,
        trains: DataStatus.Loading,
      },

      listenerLaunched: false,
    } as StoreState),

  actions: {
    setTrainsOnlineData() {
      const { trains } = this.apiData;

      if (!trains) return [];

      this.trainList = trains
        .filter((train) => train.region === this.region.id)
        .map((train) => {
          const stock = train.stockString.split(';');
          const locoType = stock ? stock[0] : train.stockString;

          const timetable = train.timetable;

          return {
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
          };
        }) as Train[];
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
        .map((train) => ({ driverName: train.driverName, driverId: train.driverId, trainNo: train.trainNo }));
    },

    setStationsOnlineInfo() {
      const onlineStationNames: string[] = [];
      const prevDispatcherStatuses: StoreState['lastDispatcherStatuses'] = [];

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

      this.stationList = sceneryData.map((scenery) => ({
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
      }));
    },

    connectToWebsocket() {
      const socket = io(
        process.env.NODE_ENV !== 'production' && process.env.VUE_APP_WS_DEV == 1
          ? URLs.stacjownikAPIDev
          : URLs.stacjownikAPI,
        {
          transports: ['websocket', 'polling'],
          rememberUpgrade: true,
          reconnection: true,
        }
      );

      socket.on('UPDATE', (data: APIData) => {
        this.apiData = data;
        this.setOnlineData();

        console.log(data);
        
      });

      socket.emit('FETCH_DATA', {}, (data: APIData) => {
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
