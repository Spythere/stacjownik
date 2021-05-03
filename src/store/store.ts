import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import axios from "axios";

import JSONStationData from "@/data/stationData.json";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";
import TrainStop from "@/scripts/interfaces/TrainStop";

import utils from "@/scripts/utils/storeUtils";
import DataStatus from "@/scripts/enums/DataStatus";
import { StoreData } from "@/scripts/interfaces/StoreData";

interface TimetableData {
  trainNo: number;
  driverName: string;
  driverId: number;
  currentStationName: string;
  currentStationHash: string;
  timetableId: number;
  category: string;
  route: string;
  TWR: boolean;
  SKR: boolean;
  routeDistance: number;
  followingStops: TrainStop[];
  followingSceneries: string[];
}

interface IOnlineStationData {
  dispatcherId: number;
  dispatcherName: string;
  dispatcherIsSupporter: boolean;
  stationName: string;
  stationHash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawn: number;
  lastSeen: number;
  dispatcherExp: number;
  nameFromHeader: string;
  spawnString: string;
  networkConnectionString: string;
  isOnline: number;
  dispatcherRate: number;
}

const URLs = {
  stations: "https://api.td2.info.pl:9640/?method=getStationsOnline",
  trains: "https://api.td2.info.pl:9640/?method=getTrainsOnline",
  dispatchers: "https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1"
};

@Module
export default class Store extends VuexModule {
  private trainCount: number = 0;
  private stationCount: number = 0;

  private dataConnectionStatus: DataStatus = DataStatus.Loading;
  private sceneryDataStatus: DataStatus = DataStatus.Loading;
  private timetableLoaded: DataStatus = DataStatus.Loading;

  private stationList: Station[] = [];
  private trainList: Train[] = [];

  //GETTERS
  get getAllData(): StoreData {
    return {
      stationList: this.stationList,
      trainList: this.trainList,

      activeTrainCount: this.trainCount,
      activeStationCount: this.stationCount,

      dataConnectionStatus: this.dataConnectionStatus,
      timetableDataStatus: this.timetableLoaded
    };
  }

  get getStationList() {
    return this.stationList;
  }

  get getTrainList() {
    return this.trainList;
  }

  get getTimetableDataStatus() {
    return this.timetableLoaded;
  }

  get getDataStatus() {
    return this.dataConnectionStatus;
  }
  get getSceneryDataStatus() {
    return this.sceneryDataStatus;
  }

  //ACTIONS
  @Action
  async synchronizeData() {
    this.context.commit("setSceneryData");
    this.context.commit("setSceneryDataStatus", DataStatus.Loaded);

    this.context.dispatch("fetchOnlineData");
    setInterval(() => this.context.dispatch("fetchOnlineData"), 20000);
  }

