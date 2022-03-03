/* eslint-disable */

import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import axios from "axios";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";
import TrainStop from "@/scripts/interfaces/TrainStop";

import { StoreData } from "@/scripts/interfaces/StoreData";

import TimetableAPIData from '@/scripts/interfaces/api/TimetableAPIData';
import StationAPIData from '@/scripts/interfaces/api/StationAPIData';
import TrainAPIData from '@/scripts/interfaces/api/TrainAPIData';
import Timetable from '@/scripts/interfaces/Timetable';

import { ACTIONS, MUTATIONS } from "@/constants/storeConstants";
import { DataStatus } from "@/scripts/enums/DataStatus";

import { getLocoURL, getStatusID, getStatusTimestamp, getTimestamp, getTrainStopStatus, parseSpawns, timestampToString } from "@/scripts/utils/storeUtils";
import { URLs } from '@/scripts/utils/apiURLs';
import ScheduledTrain from '@/scripts/interfaces/ScheduledTrain';
import StationRoutes from '@/scripts/interfaces/StationRoutes';

export interface State {
  stationList: Station[],
  trainList: Train[],
  timetableList: Timetable[],

  sceneryData: any[][],

  region: { id: string; value: string };
  trainCount: number;
  stationCount: number;

  dataConnectionStatus: DataStatus;

  sceneryDataStatus: DataStatus;
  timetableDataStatus: DataStatus;
  dispatcherDataStatus: DataStatus;
  trainsDataStatus: DataStatus;

  listenerLaunched: boolean;
}

interface StationJSONData {
  name: string;
  url: string;
  lines: string;
  project: string;

  reqLevel: number;

  // supportersOnly: boolean;

  signalType: string;
  controlType: string;

  SUP: boolean;

  routes: string;
  checkpoints: string | null;

