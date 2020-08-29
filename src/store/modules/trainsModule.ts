import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";

import Train from "@/scripts/interfaces/Train";

import axios from "axios";
const API_URL = "https://api.td2.info.pl:9640/?method=getTrainsOnline";

enum ConnState {
  Loading = 0,
  Error = 1,
  Connected = 2,
}

interface TrainData {
  driverId: number;
  driverName: string;
  trainNo: number;
  station: { stationName: string };
  dataMass: number;
  dataLength: number;
  dataSpeed: number;
  dataDistance: number;
  dataSignal: string;
  dataCon: string;
  dataSceneryConnection: string;
  isOnline: boolean;
}

interface TimetableResponseData {
  stopPoints: {
    pointDistance: number;
    pointNameRAW: string;
    pointName: string;
  }[];
  trainInfo: {
    timetableId: number;
    trainCategoryCode: string;
    route: string;
    twr: boolean;
    skr: boolean;
    sceneries: string[];
  };
}

interface TimetableData {
  timetableId: number;
  trainCategoryCode: string;
  route: string;
  twr: boolean;
  skr: boolean;
  sceneries: string[];
  routeDistance: number;
  stopPoints?: {}[];
}

const getTimetableURL = (trainNo: number) =>
  `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`;

const getLocoURL = (locoType: string) =>
  `https://rj.td2.info.pl/dist/img/thumbnails/${
    locoType.includes("EN") ? locoType + "rb" : locoType
  }.png`;

@Module
export default class TrainsModule extends VuexModule {
  onlineTrainsData: Train[] = [];
  onlineTrainsState: ConnState = ConnState.Loading;

  @Action({ commit: "loadTrainsData" })
  async fetchTrainsData() {
    let trainDataResponse;

    try {
      trainDataResponse = await axios.get(API_URL);
    } catch (error) {
      this.context.commit("setConnectionState", ConnState.Error);
      return null;
    }

    let onlineTrainsData: TrainData[] = trainDataResponse.data.message;

    return await Promise.all(
      onlineTrainsData.map(async (train) => {
        const timetableResponseData: TimetableResponseData | null = (
          await axios.get(getTimetableURL(train.trainNo))
        ).data.message;

        let timetableData: TimetableData | null = null;

        if (timetableResponseData && timetableResponseData.trainInfo) {
          const routeDistance: number =
            timetableResponseData.stopPoints[
              timetableResponseData.stopPoints.length - 1
            ].pointDistance;

          timetableData = {
            ...timetableResponseData.trainInfo,
            routeDistance,
            stopPoints: timetableResponseData.stopPoints,
          };
        }

        const locoType = train.dataCon.split(";")
          ? train.dataCon.split(";")[0]
          : train.dataCon;

        const stopPoints = timetableResponseData?.stopPoints.reduce(
          (acc, point) => {
            if (point.pointName.includes("strong")) {
              acc.push(point.pointNameRAW);
            }

            return acc;
          },
          [] as string[]
        );

        return {
          driverId: train.driverId,
          driverName: train.driverName,
          trainNo: train.trainNo,
          currentStationName: train.station.stationName,
          mass: train.dataMass,
          length: train.dataLength,
          speed: train.dataSpeed,
          distance: train.dataDistance,
          signal: train.dataSignal,
          connectedTrack: train.dataSceneryConnection,
          locoType,
          locoURL: getLocoURL(locoType),
          noTimetable: timetableData == null,
          route: timetableData?.route,
          timetableId: timetableData?.timetableId,
          category: timetableData?.trainCategoryCode,
          routeDistance: timetableData?.routeDistance || 0,
          sceneries: stopPoints,
          stopPoints: timetableData?.stopPoints,
          TWR: timetableData?.twr,
          SKR: timetableData?.skr,
        };
      })
    );
  }

  @Mutation
  private loadTrainsData(data: Train[] | null) {
    if (data) {
      this.onlineTrainsData = data;
      this.onlineTrainsState = ConnState.Connected;
    }
  }

  @Mutation
  private setConnectionState(state: ConnState) {
    this.onlineTrainsState = state;
  }

  get trainsDataList() {
    return this.onlineTrainsData;
  }

  get trainsDataState() {
    return this.onlineTrainsState;
  }
}