  @Action({ commit: "updateTimetableData" })
  async fetchTimetableData() {
    return this.trainList.reduce(async (acc: Promise<TimetableData[]>, train) => {
      const timetable = await (await axios.get(utils.timetableURL(train.trainNo))).data.message;
      const trainInfo = timetable.trainInfo;

      if (!timetable || !trainInfo) return acc;

      const followingStops: TrainStop[] = timetable.stopPoints.reduce((stopsAcc: TrainStop[], point) => {
        const arrivalTimestamp = utils.getTimestamp(point.arrivalTime);
        const arrivalRealTimestamp = utils.getTimestamp(point.arrivalRealTime);

        const departureTimestamp = utils.getTimestamp(point.departureTime);
        const departureRealTimestamp = utils.getTimestamp(point.departureRealTime);

        stopsAcc.push({
          stopName: point.pointName,
          stopNameRAW: point.pointNameRAW,
          stopType: point.pointStopType,
          stopDistance: point.pointDistance,

          mainStop: point.pointName.includes("strong"),

          arrivalLine: point.arrivalLine,
          arrivalTimeString: utils.timestampToString(point.arrivalTime),
          arrivalTimestamp: arrivalTimestamp,
          arrivalRealTimeString: utils.timestampToString(point.arrivalRealTime),
          arrivalRealTimestamp: arrivalRealTimestamp,
          arrivalDelay: point.arrivalDelay,

          departureLine: point.departureLine,
          departureTimeString: utils.timestampToString(point.departureTime),
          departureTimestamp: departureTimestamp,
          departureRealTimeString: utils.timestampToString(point.departureRealTime),
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
  }

  @Action
  async fetchOnlineData() {
    Promise.all([axios.get(URLs.stations), axios.get(URLs.trains), axios.get(URLs.dispatchers)])
      .then(async response => {
        const onlineStationsData: IOnlineStationData[] = response[0].data.message;
        const onlineTrainsData = await response[1].data.message;
        const onlineDispatchersData = await response[2].data.message;

        let updatedStationList = onlineStationsData.reduce((acc, station) => {
          if (station.region !== "eu" || !station.isOnline) return acc;

          const stationStatus = onlineDispatchersData.find(status => status[0] == station.stationHash && status[1] == "eu");

          const statusTimestamp = utils.getStatusTimestamp(stationStatus);
          const statusID = utils.getStatusID(stationStatus);

          const stationTrains = onlineTrainsData.filter(
            train => train.region === "eu" && train.isOnline && train.station.stationName === station.stationName
          );

          acc.push({
            stationName: station.stationName,
            stationHash: station.stationHash,
            maxUsers: station.maxUsers,
            currentUsers: station.currentUsers,
            spawns: utils.parseSpawns(station.spawnString),
            dispatcherName: station.dispatcherName,
            dispatcherRate: station.dispatcherRate,
            dispatcherId: station.dispatcherId,
            dispatcherExp: station.dispatcherExp,
            dispatcherIsSupporter: station.dispatcherIsSupporter,
            stationTrains,
            statusTimestamp,
            statusID,
            statusTimeString: utils.timestampToString(statusTimestamp)
          });

          return acc;
        }, [] as any);

        let updatedTrainList = await Promise.all(
          onlineTrainsData
            .filter(train => train.region === "eu")
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
                locoURL: utils.getLocoURL(locoType)
              };
            })
        );

        this.context.commit("updateOnlineStations", updatedStationList);
        this.context.commit("updateOnlineTrains", updatedTrainList);

        this.context.dispatch("fetchTimetableData");
      })
      .catch(err => {
        this.context.commit("setDataConnectionStatus", DataStatus.Error);
      });
  }

  //MUTATIONS
  @Mutation
  private setDataConnectionStatus(status: DataStatus) {
    this.dataConnectionStatus = status;
  }

  @Mutation
  private setSceneryDataStatus(status: DataStatus) {
    this.sceneryDataStatus = status;
  }

  @Mutation
  private setSceneryData() {
    /*  
    0: stationName,
    1: stationURL,
    2: stationlines,
    3: stationProject?,
    4: reqLevel,
    5: supportersOnly,
    6: signalType,
    7: controlType,
    8: SBL,
    9: two-way block,
    10: routes, one-way, catenary,
    11: routes, one-way, no catenary,
    12: routes, two-way, catenary,
    13: routes, two-way, no catenary,
    14: subStations?,
    15: stops?,
    16: default,
    17: nonPublic,
    18: unavailable
    */

    this.stationList = JSONStationData.map(station => ({
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
      checkpoints: station[14] ? (station[14] as string[]).map(sub => ({ checkpointName: sub, scheduledTrains: [] })) : null,
      stops: station[15] as string[],

      default: station[16] as boolean,
      nonPublic: station[17] as boolean,
      unavailable: station[18] as boolean,

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
  }

  @Mutation
  private updateOnlineStations(updatedStationList: any[]) {
    this.stationList = this.stationList.reduce((acc: Station[], station) => {
      const onlineStationData = updatedStationList.find(updatedStation => updatedStation.stationName === station.stationName);
      const registeredStation = JSONStationData.find(data => data[0] === station.stationName);

      if (onlineStationData)
        acc.push({
          ...station,
          ...onlineStationData,
          online: true
        });
      else if (registeredStation)
        acc.push({
          ...station,
          stationProject: "",
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
          scheduledTrains: [],
          checkpoints: null
        });

      return acc;
    }, [] as Station[]);

    updatedStationList
      .filter(uStation => !this.stationList.some(station => uStation.stationName === station.stationName))
      .forEach(uStation => {
        this.stationList.push({
          ...uStation,
          scheduledTrains: [],
          stationTrains: [],
          subStations: [],
          online: true,
          reqLevel: "-1",
          nonPublic: true
        });
      });

    this.stationCount = this.stationList.filter(station => station.online).length;
    this.dataConnectionStatus = DataStatus.Loaded;
  }

  @Mutation
  private updateOnlineTrains(updatedTrainList) {
    this.trainList = updatedTrainList.reduce((acc, updatedTrain) => {
      const trainData = this.trainList.find(train => train.trainNo === updatedTrain.trainNo);

      if (trainData) acc.push({ ...trainData, ...updatedTrain });
      else acc.push({ ...updatedTrain });

      return acc;
    }, [] as Train[]);

    this.trainCount = this.trainList.filter(train => train.online).length;
    this.dataConnectionStatus = DataStatus.Loaded;
  }

  @Mutation
  private updateTimetableData(timetableList: TimetableData[]) {
    this.stationList = this.stationList.map(station => {
      const stationName = station.stationName.toLowerCase();

      const scheduledTrains: Station["scheduledTrains"] = timetableList.reduce((acc: Station["scheduledTrains"], timetable: TimetableData, index) => {
        if (!timetable.followingSceneries.includes(station.stationHash)) return acc;

        const stopInfoIndex = timetable.followingStops.findIndex(stop => {
          const stopName = stop.stopNameRAW.toLowerCase();

          if (stationName === stopName) return true;
          if (stopName.includes(stationName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
          if (stationName.includes(stopName) && !stop.stopName.includes("po.") && !stop.stopName.includes("podg.")) return true;
          if (stopName.includes("podg.") && stopName.split(", podg.")[0] && stationName.includes(stopName.split(", podg.")[0])) return true;

          if (station.stops && station.stops.includes(stop.stopNameRAW)) return true;

          return false;
        });

        if (stopInfoIndex == -1) return acc;

        const trainStop = timetable.followingStops[stopInfoIndex];
        const trainStopStatus = utils.getTrainStopStatus(trainStop, timetable, station);

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

        for (let checkpoint of station.checkpoints) {
          timetableList.forEach(timetable => {
            timetable.followingStops
              .filter(trainStop => trainStop.stopNameRAW.toLowerCase() === checkpoint.checkpointName.toLowerCase())
              .forEach(trainStop => {
                const trainStopStatus = utils.getTrainStopStatus(trainStop, timetable, station);

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

    this.trainList = this.trainList.reduce((acc, train) => {
      const timetableData = timetableList.find(data => data && data.trainNo === train.trainNo);

      if (timetableData) {
        const trainData = this.stationList
          .find(station => station.stationName === train.currentStationName)
          ?.scheduledTrains.find(stationTrain => stationTrain.trainNo === train.trainNo);

        acc.push({ ...train, timetableData, stopStatus: trainData?.stopStatus || "", stopLabel: trainData?.stopLabel || "" });
      }

      return acc;
    }, [] as Train[]);

    this.timetableLoaded = DataStatus.Loaded;
  }
}
