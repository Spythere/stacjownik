import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';
import axios from 'axios';

import JSONStationData from '@/data/stationData.json';

import Station from '@/scripts/interfaces/Station';
import Train from '@/scripts/interfaces/Train';
import TrainStop from '@/scripts/interfaces/TrainStop';

enum Status {
  Initialized = -1,
  Loading = 0,
  Error = 1,
  Loaded = 2,
}

interface ITimetableData {
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

const URLs = {
  stations: 'https://api.td2.info.pl:9640/?method=getStationsOnline',
  trains: 'https://api.td2.info.pl:9640/?method=getTrainsOnline',
  dispatchers: 'https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1',
};

const timetableURL = (trainNo: number) => `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`;
const getLocoURL = (locoType: string) => `https://rj.td2.info.pl/dist/img/thumbnails/${locoType.includes('EN') ? locoType + 'rb' : locoType}.png`;

const getStatusLabel = (stationStatus: any) => {
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

const getStatusTimestamp = (stationStatus: any) => {
  if (!stationStatus) return -2;

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
    case 1:
    case 3:
      return statusTimestamp;

    case 2:
      if (statusTimestamp == 0) return 0;
      break;

    default:
      break;
  }

  return -1;
};

const parseSpawns = (spawnString: string) => {
  if (!spawnString) return [];
  if (spawnString === 'NO_SPAWN') return [];

  return spawnString.split(';').map(spawn => {
    const spawnArray = spawn.split(',');
    const spawnName = spawnArray[6] ? spawnArray[6] : spawnArray[0];
    const spawnLength = parseInt(spawnArray[2]);

    return { spawnName, spawnLength };
  });
};

const getTimestamp = (date: string) => (date ? new Date(date).getTime() : 0);
const timestampToTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });

@Module
export default class Store extends VuexModule {
  private trainCount: number = 0;
  private stationCount: number = 0;

  private dataConnectionStatus: Status = Status.Loading;
  private sceneryDataStatus: Status = Status.Loading;
  private timetableLoaded: Status = Status.Loading;

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
      timetableDataStatus: this.timetableLoaded,
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
    // axios
    //   .get(URLs.sceneryInfo)
    //   .then(response => {
    //     const data: ISceneryInfoData[] = response.data;

    //     this.context.commit('setSceneryData', data);
    //     this.context.commit('setSceneryDataStatus', Status.Loaded);

    //     this.context.dispatch('fetchOnlineData');
    //     setInterval(() => this.context.dispatch('fetchOnlineData'), 20000);
    //   })
    //   .catch(err => {
    //     this.context.commit('setSceneryDataStatus', Status.Error);
    //     console.error('Ups! Coś poszło nie tak!', err);
    //   });

    this.context.commit('setSceneryData');
    this.context.commit('setSceneryDataStatus', Status.Loaded);

