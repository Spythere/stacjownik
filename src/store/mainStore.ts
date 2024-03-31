import { defineStore } from 'pinia';
import Train from '../scripts/interfaces/Train';
import { parseSpawns, getScheduledTrains, getStationTrains } from './utils';

import { ActiveScenery, ScheduledTrain, StoreState } from './typings';

import { Status } from '../typings/common';
import Station from '../scripts/interfaces/Station';
import { useApiStore } from './apiStore';
import { StationRoutes } from '../scripts/interfaces/StationRoutes';

export const useMainStore = defineStore('store', {
  state: () =>
    ({
      region: { id: 'eu', value: 'PL1' },

      isOffline: false,
      isNewUpdate: false,

      dispatcherStatsName: '',
      dispatcherStatsStatus: Status.Data.Initialized,

      driverStatsName: '',
      driverStatsData: undefined,
      driverStatsStatus: Status.Data.Initialized,

      chosenModalTrainId: undefined,

      modalLastClickedTarget: null,

      mousePos: { x: 0, y: 0 },
      popUpData: { key: null, content: '' }
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

          const sceneryNames =
            train.timetable?.sceneries?.map(
              (sceneryHash) =>
                apiStore.activeData?.activeSceneries?.find((st) => st.stationHash === sceneryHash)
                  ?.stationName ??
                apiStore.sceneryData.find((sd) => sd.hash === sceneryHash)?.name ??
                sceneryHash
            ) ?? [];

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
                  sceneries: timetable.sceneries,
                  sceneryNames: sceneryNames.reverse()
                }
              : undefined
          } as Train;
        });
    },

    activeSceneryList(state): ActiveScenery[] {
      const apiStore = useApiStore();

      if (state.isOffline) return [];

      if (!apiStore.activeData?.activeSceneries) return [];

      const offlineActiveSceneries = this.trainList.reduce((acc, train) => {
        if (!train.timetableData) return acc;

        train.timetableData.sceneryNames.forEach((name) => {
          if (
            acc.findIndex((v) => v.name == name && v.region == train.region) != -1 ||
            apiStore.activeData?.activeSceneries?.findIndex(
              (sc) =>
                sc.stationName === name &&
                sc.region == train.region &&
                Date.now() - sc.lastSeen < 1000 * 60 * 2
            ) != -1
          )
            return acc;

          acc.push({
            name: name,
            hash: '',
            region: train.region,
            maxUsers: 0,
            currentUsers: 0,
            spawns: [],
            dispatcherName: '',
            dispatcherRate: 0,
            dispatcherId: -1,
            dispatcherExp: -1,
            dispatcherIsSupporter: false,
            scheduledTrains: [],
            stationTrains: [],
            dispatcherStatus: Status.ActiveDispatcher.FREE,
            dispatcherTimestamp: -1,

            isOnline: false,

            scheduledTrainCount: {
              all: 0,
              confirmed: 0,
              unconfirmed: 0
            }
          });
        });

        return acc;
      }, [] as ActiveScenery[]);

      const onlineActiveSceneries = apiStore.activeData?.activeSceneries.reduce((list, scenery) => {
        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return list;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return list;

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
          dispatcherStatus: scenery.dispatcherStatus,
          dispatcherTimestamp: dispatcherTimestamp,

          isOnline: scenery.isOnline == 1,

          scheduledTrains: [],
          stationTrains: [],
          scheduledTrainCount: {
            all: 0,
            confirmed: 0,
            unconfirmed: 0
          }
        });

        return list;
      }, [] as ActiveScenery[]);

      const allActiveSceneries = [...onlineActiveSceneries, ...offlineActiveSceneries];

      for (let i = 0, n = allActiveSceneries.length; i < n; i++) {
        const scenery = allActiveSceneries[i];

        const station = this.stationList.find((s) => s.name === scenery.name);

        const scheduledTrains = getScheduledTrains(
          this.trainList,
          station?.generalInfo,
          scenery.name,
          scenery.region
        );

        const stationTrains = getStationTrains(
          this.trainList,
          scheduledTrains,
          this.region.id,
          scenery.name
        );

        // Remove checkpoint duplicates
        const uniqueScheduledTrains = scheduledTrains.reduce(
          (uniqueList, sTrain) =>
            uniqueList.find((v) => v.trainId === sTrain.trainId)
              ? uniqueList
              : [...uniqueList, sTrain],
          [] as ScheduledTrain[]
        );

        scenery.scheduledTrains = scheduledTrains;
        scenery.stationTrains = stationTrains;

        scenery.scheduledTrainCount = {
          all: uniqueScheduledTrains.length,
          confirmed: uniqueScheduledTrains.filter((train) => train.stopInfo.confirmed).length,
          unconfirmed: uniqueScheduledTrains.filter((train) => !train.stopInfo.confirmed).length
        };
      }

      return allActiveSceneries;
    },

    stationList(): Station[] {
      const apiStore = useApiStore();

      return apiStore.sceneryData.map((scenery) => {
        const routes = scenery.routesInfo.reduce(
          (acc, route) => {
            if (route.hidden) return acc;

            const tracksKey = route.routeTracks == 2 ? 'double' : 'single';
            const isElectric = route.isElectric;
            const routesKey: keyof StationRoutes = `${tracksKey}${
              !isElectric ? 'Other' : 'Electrified'
            }Names`;

            if (!route.isInternal) acc[routesKey].push(route.routeName);
            if (route.isRouteSBL) acc['sblNames'].push(route.routeName);

            acc[tracksKey].push(route);

            return acc;
          },
          {
            single: [],
            singleElectrifiedNames: [],
            singleOtherNames: [],
            double: [],
            doubleElectrifiedNames: [],
            doubleOtherNames: [],
            sblNames: []
          } as StationRoutes
        );

        return {
          name: scenery.name,

          generalInfo: {
            ...scenery,
            authors: scenery.authors?.split(',').map((a) => a.trim()),
            routes: routes,
            checkpoints: scenery.checkpoints?.split(';') ?? []
          }
        };
      });
    }
  }
});
