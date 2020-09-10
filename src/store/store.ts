import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import axios from 'axios';

import JSONStationData from '@/data/stations.json';

import Station from '@/scripts/interfaces/Station';
import Train from '@/scripts/interfaces/Train';
import Timetable from '@/scripts/interfaces/Timetable';

enum Status {
  Loading = 0,
  Error = 1,
  Loaded = 2,
}

const URLs = {
  stations: 'https://api.td2.info.pl:9640/?method=getStationsOnline',
  trains: 'https://api.td2.info.pl:9640/?method=getTrainsOnline',
  dispatchers: 'https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1',
};

const timetableURL = (trainNo: number) => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`;
const getLocoURL = (locoType: string) => `https://rj.td2.info.pl/dist/img/thumbnails/${locoType.includes('EN') ? locoType + 'rb' : locoType}.png`;

const getStationLabel = (stationStatus: any) => {
  if (!stationStatus) return 'NIEZALOGOWANY';

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
      if (statusTimestamp - Date.now() > 21000000) return 'BEZ LIMITU';

      return `DO ${new Date(statusTimestamp).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })}`;

    case 1:
      return 'Z/W';

    case 2:
      if (statusTimestamp == 0) return 'KOŃCZY';
      break;

    case 3:
      return 'BRAK MIEJSCA';

    default:
      break;
  }

  return 'NIEDOSTĘPNY';
};

const getOpenSpawns = (spawnString: string) => (spawnString ? spawnString.split(';').map(v => (v.split(',')[6] ? v.split(',')[6] : v.split(',')[0])) : '');
const getTimestamp = (date: string) => (date ? new Date(date).getTime() : 0);

@Module
export default class Store extends VuexModule {
  private trainCount: number = 0;
  private stationCount: number = 0;

  //   private stationsConnectionStatus: Status = Status.Loading;
  //   private trainsConnectionStatus: Status = Status.Loading;
  //   private dataConnectionStatus: Status = Status.Loading;

  private dataConnectionStatus: Status = Status.Loading;

  private stationList: Station[] = [];
  private trainList: Train[] = [];

  //GETTERS
  get getAllData() {
    return {
      stationList: this.stationList,
      trainList: this.trainList,
      trainCount: this.trainCount,
      stationCount: this.stationCount,
      dataConnectionStatus: this.dataConnectionStatus,
    };
  }

  get getStationList() {
    return this.stationList;
  }

  get getTrainList() {
    return this.trainList;
  }

  //ACTIONS
  @Action
  async synchronizeData() {
    this.context.commit('setJSONData');

    this.context.dispatch('fetchOnlineData');
    setInterval(() => this.context.dispatch('fetchOnlineData'), 5000);
  }

