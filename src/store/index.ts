/* eslint-disable */

import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import axios from "axios";

import Train from "@/scripts/interfaces/Train";

import { StoreData } from "@/scripts/interfaces/StoreData";


import { ACTIONS, MUTATIONS } from "@/constants/storeConstants";
import { DataStatus } from "@/scripts/enums/DataStatus";

import { getLocoURL, getScheduledTrain, getStatusID, getStatusTimestamp, parseSpawns } from "@/scripts/utils/storeUtils";
import { URLs } from '@/scripts/utils/apiURLs';
import ScheduledTrain from '@/scripts/interfaces/ScheduledTrain';
import StationRoutes from '@/scripts/interfaces/StationRoutes';
import { io } from 'socket.io-client';
import { APIData, State, StationJSONData } from './types';

const connectToDevAPI = false;

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: () => ({
    stationList: [],
    trainList: [],
    // timetableList: [],

    sceneryData: [],
    lastDispatcherStatuses: [],

    region: { id: "eu", value: "PL1" },

    trainCount: 0,
    stationCount: 0,

    webSocket: undefined,

    dataConnectionStatus: DataStatus.Loading,

    sceneryDataStatus: DataStatus.Loading,
    timetableDataStatus: DataStatus.Loading,
    dispatcherDataStatus: DataStatus.Loading,
    trainsDataStatus: DataStatus.Loading,

    listenerLaunched: false
  }),

  getters: {
    stationList: (state) => state.stationList,
    trainList: (state) => state.trainList,
    allData: (state): StoreData => ({
      stationList: state.stationList,
      trainList: state.trainList,

      sceneryDataStatus: state.sceneryDataStatus,
      dispatcherDataStatus: state.dispatcherDataStatus,
      trainsDataStatus: state.trainsDataStatus
    }),

    sceneryDataStatus: (state): DataStatus => state.sceneryDataStatus,
    trainsDataStatus: (state): DataStatus => state.trainsDataStatus,
    dataStatus: (state): DataStatus => state.dataConnectionStatus,

    currentRegion: (state): { id: string; value: string } => state.region
  },

  actions: {
    async connectToAPI({ state, dispatch }) {
      await dispatch(ACTIONS.loadStaticStationData);

      // Websocket config
      const socket = io(process.env.NODE_ENV !== 'production' && connectToDevAPI ? URLs.stacjownikAPIDev : URLs.stacjownikAPI,
        {
          transports: ["websocket", "polling"],
          rememberUpgrade: true,
          reconnection: true
        })

      socket.on('UPDATE', (data: APIData) => {
        this.dispatch(ACTIONS.fetchOnlineData, data);
      });

      socket.emit('connection');
      state.webSocket = socket;
    },

    async loadStaticStationData({ commit }) {
      const sceneryData: StationJSONData = await (await axios.get(`${URLs.sceneryData}?timestamp=${Math.floor(Date.now() / 1800000)}`)).data;

      if (!sceneryData)
        commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Error);
      else
        commit(MUTATIONS.SET_SCENERY_DATA, sceneryData);
    },

    async fetchOnlineData({ commit }, data: APIData) {
      if (!data.stations) {
        commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Error);
        commit(MUTATIONS.SET_TRAINS_DATA_STATUS, DataStatus.Error);
        commit(MUTATIONS.SET_DISPATCHER_DATA_STATUS, DataStatus.Error);

        return;
      }

      commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Loaded);
      commit(MUTATIONS.SET_DISPATCHER_DATA_STATUS, !data.dispatchers ? DataStatus.Warning : DataStatus.Loaded)
      commit(MUTATIONS.SET_TRAINS_DATA_STATUS, !data.trains ? DataStatus.Warning : DataStatus.Loaded);

      // Zaktualizuj listę pociągów
      const updatedTrainList: Train[] =
        data.trains
          ?.filter(train => train.region === this.state.region.id && train.online)
          .map(train => {
            const stock = train.stockString.split(";");
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

              timetableData: timetable ? {
                timetableId: timetable.timetableId,
                SKR: timetable.SKR,
                TWR: timetable.TWR,
                route: timetable.route,
                category: timetable.category,
                followingStops: timetable.stopList,
                routeDistance: timetable.stopList[timetable.stopList.length - 1].stopDistance,
                sceneries: timetable.sceneries
              } : undefined
            };
          }) || []

      const onlineStationNames: string[] = [];
      const prevDispatcherStatuses: State['lastDispatcherStatuses'] = [];

      data.stations?.forEach((stationAPI) => {
        if (stationAPI.region !== this.state.region.id || !stationAPI.isOnline) return;

        onlineStationNames.push(stationAPI.stationName);

        const stationName = stationAPI.stationName.toLowerCase();
        const station = this.state.stationList.find(s => s.name == stationAPI.stationName);

        const prevDispatcherStatus = this.state.lastDispatcherStatuses.find(dispatcher => dispatcher.hash === stationAPI.stationHash);
        const stationStatus = data.dispatchers?.find((status: string[]) => status[0] == stationAPI.stationHash && status[1] == this.state.region.id) || -1;
        
        const statusTimestamp = prevDispatcherStatus && !data.dispatchers ? prevDispatcherStatus.statusTimestamp : getStatusTimestamp(stationStatus);
        const statusID = prevDispatcherStatus && !data.dispatchers ? prevDispatcherStatus.statusID : getStatusID(stationStatus);

        console.log(stationName, prevDispatcherStatus);

        prevDispatcherStatuses.push({
          hash: stationAPI.stationHash,
          statusID,
          statusTimestamp
        });

        const stationTrains = data.trains
          ?.filter(train => train?.region === this.state.region.id && train.online && train.currentStationName === stationAPI.stationName)
          .map(train => ({ driverName: train.driverName, trainNo: train.trainNo }));

        station?.generalInfo?.checkpoints.forEach(cp => cp.scheduledTrains.length = 0);

        const scheduledTrains: ScheduledTrain[] = updatedTrainList.reduce((acc: ScheduledTrain[], train) => {
          if (!train.timetableData) return acc;

          const timetable = train.timetableData;
          if (!timetable.sceneries.includes(stationAPI.stationHash)) return acc;

          const stopInfoIndex = timetable.followingStops.findIndex(stop => {
            const stopName = stop.stopNameRAW.toLowerCase();

            // if (stop.stopName == "ARKADIA ZDRÓJ" && station.name == "Arkadia Zdrój 2019" && stop.pointId != "1583014379097") return false;
            // if (stop.stopName == "ARKADIA ZDRÓJ" && station.name == "Arkadia Zdrój 2012" && stop.pointId != "1519258642187") return false;

            if (stationName === stopName) return true;
            if (stopName.includes(stationName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stationName.includes(stopName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stopName.includes("podg.") && stopName.split(", podg.")[0] && stationName.includes(stopName.split(", podg.")[0])) return true;

            if (station?.generalInfo
              && station.generalInfo.checkpoints
              && station.generalInfo.checkpoints.length > 0
              && station.generalInfo.checkpoints.some(cp => cp.checkpointName.toLowerCase().includes(stop.stopNameRAW.toLowerCase())))

              return true;

            return false;
          });

          if (stopInfoIndex == -1) return acc;

          const scheduledStopTrain = getScheduledTrain(train, stopInfoIndex, stationAPI.stationName);

          if (station && station.generalInfo?.checkpoints && station.generalInfo.checkpoints.length > 0) {
            for (const checkpoint of station.generalInfo.checkpoints) {
              const index = timetable.followingStops.findIndex(stop => stop.stopNameRAW.toLowerCase() == checkpoint.checkpointName.toLowerCase());
              
              if (index == -1) continue;
              
              const scheduledCheckpointTrain = getScheduledTrain(train, index, stationAPI.stationName);
              checkpoint.scheduledTrains.push(scheduledCheckpointTrain);

              // timetable.followingStops
                // .filter(trainStop => trainStop.stopNameRAW.toLowerCase() === checkpoint.checkpointName.toLowerCase())
                // .forEach((trainCheckpointStop, i) => {

                // });
            }
          }

          acc.push(scheduledStopTrain);
          return acc;
        }, []);

        const onlineInfo = {
          name: stationAPI.stationName,
          hash: stationAPI.stationHash,
          maxUsers: stationAPI.maxUsers,
          currentUsers: stationAPI.currentUsers,
          spawns: parseSpawns(stationAPI.spawnString),
          dispatcherName: stationAPI.dispatcherName,
          dispatcherRate: stationAPI.dispatcherRate,
          dispatcherId: stationAPI.dispatcherId,
          dispatcherExp: stationAPI.dispatcherExp,
          dispatcherIsSupporter: stationAPI.dispatcherIsSupporter,
          stationTrains,
          statusTimestamp,
          statusID,
          scheduledTrains,
        }

        if (!station) {
          this.state.stationList.push({
            name: stationAPI.stationName,
            onlineInfo
          })

          return;
        }

        station.onlineInfo = { ...onlineInfo };

      });

      this.state.stationList
        .filter(station => !onlineStationNames.includes(station.name) && station.onlineInfo)
        .forEach(offlineStation => {
          offlineStation.onlineInfo = undefined;
        });

      this.state.trainList = updatedTrainList;
      this.state.trainsDataStatus = DataStatus.Loaded;

      if (data.dispatchers != null)
        this.state.lastDispatcherStatuses = prevDispatcherStatuses;
    },
  },

  mutations: {
    SET_SCENERY_DATA(state, data: StationJSONData[]) {
      state.stationList = data.map(stationData => ({
        name: stationData.name,

        generalInfo: {
          ...stationData,
          routes: stationData.routes?.split(";").filter(routeString => routeString).reduce((acc, routeString) => {
            const specs1 = routeString.split("_")[0];
            const isInternal = specs1.startsWith('!');
            const name = isInternal ? specs1.replace("!", "") : specs1;

            const specs2 = routeString.split("_")[1].split("");
            const twoWay = specs2[0] == "2";
            const catenary = specs2[1] == "E";
            const SBL = specs2[2] == "S";
            const TWB = specs2[3] ? true : false;

            const propName = twoWay
              ? catenary
                ? 'twoWayCatenaryRouteNames'
                : 'twoWayNoCatenaryRouteNames'
              : catenary
                ? 'oneWayCatenaryRouteNames'
                : 'oneWayNoCatenaryRouteNames';

            acc[twoWay ? 'twoWay' : 'oneWay'].push({ name, SBL, TWB, catenary, isInternal, tracks: twoWay ? 2 : 1 });
            if (!isInternal) acc[propName].push(name);

            if (SBL) acc['sblRouteNames'].push(name);

            return acc;
          }, {
            oneWay: [],
            twoWay: [],
            sblRouteNames: [],
            oneWayCatenaryRouteNames: [],
            oneWayNoCatenaryRouteNames: [],
            twoWayCatenaryRouteNames: [],
            twoWayNoCatenaryRouteNames: []
          } as StationRoutes) || {},
          checkpoints: stationData.checkpoints ? stationData.checkpoints.split(";").map(sub => ({ checkpointName: sub, scheduledTrains: [] })) : [],
        }
      }));

    },

    SET_SCENERY_DATA_STATUS(state, status: DataStatus) {
      state.sceneryDataStatus = status;
    },

    SET_DISPATCHER_DATA_STATUS(state, status: DataStatus) {
      state.dispatcherDataStatus = status;
    },

    SET_TRAINS_DATA_STATUS(state, status: DataStatus) {
      state.trainsDataStatus = status;
    },

    SET_REGION(state, region: { id: string; value: string }) {
      state.region = region;
      state.webSocket?.emit('FETCH_DATA');
    },

  }
})

export function useStore(): Store<State> {
  return baseUseStore(key)
}