  default: boolean;
  nonPublic: boolean;
  unavailable: boolean;
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: () => ({
    stationList: [],
    trainList: [],
    timetableList: [],

    sceneryData: [],

    region: { id: "eu", value: "PL1" },

    trainCount: 0,
    stationCount: 0,

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

      activeTrainCount: state.trainCount,
      activeStationCount: state.stationCount,

      dataConnectionStatus: state.dataConnectionStatus,
      timetableDataStatus: state.timetableDataStatus,
      sceneryDataStatus: state.sceneryDataStatus,

      dispatcherDataStatus: state.dispatcherDataStatus,
      trainsDataStatus: state.trainsDataStatus
    }),
    timetableDataStatus: (state): DataStatus => state.timetableDataStatus,
    sceneryDataStatus: (state): DataStatus => state.sceneryDataStatus,
    trainsDataStatus: (state): DataStatus => state.trainsDataStatus,
    dataStatus: (state): DataStatus => state.dataConnectionStatus,
    currentRegion: (state): { id: string; value: string } => state.region
  },

  actions: {
    async synchronizeData({ commit, dispatch, state }) {
      if (state.listenerLaunched) return;

      // Nowy parametr żądania co godzinę
      const sceneryData: StationJSONData = await (await axios.get(`${URLs.sceneryData}?time=${Math.floor(Date.now() / 1800000)}`)).data;

      commit(MUTATIONS.SET_TIMETABLE_DATA_STATUS, DataStatus.Loading);
      commit(MUTATIONS.SET_SCENERY_DATA, sceneryData);
      commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Loaded);
      dispatch(ACTIONS.fetchOnlineData);

      setInterval(() => dispatch(ACTIONS.fetchOnlineData), Math.floor(Math.random() * 5000) + 25000);
    },

    async fetchOnlineData({ commit, dispatch }) {
      commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Loading);

      Promise.all([axios.get(URLs.stations), axios.get(URLs.trains), axios.get(URLs.dispatchers)])
        .then(async response => {
          const onlineStationsData: { success: boolean, message: StationAPIData[] } = response[0].data;
          const onlineTrainsData: { success: boolean, message: TrainAPIData[] } = await response[1].data;
          const onlineDispatchersData: { success: boolean, message: string[][] } = await response[2].data;

          if (!onlineStationsData.success) {
            // commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Error);
            commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Error);
            return;
          }

          commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Loaded);
          commit(MUTATIONS.SET_DISPATCHER_DATA_STATUS, onlineDispatchersData.success ? DataStatus.Loaded : DataStatus.Warning);
          commit(MUTATIONS.SET_TRAINS_DATA_STATUS, onlineTrainsData.success ? DataStatus.Loaded : DataStatus.Warning);

          const updatedStationList: Station['onlineInfo'][] = onlineStationsData.message.reduce((acc, station) => {
            if (station.region !== this.state.region.id || !station.isOnline) return acc;

            const stationStatus = onlineDispatchersData.success ? onlineDispatchersData.message.find((status: string[]) => status[0] == station.stationHash && status[1] == this.state.region.id) : -1;

            const statusTimestamp = getStatusTimestamp(stationStatus);
            const statusID = getStatusID(stationStatus);

            const stationTrains = onlineTrainsData.success ? onlineTrainsData.message
              .filter(train => train.region === this.state.region.id && train.isOnline && train.station.stationName === station.stationName)
              .map(train => ({ driverName: train.driverName, trainNo: train.trainNo })) : [];
            

            acc.push({
              name: station.stationName,
              hash: station.stationHash,
              maxUsers: station.maxUsers,
              currentUsers: station.currentUsers,
              spawns: parseSpawns(station.spawnString),
              dispatcherName: station.dispatcherName,
              dispatcherRate: station.dispatcherRate,
              dispatcherId: station.dispatcherId,
              dispatcherExp: station.dispatcherExp,
              dispatcherIsSupporter: station.dispatcherIsSupporter,
              stationTrains,
              statusTimestamp,
              statusID,
              statusTimeString: timestampToString(statusTimestamp),
            });

            return acc;
          }, [] as Station['onlineInfo'][]);

          const updatedTrainList = onlineTrainsData.success ? await Promise.all(
            onlineTrainsData.message
              .filter(train => train.region === this.state.region.id)
              .map(async train => {
                const locoType = train.dataCon.split(";") ? train.dataCon.split(";")[0] : train.dataCon;

                return {
                  trainNo: train.trainNo,
                  mass: train.dataMass,
                  length: train.dataLength,
                  speed: train.dataSpeed,
                  distance: train.dataDistance,
                  signal: train.dataSignal,
                  online: train.isOnline,
                  driverId: train.driverId,
                  driverName: train.driverName,
                  currentStationName: train.station.stationName,
                  currentStationHash: train.station.stationHash,
                  connectedTrack: train.dataSceneryConnection,
                  locoType,
                  locoURL: getLocoURL(locoType),
                  cars: train.dataCon.split(";").filter((train, i) => i > 0) || [],
                };
              })
          ) : [];          

          // Pass reduced lists to mutations
          commit(MUTATIONS.UPDATE_STATIONS, updatedStationList);
          commit(MUTATIONS.UPDATE_TRAINS, updatedTrainList);

          // Statuses
          commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Loaded);

          // commit(MUTATIONS.SET_TIMETABLE_DATA_STATUS, DataStatus.Loading);
          dispatch(ACTIONS.fetchTimetableData);
        })
        .catch(() => {
          commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Error);
        });
    },

    async fetchTimetableData({ commit }) {
      let warnings = 0;

      const timetableList = this.state.trainList.reduce(async (acc: Promise<Timetable[]>, train: Train) => {
        const data: { success: boolean; message: TimetableAPIData } = await (await axios.get(URLs.getTimetableURL(train.trainNo, this.state.region.id))).data;

        if (!data.success) {
          warnings++;

          (await acc).push({
            trainNo: train.trainNo,
            success: false
          });

          return acc;
        }

        const timetable = data.message;
        const trainInfo = timetable.trainInfo;

        if (!timetable || !trainInfo) return acc;

        let lastArrivalLine = "";

        const followingStops: TrainStop[] = timetable.stopPoints.reduce((stopsAcc: TrainStop[], point) => {
          if (point.pointNameRAW.toLowerCase().includes("sbl")) {
            if (point.arrivalLine && !point.arrivalLine.toLocaleLowerCase().includes("sbl"))
              lastArrivalLine = point.arrivalLine;

            if (point.departureLine && !point.departureLine.toLocaleLowerCase().includes("sbl")) {
              stopsAcc[stopsAcc.length - 1].departureLine = point.departureLine
            }

            return stopsAcc;
          }

          const arrivalTimestamp = getTimestamp(point.arrivalTime);
          const arrivalRealTimestamp = getTimestamp(point.arrivalRealTime);

          const departureTimestamp = getTimestamp(point.departureTime);
          const departureRealTimestamp = getTimestamp(point.departureRealTime);

          let arrivalLine = lastArrivalLine || point.arrivalLine;

          if (lastArrivalLine != "")
            lastArrivalLine = "";

          stopsAcc.push({
            stopName: point.pointName,
            stopNameRAW: point.pointNameRAW,
            stopType: point.pointStopType,
            stopDistance: point.pointDistance,
            pointId: point.pointId,

            comments: point.comments,

            mainStop: point.pointName.includes("strong"),

            arrivalLine,
            arrivalTimeString: timestampToString(arrivalTimestamp),
            arrivalTimestamp: arrivalTimestamp,
            arrivalRealTimeString: timestampToString(arrivalRealTimestamp),
            arrivalRealTimestamp: arrivalRealTimestamp,
            arrivalDelay: point.arrivalDelay,

            departureLine: point.departureLine,
            departureTimeString: timestampToString(departureTimestamp),
            departureTimestamp: departureTimestamp,
            departureRealTimeString: timestampToString(departureRealTimestamp),
            departureRealTimestamp: departureRealTimestamp,
            departureDelay: point.departureDelay,

            beginsHere: arrivalTimestamp == 0,
            terminatesHere: departureTimestamp == 0,

            confirmed: point.confirmed,
            stopped: point.isStopped,
            stopTime: point.pointStopTime
          });

          return stopsAcc;
        }, []);

        (await acc).push({
          data: {
            trainNo: train.trainNo,
            driverName: train.driverName,
            driverId: train.driverId,
            currentStationName: train.currentStationName,
            currentStationHash: train.currentStationHash,
            timetableId: trainInfo.timetableId,
            category: trainInfo.trainCategoryCode,
            route: trainInfo.route,
            TWR: trainInfo.twr,
            SKR: trainInfo.skr,
            routeDistance: timetable.stopPoints[timetable.stopPoints.length - 1].pointDistance,
            followingStops,
            followingSceneries: trainInfo.sceneries
          },

          trainNo: train.trainNo,
          success: true
        });

        return acc;
      }, Promise.resolve([]));

      commit(MUTATIONS.UPDATE_TIMETABLES, (await timetableList));
      commit(MUTATIONS.SET_TIMETABLE_DATA_STATUS, warnings == 0 ? DataStatus.Loaded : DataStatus.Warning);
    }

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

            acc[twoWay ? 'twoWay' : 'oneWay'].push({ name, SBL, TWB, catenary, isInternal });
            if(!isInternal) acc[propName].push(name);

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


    SET_DATA_CONNECTION_STATUS(state, status: DataStatus) {
      state.dataConnectionStatus = status;
    },

    SET_SCENERY_DATA_STATUS(state, status: DataStatus) {
      state.sceneryDataStatus = status;
    },

    SET_TIMETABLE_DATA_STATUS(state, status: DataStatus) {
      state.timetableDataStatus = status;
    },

    SET_DISPATCHER_DATA_STATUS(state, status: DataStatus) {
      state.dispatcherDataStatus = status;
    },

    SET_TRAINS_DATA_STATUS(state, status: DataStatus) {
      state.trainsDataStatus = status;
    },


    SET_REGION(state, region: { id: string; value: string }) {
      state.region = region;
    },

    UPDATE_STATIONS(state, updatedStationList: Station['onlineInfo'][]) {

      state.stationList = state.stationList.reduce((acc: Station[], station) => {
        const onlineStationData = updatedStationList.find(updatedStation => updatedStation?.name === station.name);
        const listedStationData = state.stationList.find(data => data.name === station.name);

        if (onlineStationData)
          acc.push({
            name: station.name,
            generalInfo: station.generalInfo,
            onlineInfo: {
              ...onlineStationData,
              scheduledTrains: station.onlineInfo?.scheduledTrains || []
            },
          });
        else if (listedStationData)
          acc.push({
            ...station,
            onlineInfo: undefined
          });

        return acc;
      }, [] as Station[]);

      updatedStationList
        .filter(uStation => !state.stationList.some(station => uStation?.name === station.name))
        .forEach(uStation => {
          if (!uStation) return;

          state.stationList.push({
            name: uStation.name,

            onlineInfo: {
              ...uStation,
              scheduledTrains: [],
              stationTrains: uStation.stationTrains || []
            },
            generalInfo: undefined
          });
        });

      state.stationCount = state.stationList.filter(station => station.onlineInfo).length;
      state.dataConnectionStatus = DataStatus.Loaded;
    },

    UPDATE_TRAINS(state, updatedTrainList: any[]) {
      state.trainList = updatedTrainList.reduce((acc, updatedTrain) => {
        const trainData = state.trainList.find(train => train.trainNo === updatedTrain.trainNo);

        if (trainData) acc.push({ ...trainData, ...updatedTrain });
        else acc.push({ ...updatedTrain });

        return acc;
      }, [] as Train[]);      

      state.trainCount = state.trainList.length;      
      
      state.dataConnectionStatus = DataStatus.Loaded;
    },

    UPDATE_TIMETABLES(state, timetableList: Timetable[]) {
      state.stationList = state.stationList.map(station => {
        const stationName = station.name.toLowerCase();

        const scheduledTrains: ScheduledTrain[] = timetableList.reduce((acc: ScheduledTrain[], timetable: Timetable) => {
          if (!timetable.data)
            return acc;

          if (!timetable.data.followingSceneries.includes(station.onlineInfo?.hash || "")) return acc;

          const stopInfoIndex = timetable.data.followingStops.findIndex(stop => {
            const stopName = stop.stopNameRAW.toLowerCase();

            // if (stop.stopName == "ARKADIA ZDRÓJ" && station.name == "Arkadia Zdrój 2019" && stop.pointId != "1583014379097") return false;
            // if (stop.stopName == "ARKADIA ZDRÓJ" && station.name == "Arkadia Zdrój 2012" && stop.pointId != "1519258642187") return false;

            if (stationName === stopName) return true;
            if (stopName.includes(stationName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stationName.includes(stopName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stopName.includes("podg.") && stopName.split(", podg.")[0] && stationName.includes(stopName.split(", podg.")[0])) return true;

            if (station.generalInfo
              && station.generalInfo.checkpoints
              && station.generalInfo.checkpoints.length > 0
              && station.generalInfo.checkpoints.some(cp => cp.checkpointName.toLowerCase().includes(stop.stopNameRAW.toLowerCase())))

              return true;

            return false;
          });

          if (stopInfoIndex == -1) return acc;

          const trainStop = timetable.data.followingStops[stopInfoIndex];
          const trainStopStatus = getTrainStopStatus(trainStop, timetable.data.currentStationName, station);

          acc.push({
            trainNo: timetable.data.trainNo,
            driverName: timetable.data.driverName,
            driverId: timetable.data.driverId,
            currentStationName: timetable.data.currentStationName,
            currentStationHash: timetable.data.currentStationHash,
            category: timetable.data.category,
            beginsAt: timetable.data.followingStops[0].stopNameRAW,
            terminatesAt: timetable.data.followingStops[timetable.data.followingStops.length - 1].stopNameRAW,
            nearestStop: "",
            stopInfo: trainStop,
            stopLabel: trainStopStatus.stopLabel,
            stopStatus: trainStopStatus.stopStatus,
            stopStatusID: trainStopStatus.stopStatusID
          });

          return acc;
        }, []);

        if (station.generalInfo && station.generalInfo.checkpoints.length > 0) {
          station.generalInfo.checkpoints.forEach(cp => (cp.scheduledTrains.length = 0));

          for (const checkpoint of station.generalInfo.checkpoints) {
            timetableList.forEach(timetable => {
              if (!timetable.data) return;
              if (!timetable.data.followingSceneries.includes(station.onlineInfo?.hash || "")) return;

              const timetableData = timetable.data;

              timetableData.followingStops
                .filter(trainStop => trainStop.stopNameRAW.toLowerCase() === checkpoint.checkpointName.toLowerCase())
                .forEach(trainStop => {
                  const trainStopStatus = getTrainStopStatus(trainStop, timetableData.currentStationName, station);

                  checkpoint.scheduledTrains.push({
                    trainNo: timetable.trainNo,
                    driverName: timetableData.driverName,
                    driverId: timetableData.driverId,
                    currentStationName: timetableData.currentStationName,
                    currentStationHash: timetableData.currentStationHash,
                    category: timetableData.category,
                    beginsAt: timetableData.followingStops[0].stopNameRAW,
                    terminatesAt: timetableData.followingStops[timetableData.followingStops.length - 1].stopNameRAW,
                    nearestStop: "",
                    stopInfo: trainStop,
                    stopLabel: trainStopStatus.stopLabel,
                    stopStatus: trainStopStatus.stopStatus,
                    stopStatusID: trainStopStatus.stopStatusID
                  });
                });
            });
          }
        }


        return {
          ...station,
          onlineInfo: station.onlineInfo ? {
            ...station.onlineInfo,
            scheduledTrains
          } : undefined
        };
      });

      state.trainList = state.trainList.reduce((acc, train) => {
        const timetable = timetableList.find(tt => tt.data && tt.trainNo === train.trainNo && tt.data.driverId === train.driverId);
        const allTimetables = timetableList.filter(tt => tt.data && tt.data.driverId === train.driverId && tt.trainNo !== train.trainNo);

        // if (!timetable || !timetable.data) return acc;

        if (allTimetables.length > 0)
          return acc;

        const trainStopData = state.stationList
          .find(station => station.name === train.currentStationName)
          ?.onlineInfo?.scheduledTrains?.find(stationTrain => stationTrain.trainNo === train.trainNo);

        acc.push({ ...train, timetableData: timetable?.data, stopStatus: trainStopData?.stopStatus || "", stopLabel: trainStopData?.stopLabel || "" });

        return acc;
      }, [] as Train[]);

      state.timetableDataStatus = DataStatus.Loaded;
    }
  }
})

export function useStore(): Store<State> {
  return baseUseStore(key)
}