  @Action({ commit: 'updateTimetableData' })
  async fetchTimetableData() {
    return await Promise.all(
      this.trainList.map(async train => {
        const timetable = await (await axios.get(timetableURL(train.trainNo))).data.message;
        const trainInfo = timetable.trainInfo;

        let timetableData;

        if (timetable && trainInfo) {
          timetableData = {};

          const followingStops = timetable.stopPoints.reduce((acc, point) => {
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

              acc.push(stopObj);
            }

            return acc;
          }, []);

          timetableData = {
            trainNo: train.trainNo,
            driverName: train.driverName,
            driverId: train.driverId,
            currentStationName: train.currentStationName,
            timetableId: trainInfo.timetableId,
            category: trainInfo.trainCategoryCode,
            route: trainInfo.route,
            TWR: trainInfo.twr,
            SKR: trainInfo.skr,
            routeDistance: timetable.stopPoints[timetable.stopPoints.length - 1].pointDistance,
            followingStops,
          };
        }

        return timetableData;
      })
    );
  }

  @Action
  async fetchOnlineData() {
    Promise.all([axios.get(URLs.stations), axios.get(URLs.trains), axios.get(URLs.dispatchers)])
      .then(async response => {
        const onlineStationsData = response[0].data.message;
        const onlineTrainsData = await response[1].data.message;
        const onlineDispatchersData = await response[2].data.message;

        let updatedStationList = onlineStationsData.reduce((acc, station) => {
          if (station.region !== 'eu' || !station.isOnline) return acc;

          const stationStatus = onlineDispatchersData.find(status => status[0] == station.stationHash && status[1] == 'eu');

          const statusLabel = getStationLabel(stationStatus);
          const statusTimestamp = stationStatus ? stationStatus[3] : -1;

          const stationTrains = onlineTrainsData.filter(train => train.region === 'eu' && train.isOnline && train.station.stationName === station.stationName);

          acc.push({
            stationName: station.stationName,
            stationHash: station.stationHash,
            maxUsers: station.maxUsers,
            currentUsers: station.currentUsers,
            spawnString: getOpenSpawns(station.spawnString),
            dispatcherName: station.dispatcherName,
            dispatcherRate: station.dispatcherRate,
            dispatcherId: station.dispatcherId,
            dispatcherExp: station.dispatcherExp,
            occupiedTo: statusLabel,
            stationTrains,
            statusTimestamp,
          });

          return acc;
        }, []);

        let updatedTrainList = await Promise.all(
          onlineTrainsData
            .filter(train => train.region === 'eu')
            .map(async train => {
              const locoType = train.dataCon.split(';') ? train.dataCon.split(';')[0] : train.dataCon;

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
                connectedTrack: train.dataSceneryConnection,
                locoType,
                locoURL: getLocoURL(locoType),
              };
            })
        );

        this.context.commit('updateOnlineStations', updatedStationList);
        this.context.commit('updateOnlineTrains', updatedTrainList);

        this.context.dispatch('fetchTimetableData');
      })
      .catch(err => {
        this.context.commit('setDataConnectionStatus', Status.Error);
      });
  }

  //MUTATIONS
  @Mutation
  private setDataConnectionStatus(status: Status) {
    this.dataConnectionStatus = status;
  }

  @Mutation setJSONData() {
    this.stationList = JSONStationData.map(stationData => ({
      stationProject: '',
      spawnString: '',
      stationHash: '',
      maxUsers: 0,
      currentUsers: 0,
      dispatcherName: '',
      dispatcherRate: 0,
      dispatcherExp: -1,
      dispatcherId: 0,
      online: false,
      occupiedTo: 'WOLNA',
      statusTimestamp: 0,
      stationTrains: [],
      scheduledTrains: [],
      ...stationData,
    }));
  }

  @Mutation
  private updateOnlineStations(updatedStationList: any[]) {
    this.stationList = this.stationList.reduce((acc, station) => {
      const onlineStationData = updatedStationList.find(updatedStation => updatedStation.stationName === station.stationName);

      if (!onlineStationData) {
        acc.push({
          ...station,
          stationProject: '',
          spawnString: '',
          stationHash: '',
          maxUsers: 0,
          currentUsers: 0,
          dispatcherName: '',
          dispatcherRate: 0,
          dispatcherExp: -1,
          dispatcherId: 0,
          occupiedTo: 'WOLNA',
          statusTimestamp: 0,
          online: false,
        });
      } else
        acc.push({
          ...station,
          ...onlineStationData,
          online: true,
        });

      return acc;
    }, [] as Station[]);

    // Dodawanie do listy online potencjalnych scenerii niewpisanych do bazy
    updatedStationList.forEach(updatedStation => {
      const alreadyInList: any = this.stationList.find(station => station.stationName === updatedStation.stationName);

      if (!alreadyInList) {
        this.stationList.push({
          ...updatedStation,
          online: true,
          reqLevel: '-1',
        });
      }
    });

    this.stationCount = this.stationList.filter(station => station.online).length;
    this.dataConnectionStatus = Status.Loaded;
  }

  @Mutation
  private updateOnlineTrains(updatedTrainList) {
    this.trainList = updatedTrainList.reduce((acc, updatedTrain) => {
      const trainData = this.trainList.find(train => train.trainNo === updatedTrain.trainNo);

      if (trainData) acc.push({ ...updatedTrain, ...trainData });
      else acc.push({ ...updatedTrain });

      return acc;
    }, [] as Train[]);

    this.trainCount = this.trainList.filter(train => train.online).length;
    this.dataConnectionStatus = Status.Loaded;
  }

  @Mutation
  private updateTimetableData(timetableList: any[]) {
    this.stationList = this.stationList.map(station => {
      const scheduledTrains = timetableList.reduce((acc, timetableData: any) => {
        const scheduledIndex = timetableData
          ? timetableData.followingStops.findIndex(
              (stop: any) =>
                station.stationName.toLowerCase().includes(stop.stopName) ||
                station.stationName.toLowerCase().includes(stop.stopName.toLowerCase().split(',')[0]) ||
                (station.stationName.toLowerCase().includes(stop.stopName.toLowerCase().split(' ')[0]) && station.stationName.toLowerCase().includes('lcs'))
            )
          : -1;

        if (scheduledIndex >= 0) {
          const scheduledData = timetableData.followingStops[scheduledIndex];

          acc.push({
            ...scheduledData,
            trainNo: timetableData.trainNo,
            driverName: timetableData.driverName,
            driverId: timetableData.driverId,
            currentStationName: timetableData.currentStationName,
          });
        }

        return acc;
      }, []);

      // console.log('gituwa');

      return { ...station, scheduledTrains };
    });

    this.trainList = this.trainList.reduce((acc, train) => {
      const timetableData = timetableList.find(data => data && data.trainNo === train.trainNo);

      if (timetableData) acc.push({ ...train, timetableData });

      return acc;
    }, [] as Train[]);
  }
}
