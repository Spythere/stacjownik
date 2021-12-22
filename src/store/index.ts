/* eslint-disable */

import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'

import axios from "axios";

// import JSONStationData from "@/data/stationData.json";

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
import StorageManager from '@/scripts/managers/storageManager';

export interface State {
  stationList: Station[],
  trainList: Train[],

  sceneryData: any[][],

  region: { id: string; value: string };
  trainCount: number;
  stationCount: number;

  dataConnectionStatus: DataStatus;
  sceneryDataStatus: DataStatus;
  timetableDataStatus: DataStatus;

  listenerLaunched: boolean;
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: () => ({
    stationList: [],
    trainList: [],

    sceneryData: [],

    region: { id: "eu", value: "PL1" },

    trainCount: 0,
    stationCount: 0,

    dataConnectionStatus: DataStatus.Loading,
    sceneryDataStatus: DataStatus.Loading,
    timetableDataStatus: DataStatus.Loading,

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
      timetableDataStatus: state.timetableDataStatus
    }),
    timetableDataStatus: (state): DataStatus => state.timetableDataStatus,
    sceneryDataStatus: (state): DataStatus => state.sceneryDataStatus,
    dataStatus: (state): DataStatus => state.dataConnectionStatus,
    currentRegion: (state): { id: string; value: string } => state.region
  },

  actions: {
    async synchronizeData({ commit, dispatch, state }) {
      if (state.listenerLaunched) return;

      const queryDate = new Date();
     
      const nextRefreshDate = new Date();

      if (queryDate.getHours() < 8)
        nextRefreshDate.setHours(8, 0, 0, 0);
      else if (queryDate.getHours() < 20)
        nextRefreshDate.setHours(20, 0, 0, 0);
      else {
        nextRefreshDate.setDate(nextRefreshDate.getDate() + 1);
        nextRefreshDate.setHours(8, 0, 0, 0);
      }

      let sceneryDataQuery = URLs.sceneryData;
      if (!StorageManager.isRegistered("nextSceneryDataRefreshTime") || StorageManager.isRegistered("nextSceneryDataRefreshTime")
        && queryDate.getTime() >= StorageManager.getNumericValue("nextSceneryDataRefreshTime")) {
        StorageManager.setNumericValue("nextSceneryDataRefreshTime", nextRefreshDate.getTime());
        sceneryDataQuery += "?time=" + queryDate.getTime();
      }

      const sceneryData = await (await axios.get(sceneryDataQuery)).data;

      commit(MUTATIONS.SET_SCENERY_DATA, sceneryData);
      commit(MUTATIONS.SET_SCENERY_DATA_STATUS, DataStatus.Loaded);

      dispatch(ACTIONS.fetchOnlineData);


      const randIntervalTime = Math.floor(Math.random() * 5000) + 25000;

      setInterval(() => dispatch(ACTIONS.fetchOnlineData), randIntervalTime);
    },

    async fetchOnlineData({ commit, dispatch }) {
      commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Loading);



      Promise.all([axios.get(URLs.stations), axios.get(URLs.trains), axios.get(URLs.dispatchers)])
        .then(async response => {
          const onlineStationsData: StationAPIData[] = response[0].data.message;
          const onlineTrainsData: TrainAPIData[] = await response[1].data.message;
          const onlineDispatchersData: string[][] = await response[2].data.message;


          const updatedStationList = onlineStationsData.reduce((acc, station) => {
            if (station.region !== this.state.region.id || !station.isOnline) return acc;

            const stationStatus = onlineDispatchersData.find((status: string[]) => status[0] == station.stationHash && status[1] == this.state.region.id);

            const statusTimestamp = getStatusTimestamp(stationStatus);
            const statusID = getStatusID(stationStatus);

            const stationTrains = onlineTrainsData
              .filter(train => train.region === this.state.region.id && train.isOnline && train.station.stationName === station.stationName)
              .map(train => ({ driverName: train.driverName, trainNo: train.trainNo }));

            acc.push({
              stationName: station.stationName,
              stationHash: station.stationHash,
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
              statusTimeString: timestampToString(statusTimestamp)
            });

            return acc;
          }, [] as any);

          const updatedTrainList = await Promise.all(
            onlineTrainsData
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
                  cars: train.dataCon.split(";").filter((train, i) => i > 0) || []
                };
              })
          );

          // Pass reduced lists to mutations
          commit(MUTATIONS.UPDATE_STATIONS, updatedStationList);
          commit(MUTATIONS.UPDATE_TRAINS, updatedTrainList);
          commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Loaded);

          dispatch(ACTIONS.fetchTimetableData);
        })
        .catch(() => {
          commit(MUTATIONS.SET_DATA_CONNECTION_STATUS, DataStatus.Error);
        });
    },

    async fetchTimetableData({ commit }) {
      const reducedList = this.state.trainList.reduce(async (acc: Promise<Timetable[]>, train: Train) => {
        const timetable: TimetableAPIData = await (await axios.get(URLs.getTimetableURL(train.trainNo, this.state.region.id))).data.message;
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
        });

        return acc;
      }, Promise.resolve([]));

      commit(MUTATIONS.UPDATE_TIMETABLES, (await reducedList));
    }

  },

  mutations: {
    SET_SCENERY_DATA(state, data: any[][]) {
      state.sceneryData = [...data];

      state.stationList = data.map(station => ({
        stationName: station[0] as string,
        stationURL: station[1] as string,
        stationLines: station[2] as string,
        stationProject: station[3] as string,
        reqLevel: station[4] as string,
        supportersOnly: station[5] == "TAK",
        signalType: station[6] as string,
        controlType: station[7] as string,
        SBL: station[8] as string,
        TWB: station[9] as string,
        routes: {
          oneWay: {
            catenary: station[10] as number,
            noCatenary: station[11] as number
          },
          twoWay: {
            catenary: station[12] as number,
            noCatenary: station[13] as number
          }
        },
        checkpoints: station[14] ? (station[14] as string).split(";").map(sub => ({ checkpointName: sub, scheduledTrains: [] })) : [],

        default: station[15] as boolean,
        nonPublic: station[16] as boolean,
        unavailable: station[17] as boolean,

        stationHash: "",
        maxUsers: 0,
        currentUsers: 0,
        dispatcherName: "",
        dispatcherRate: 0,
        dispatcherExp: -1,
        dispatcherId: 0,
        dispatcherIsSupporter: false,
        online: false,
        statusTimestamp: -3,
        statusID: "free",
        statusTimeString: "",
        stationTrains: [],
        scheduledTrains: [],
        spawns: []
      }));


    },

    SET_SCENERY_DATA_STATUS(state, status: DataStatus) {
      state.sceneryDataStatus = status;
    },

    SET_DATA_CONNECTION_STATUS(state, status: DataStatus) {
      state.dataConnectionStatus = status;
    },

    SET_TIMETABLE_DATA_STATUS(state, status: DataStatus) {
      state.timetableDataStatus = status;
    },

    SET_REGION(state, region: { id: string; value: string }) {
      state.region = region;
    },

    UPDATE_STATIONS(state, updatedStationList: any[]) {

      state.stationList = state.stationList.reduce((acc: Station[], station) => {
        const onlineStationData = updatedStationList.find(updatedStation => updatedStation.stationName === station.stationName);
        const listedStationData = state.sceneryData.find(data => data[0] === station.stationName);

        if (onlineStationData)
          acc.push({
            ...station,
            ...onlineStationData,
            online: true
          });
        else if (listedStationData)
          acc.push({
            ...station,
            stationHash: "",
            maxUsers: 0,
            currentUsers: 0,
            dispatcherName: "",
            dispatcherRate: 0,
            dispatcherExp: -1,
            dispatcherId: 0,
            dispatcherIsSupporter: false,
            online: false,
            statusID: "free",
            statusTimestamp: -3,
            statusTimeString: "",
            stationTrains: [],
            scheduledTrains: []
          });

        return acc;
      }, [] as Station[]);

      updatedStationList
        .filter(uStation => !state.stationList.some(station => uStation.stationName === station.stationName))
        .forEach(uStation => {
          state.stationList.push({
            ...uStation,
            scheduledTrains: [],
            stationTrains: uStation.stationTrains || [],
            subStations: [],
            online: true,
            reqLevel: "-1",
            nonPublic: true
          });
        });

      state.stationCount = state.stationList.filter(station => station.online).length;
      state.dataConnectionStatus = DataStatus.Loaded;
    },

    UPDATE_TRAINS(state, updatedTrainList: any[]) {
      state.trainList = updatedTrainList.reduce((acc, updatedTrain) => {
        const trainData = state.trainList.find(train => train.trainNo === updatedTrain.trainNo);

        if (trainData) acc.push({ ...trainData, ...updatedTrain });
        else acc.push({ ...updatedTrain });

        return acc;
      }, [] as Train[]);

      state.trainCount = state.trainList.filter(train => train.online).length;
      state.dataConnectionStatus = DataStatus.Loaded;
    },

    UPDATE_TIMETABLES(state, timetableList: Timetable[]) {
      state.stationList = state.stationList.map(station => {
        const stationName = station.stationName.toLowerCase();

        const scheduledTrains: Station["scheduledTrains"] = timetableList.reduce((acc: Station["scheduledTrains"], timetable: Timetable) => {
          if (!timetable.followingSceneries.includes(station.stationHash)) return acc;

          const stopInfoIndex = timetable.followingStops.findIndex(stop => {
            const stopName = stop.stopNameRAW.toLowerCase();


            if (stationName === stopName) return true;
            if (stopName.includes(stationName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stationName.includes(stopName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
            if (stopName.includes("podg.") && stopName.split(", podg.")[0] && stationName.includes(stopName.split(", podg.")[0])) return true;

            if (station.checkpoints && station.checkpoints.length > 0 && station.checkpoints.some(cp => cp.checkpointName.toLowerCase().includes(stop.stopNameRAW.toLowerCase()))) return true;

            // if (station.stops && station.stops.includes(stop.stopNameRAW)) return true;

            return false;
          });

          if (stopInfoIndex == -1) return acc;

          const trainStop = timetable.followingStops[stopInfoIndex];
          const trainStopStatus = getTrainStopStatus(trainStop, timetable, station);

          acc.push({
            trainNo: timetable.trainNo,
            driverName: timetable.driverName,
            driverId: timetable.driverId,
            currentStationName: timetable.currentStationName,
            currentStationHash: timetable.currentStationHash,
            category: timetable.category,
            beginsAt: timetable.followingStops[0].stopNameRAW,
            terminatesAt: timetable.followingStops[timetable.followingStops.length - 1].stopNameRAW,
            nearestStop: "",
            stopInfo: trainStop,
            stopLabel: trainStopStatus.stopLabel,
            stopStatus: trainStopStatus.stopStatus,
            stopStatusID: trainStopStatus.stopStatusID
          });

          return acc;
        }, []);

        if (station.checkpoints) {
          station.checkpoints.forEach(cp => (cp.scheduledTrains.length = 0));

          for (const checkpoint of station.checkpoints) {
            timetableList.forEach(timetable => {
              timetable.followingStops
                .filter(trainStop => trainStop.stopNameRAW.toLowerCase() === checkpoint.checkpointName.toLowerCase())
                .forEach(trainStop => {
                  const trainStopStatus = getTrainStopStatus(trainStop, timetable, station);

                  checkpoint.scheduledTrains.push({
                    trainNo: timetable.trainNo,
                    driverName: timetable.driverName,
                    driverId: timetable.driverId,
                    currentStationName: timetable.currentStationName,
                    currentStationHash: timetable.currentStationHash,
                    category: timetable.category,
                    beginsAt: timetable.followingStops[0].stopNameRAW,
                    terminatesAt: timetable.followingStops[timetable.followingStops.length - 1].stopNameRAW,
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

        return { ...station, scheduledTrains };
      });

      state.trainList = state.trainList.reduce((acc, train) => {
        const timetableData = timetableList.find(data => data && data.trainNo === train.trainNo);

        const trainStopData = state.stationList
          .find(station => station.stationName === train.currentStationName)
          ?.scheduledTrains.find(stationTrain => stationTrain.trainNo === train.trainNo);

        acc.push({ ...train, timetableData, stopStatus: trainStopData?.stopStatus || "", stopLabel: trainStopData?.stopLabel || "" });

        return acc;
      }, [] as Train[]);

      state.timetableDataStatus = DataStatus.Loaded;
    }
  }
})

export function useStore(): Store<State> {
  return baseUseStore(key)
}