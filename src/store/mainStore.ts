import { defineStore } from 'pinia';
import Train from '../scripts/interfaces/Train';
import { parseSpawns, getScheduledTrains, getStationTrains } from './utils';

import { OnlineScenery, ScheduledTrain, StoreState } from './typings';

import { Status } from '../typings/common';
import Station from '../scripts/interfaces/Station';
import { useApiStore } from './apiStore';
import { API } from '../typings/api';
import { StationRoutes } from '../scripts/interfaces/StationRoutes';

export const useMainStore = defineStore('store', {
  state: () =>
    ({
      region: { id: 'eu', value: 'PL1' },

      isOffline: false,

      dispatcherStatsName: '',
      dispatcherStatsStatus: Status.Data.Initialized,

      driverStatsName: '',
      driverStatsData: undefined,
      driverStatsStatus: Status.Data.Initialized,

      chosenModalTrainId: undefined,

      blockScroll: false,
      modalLastClickedTarget: null
    }) as StoreState,

  getters: {
    trainList(): Train[] {
      const apiStore = useApiStore();

      return (apiStore.activeData?.trains ?? [])
        .filter((train) => train.timetable || train.online)
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
            online: Boolean(train.online),
            driverId: train.driverId,
            driverName: train.driverName,
            currentStationName: train.currentStationName,
            currentStationHash: train.currentStationHash,
            connectedTrack: train.connectedTrack,
            stockList: stock,
            locoType,

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
                  sceneries: timetable.sceneries
                }
              : undefined
          } as Train;
        });
    },

    onlineSceneryList(state): OnlineScenery[] {
      const apiStore = useApiStore();

      if (state.isOffline) return [];
      if (!apiStore.activeData?.activeSceneries) return [];

      return apiStore.activeData?.activeSceneries.reduce((list, scenery) => {
        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return list;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return list;

        const station = this.stationList.find((s) => s.name === scenery.stationName);

        const scheduledTrains = getScheduledTrains(this.trainList, scenery, station?.generalInfo);

        const stationTrains = getStationTrains(
          this.trainList,
          scheduledTrains,
          this.region.id,
          scenery
        );

        // Remove checkpoint duplicates
        const uniqueScheduledTrains = scheduledTrains.reduce(
          (uniqueList, sTrain) =>
            uniqueList.find((v) => v.trainId === sTrain.trainId)
              ? uniqueList
              : [...uniqueList, sTrain],
          [] as ScheduledTrain[]
        );

        const dispatcherTimestamp =
          scenery.dispatcherStatus == Status.ActiveDispatcher.NO_LIMIT
            ? Date.now() + 25500000
            : scenery.dispatcherStatus > 5
            ? scenery.dispatcherStatus
            : null;

        list.push({
          name: scenery.stationName,
          hash: scenery.stationHash,
          region: scenery.region,
          maxUsers: scenery.maxUsers,
          currentUsers: scenery.currentUsers,
          spawns: parseSpawns(scenery.spawnString),
          dispatcherName: scenery.dispatcherName,
          dispatcherRate: scenery.dispatcherRate,
          dispatcherId: scenery.dispatcherId,
          dispatcherExp: scenery.dispatcherExp,
          dispatcherIsSupporter: scenery.dispatcherIsSupporter,
          scheduledTrains: scheduledTrains,
          stationTrains: stationTrains,
          dispatcherStatus: scenery.dispatcherStatus,
          dispatcherTimestamp: dispatcherTimestamp,

          isOnline: scenery.isOnline == 1,

          scheduledTrainCount: {
            all: uniqueScheduledTrains.length,
            confirmed: uniqueScheduledTrains.filter((train) => train.stopInfo.confirmed).length,
            unconfirmed: uniqueScheduledTrains.filter((train) => !train.stopInfo.confirmed).length
          }
        });

        return list;
      }, [] as OnlineScenery[]);
    },

    stationList(): Station[] {
      const apiStore = useApiStore();

      return apiStore.sceneryData.map((scenery) => {
        const routes = scenery.routesInfo.reduce(
          (acc, route) => {
            const tracksKey = route.routeTracks == 2 ? 'twoWay' : 'oneWay';
            const isElectric = route.isElectric;
            const routesKey: keyof StationRoutes = `${tracksKey}${
              !isElectric ? 'No' : ''
            }CatenaryRouteNames`;

            if (!route.isInternal) acc[routesKey].push(route.routeName);
            if (route.isRouteSBL) acc['sblRouteNames'].push(route.routeName);

            acc[tracksKey].push(route);

            return acc;
          },
          {
            oneWay: [],
            oneWayCatenaryRouteNames: [],
            oneWayNoCatenaryRouteNames: [],
            twoWay: [],
            twoWayCatenaryRouteNames: [],
            twoWayNoCatenaryRouteNames: [],
            sblRouteNames: []
          } as StationRoutes
        );

        return {
          name: scenery.name,

          generalInfo: {
            ...scenery,
            authors: scenery.authors?.split(',').map((a) => a.trim()),
            routes: routes,
            checkpoints: scenery.checkpoints
              ? scenery.checkpoints
                  .split(';')
                  .map((sub) => ({ checkpointName: sub, scheduledTrains: [] }))
              : []
          }
        };
      });
    }
  },
  actions: {
    async processStationsOnlineInfo(activeData: API.ActiveData.Response) {
      if (!activeData.activeSceneries) return;

      const onlineSceneries = activeData.activeSceneries.reduce((acc, scenery) => {
        const savedStation = this.stationList.find((st) => scenery.stationName === st.name);

        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return acc;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return acc;

        const station = this.stationList.find((s) => s.name === scenery.stationName);

        const scheduledTrains = getScheduledTrains(this.trainList, scenery, station?.generalInfo);

        const stationTrains = getStationTrains(
          this.trainList,
          scheduledTrains,
          this.region.id,
          scenery
        );

        // Remove checkpoint duplicates
        const uniqueScheduledTrains = scheduledTrains.reduce(
          (uniqueList, sTrain) =>
            uniqueList.find((v) => v.trainId === sTrain.trainId)
              ? uniqueList
              : [...uniqueList, sTrain],
          [] as ScheduledTrain[]
        );

        const dispatcherTimestamp =
          scenery.dispatcherStatus == Status.ActiveDispatcher.NO_LIMIT
            ? Date.now() + 25500000
            : scenery.dispatcherStatus > 5
            ? scenery.dispatcherStatus
            : null;

        const onlineInfo = {
          name: scenery.stationName,
          hash: scenery.stationHash,
          region: scenery.region,
          maxUsers: scenery.maxUsers,
          currentUsers: scenery.currentUsers,
          spawns: parseSpawns(scenery.spawnString),
          dispatcherName: scenery.dispatcherName,
          dispatcherRate: scenery.dispatcherRate,
          dispatcherId: scenery.dispatcherId,
          dispatcherExp: scenery.dispatcherExp,
          dispatcherIsSupporter: scenery.dispatcherIsSupporter,
          scheduledTrains: scheduledTrains,
          stationTrains: stationTrains,
          dispatcherStatus: scenery.dispatcherStatus,
          dispatcherTimestamp: dispatcherTimestamp,

          isOnline: scenery.isOnline == 1,

          scheduledTrainCount: {
            all: uniqueScheduledTrains.length,
            confirmed: uniqueScheduledTrains.filter((train) => train.stopInfo.confirmed).length,
            unconfirmed: uniqueScheduledTrains.filter((train) => !train.stopInfo.confirmed).length
          }
        };

        if (savedStation) savedStation.onlineInfo = onlineInfo;
        else
          this.stationList.push({
            name: onlineInfo.name,
            onlineInfo: onlineInfo
          });

        acc.push(onlineInfo);

        return acc;
      }, [] as OnlineScenery[]);

      // Reset online info of already offline sceneries
      this.stationList
        .filter(
          (station) =>
            station.onlineInfo &&
            onlineSceneries.findIndex(
              (os) => os.region == station.onlineInfo!.region && station.name == os.name
            ) != -1
        )
        .forEach((station) => (station.onlineInfo = undefined));
    },

    async changeRegion(region: StoreState['region']) {
      this.region = region;
    }
  }
});