    this.context.dispatch('fetchOnlineData');
    setInterval(() => this.context.dispatch('fetchOnlineData'), 20000);
  }

  @Action({ commit: 'updateTimetableData' })
  async fetchTimetableData() {
    return this.trainList.reduce(async (acc: Promise<ITimetableData[]>, train) => {
      const timetable = await (await axios.get(timetableURL(train.trainNo))).data.message;
      const trainInfo = timetable.trainInfo;

      if (!timetable || !trainInfo) return acc;

      const followingStops: TrainStop[] = timetable.stopPoints.reduce((stopsAcc: TrainStop[], point) => {
        const arrivalTimestamp = getTimestamp(point.arrivalTime);
        const arrivalRealTimestamp = getTimestamp(point.arrivalRealTime);

        const departureTimestamp = getTimestamp(point.departureTime);
        const departureRealTimestamp = getTimestamp(point.departureRealTime);

        stopsAcc.push({
          stopName: point.pointName,
          stopNameRAW: point.pointNameRAW,
          stopType: point.pointStopType,
          mainStop: point.pointName.includes('strong'),

          arrivalLine: point.arrivalLine,
          arrivalTimeString: timestampToTime(point.arrivalTime),
          arrivalTimestamp: arrivalTimestamp,
          arrivalRealTimeString: timestampToTime(point.arrivalRealTime),
          arrivalRealTimestamp: arrivalRealTimestamp,
          arrivalDelay: point.arrivalDelay,

          departureLine: point.departureLine,
          departureTimeString: timestampToTime(point.departureTime),
          departureTimestamp: departureTimestamp,
          departureRealTimeString: timestampToTime(point.departureRealTime),
          departureRealTimestamp: departureRealTimestamp,
          departureDelay: point.departureDelay,

          beginsHere: arrivalTimestamp == 0,
          terminatesHere: departureTimestamp == 0,

          confirmed: point.confirmed,
          stopped: point.isStopped,
          stopTime: point.pointStopTime,
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
        followingSceneries: trainInfo.sceneries,
      });

      return acc;
    }, Promise.resolve([]));
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

          const statusLabel = getStatusLabel(stationStatus);
          const statusTimestamp = getStatusTimestamp(stationStatus);

          const stationTrains = onlineTrainsData.filter(
            train => train.region === 'eu' && train.isOnline && train.station.stationName === station.stationName
          );

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
                currentStationHash: train.station.stationHash,
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

  @Mutation
  private setSceneryDataStatus(status: Status) {
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
      supportersOnly: station[5] == 'TAK',
      signalType: station[6] as string,
      controlType: station[7] as string,
      SBL: station[8] as string,
      TWB: station[9] as string,
      routes: {
        oneWay: {
          catenary: station[10] as number,
          noCatenary: station[11] as number,
        },
        twoWay: {
          catenary: station[12] as number,
          noCatenary: station[13] as number,
        },
      },
      checkpoints: station[14] ? (station[14] as string[]).map(sub => ({ checkpointName: sub, scheduledTrains: [] })) : null,
      stops: station[15] as string[],

      default: station[16] as boolean,
      nonPublic: station[17] as boolean,
      unavailable: station[18] as boolean,

      stationHash: '',
      maxUsers: 0,
      currentUsers: 0,
      dispatcherName: '',
      dispatcherRate: 0,
      dispatcherExp: -1,
      dispatcherId: 0,
      dispatcherIsSupporter: false,
      online: false,
      occupiedTo: 'WOLNA',
      statusTimestamp: -3,
      stationTrains: [],
      scheduledTrains: [],
      spawns: [],
    }));
  }

  // @Mutation setSceneryData(data: ISceneryInfoData[]) {
  //   this.sceneryData = data;

  //   this.stationList = data.map(scenery => ({
  //     stationName: scenery.stationName,
  //     stationURL: scenery.stationURL,
  //     stationLines: scenery.stationLines,
  //     stationProject: scenery.stationProject,
  //     reqLevel: scenery.reqLevel,
  //     supportersOnly: scenery.supportersOnly,
  //     signalType: scenery.signalType,
  //     controlType: scenery.controlType,
  //     SBL: scenery.SBL,
  //     TWB: scenery.twoWayBlock,
  //     routes: {
  //       oneWay: {
  //         catenary: scenery.routesOneWayCatenary,
  //         noCatenary: scenery.routesOneWayOther,
  //       },
  //       twoWay: {
  //         catenary: scenery.routesTwoWayCatenary,
  //         noCatenary: scenery.routesToWayOther,
  //       },
  //     },
  //     checkpoints: scenery.checkpoints.length ? scenery.checkpoints.map(cp => ({ checkpointName: cp, scheduledTrains: [] })) : null,
  //     stops: scenery.stops,

  //     default: scenery.default,
  //     nonPublic: scenery.nonPublic,
  //     unavailable: scenery.unavailable,

  //     stationHash: '',
  //     maxUsers: 0,
  //     currentUsers: 0,
  //     dispatcherName: '',
  //     dispatcherRate: 0,
  //     dispatcherExp: -1,
  //     dispatcherId: 0,
  //     dispatcherIsSupporter: false,
  //     online: false,
  //     occupiedTo: 'WOLNA',
  //     statusTimestamp: -3,
  //     stationTrains: [],
  //     scheduledTrains: [],
  //     spawns: [],
  //   }));
  // }

  @Mutation
  private updateOnlineStations(updatedStationList: any[]) {
    this.stationList = this.stationList.reduce((acc, station) => {
      const onlineStationData = updatedStationList.find(updatedStation => updatedStation.stationName === station.stationName);
      const registeredStation = JSONStationData.find(data => data[0] === station.stationName);

      if (onlineStationData)
        acc.push({
          ...station,
          ...onlineStationData,
          online: true,
        });
      else if (registeredStation)
        acc.push({
          ...station,
          stationProject: '',
          stationHash: '',
          maxUsers: 0,
          currentUsers: 0,
          dispatcherName: '',
          dispatcherRate: 0,
          dispatcherExp: -1,
          dispatcherId: 0,
          dispatcherIsSupporter: false,
          online: false,
          occupiedTo: 'WOLNA',
          statusTimestamp: -3,
          stationTrains: [],
          scheduledTrains: [],
          checkpoints: null,
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
          reqLevel: '-1',
          nonPublic: true,
        });
      });

    this.stationCount = this.stationList.filter(station => station.online).length;
    this.dataConnectionStatus = Status.Loaded;
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
    this.dataConnectionStatus = Status.Loaded;
  }

  @Mutation
  private updateTimetableData(timetableList: ITimetableData[]) {
    this.stationList = this.stationList.map(station => {
      const stationName = station.stationName.toLowerCase();
      const scheduledTrains: Station['scheduledTrains'] = timetableList.reduce(
        (acc: Station['scheduledTrains'], timetableData: ITimetableData, index) => {
          if (!timetableData.followingSceneries.includes(station.stationHash)) return acc;

          const stopInfoIndex = timetableData.followingStops.findIndex(stop => {
            const stopName = stop.stopNameRAW.toLowerCase();

            if (stationName === stopName) return true;
            if (stopName.includes(stationName) && !stop.stopName.includes('po.') && !stop.stopName.includes('podg.')) return true;
            if (stationName.includes(stopName) && !stop.stopName.includes('po.') && !stop.stopName.includes('podg.')) return true;
            if (stopName.includes('podg.') && stopName.split(', podg.')[0] && stationName.includes(stopName.split(', podg.')[0])) return true;

            if (station.stops && station.stops.includes(stop.stopNameRAW)) return true;

            return false;
          });

          if (stopInfoIndex == -1) return acc;

          const stopInfo = timetableData.followingStops[stopInfoIndex];

          let stopStatus = '';
          let stopLabel = '';
          let stopStatusID = 0;
          let nearestStop = '';

          if (stopInfo.terminatesHere && stopInfo.confirmed) {
            stopStatus = 'terminated';
            stopLabel = 'Skończył bieg';
            stopStatusID = 5;
          } else if (!stopInfo.terminatesHere && stopInfo.confirmed && timetableData.currentStationName == station.stationName) {
            stopStatus = 'departed';
            stopLabel = 'Odprawiony';
            stopStatusID = 2;
          } else if (!stopInfo.terminatesHere && stopInfo.confirmed && timetableData.currentStationName != station.stationName) {
            stopStatus = 'departed-away';
            stopLabel = 'Odjechał';
            stopStatusID = 4;
          } else if (timetableData.currentStationName == station.stationName && !stopInfo.stopped) {
            stopStatus = 'online';
            stopLabel = 'Na stacji';
            stopStatusID = 0;
          } else if (timetableData.currentStationName == station.stationName && stopInfo.stopped) {
            stopStatus = 'stopped';
            stopLabel = 'Postój';
            stopStatusID = 1;
          } else if (timetableData.currentStationName != station.stationName) {
            stopStatus = 'arriving';
            stopLabel = 'W drodze';
            stopStatusID = 3;
          }

          if (stopInfoIndex < timetableData.followingStops.length - 2) {
            for (let i = stopInfoIndex + 1; i < timetableData.followingStops.length - 1; i++) {
              const stop = timetableData.followingStops[i];

              if (stop.mainStop && stop.stopType.includes('ph')) {
                nearestStop = stop.stopNameRAW;
                break;
              }
            }
          }

          acc.push({
            trainNo: timetableData.trainNo,
            driverName: timetableData.driverName,
            driverId: timetableData.driverId,
            currentStationName: timetableData.currentStationName,
            currentStationHash: timetableData.currentStationHash,
            category: timetableData.category,
            beginsAt: timetableData.followingStops[0].stopNameRAW,
            terminatesAt: timetableData.followingStops[timetableData.followingStops.length - 1].stopNameRAW,
            nearestStop,
            stopInfo,
            stopLabel,
            stopStatus,
            stopStatusID,
          });

          return acc;
        },
        []
      );

      if (station.checkpoints) {
        station.checkpoints.forEach(cp => (cp.scheduledTrains.length = 0));

        for (let checkpoint of station.checkpoints) {
          timetableList.reduce((acc, data) => {
            data.followingStops
              .filter(stop => stop.stopNameRAW === checkpoint.checkpointName)
              .forEach(stopInfo => {
                // const stopInfo = data.followingStops[stopInfoIndex];

                let stopStatus = '';
                let stopLabel = '';
                let nearestStop = '';
                let stopStatusID = 0;

                if (stopInfo.terminatesHere && stopInfo.confirmed) {
                  stopStatus = 'terminated';
                  stopLabel = 'Skończył bieg';
                  stopStatusID = 5;
                } else if (!stopInfo.terminatesHere && stopInfo.confirmed && data.currentStationName == station.stationName) {
                  stopStatus = 'departed';
                  stopLabel = 'Odprawiony';
                  stopStatusID = 2;
                } else if (!stopInfo.terminatesHere && stopInfo.confirmed && data.currentStationName != station.stationName) {
                  stopStatus = 'departed-away';
                  stopLabel = 'Odjechał';
                  stopStatusID = 4;
                } else if (data.currentStationName == station.stationName && !stopInfo.stopped) {
                  stopStatus = 'online';
                  stopLabel = 'Na stacji';
                  stopStatusID = 0;
                } else if (data.currentStationName == station.stationName && stopInfo.stopped) {
                  stopStatus = 'stopped';
                  stopLabel = 'Postój';
                  stopStatusID = 1;
                } else if (data.currentStationName != station.stationName) {
                  stopStatus = 'arriving';
                  stopLabel = 'W drodze';
                  stopStatusID = 3;
                }

                checkpoint.scheduledTrains.push({
                  trainNo: data.trainNo,
                  driverName: data.driverName,
                  driverId: data.driverId,
                  currentStationName: data.currentStationName,
                  currentStationHash: data.currentStationHash,
                  category: data.category,
                  beginsAt: data.followingStops[0].stopNameRAW,
                  terminatesAt: data.followingStops[data.followingStops.length - 1].stopNameRAW,
                  stopInfo,
                  stopLabel,
                  stopStatus,
                  nearestStop,
                  stopStatusID,
                });
              });

            return acc;
          }, []);
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

        acc.push({ ...train, timetableData, stopStatus: trainData?.stopStatus || '', stopLabel: trainData?.stopLabel || '' });
      }

      return acc;
    }, [] as Train[]);

    this.timetableLoaded = Status.Loaded;
  }
}
