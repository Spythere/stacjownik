import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

import Train from '@/scripts/interfaces/Train';

import axios from 'axios';
const API_URL = 'https://api.td2.info.pl:9640/?method=getTrainsOnline';

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
    pointStopType: string;
    arrivalLine: string;
    departureLine: string;
    arrivalTime: string;
    arrivalDelay: number;
    departureTime: string;
    departureDelay: number;
    confirmed: boolean;
    stopped: boolean;
    pointStopTime: number;
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

const getTimestamp = (date: string) => (date ? new Date(date).getTime() : 0);

const getTimetableURL = (trainNo: number) => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`;

const getLocoURL = (locoType: string) => `https://rj.td2.info.pl/dist/img/thumbnails/${locoType.includes('EN') ? locoType + 'rb' : locoType}.png`;

@Module
export default class TrainsModule extends VuexModule {
  onlineTrainsData: Train[] = [];
  onlineTrainsState: ConnState = ConnState.Loading;

  @Action({ commit: 'loadTrainsData' })
  async fetchTrainsData() {
    let trainDataResponse;

    try {
      trainDataResponse = await axios.get(API_URL);
    } catch (error) {
      this.context.commit('setConnectionState', ConnState.Error);
      return null;
    }

    let onlineTrainsData: TrainData[] = trainDataResponse.data.message;

    return await Promise.all(
      onlineTrainsData.map(async train => {
        const timetableResponseData: TimetableResponseData | null = (await axios.get(getTimetableURL(train.trainNo))).data.message;

        let timetableData: TimetableData | null = null;

        if (timetableResponseData && timetableResponseData.trainInfo) {
          const routeDistance: number = timetableResponseData.stopPoints[timetableResponseData.stopPoints.length - 1].pointDistance;

          timetableData = {
            ...timetableResponseData.trainInfo,
            routeDistance,
            stopPoints: timetableResponseData.stopPoints,
          };
        }

        const locoType = train.dataCon.split(';') ? train.dataCon.split(';')[0] : train.dataCon;

        const followingStops = timetableResponseData?.stopPoints.reduce(
          (acc, point) => {
            const stopObj: any = {};
            if (!point.pointName.includes('Południowy') && (point.pointName.includes('strong') || point.pointName.includes('podg.'))) {
              if (point.pointName.includes('strong')) {
                stopObj.stopName = point.pointNameRAW;

                stopObj.stopType = point.pointStopType;
              } else {
                stopObj.stopName = point.pointNameRAW.split(',')[0];
                stopObj.stopType = 'podg.';
              }

              stopObj.arrivalTime = getTimestamp(point.arrivalTime);
              stopObj.departureTime = getTimestamp(point.departureTime);
              stopObj.arrivalDelay = point.arrivalDelay;
              stopObj.departureDelay = point.departureDelay;
              stopObj.beginsHere = getTimestamp(point.arrivalTime) == 0 ? true : false;
              stopObj.terminatesHere = getTimestamp(point.departureTime) == 0 ? true : false;
              stopObj.confirmed = point.confirmed;
              stopObj.stopped = point.stopped;
              stopObj.currentStationName = train.station.stationName;

              acc.push(stopObj);
            }

            return acc;
          },
          [] as {
            stopName: string;
            stopType: string;
            arrivalTime: number;
            arrivalDelay: number;
            departureTime: number;
            departureDelay: number;
            confirmed: boolean;
            stopped: boolean;
            stopTime: number;
            beginsHere: boolean;
            terminatesHere: boolean;
          }[]
        );

        return {
          online: train.isOnline,
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
          followingStops,
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
