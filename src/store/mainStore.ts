import { defineStore } from 'pinia';
import { parseSpawns } from './utils';

import {
  ActiveScenery,
  CheckpointTrain,
  Station,
  StationRoutes,
  Status,
  Train
} from '../typings/common';
import { useApiStore } from './apiStore';
import { MainStoreState } from './typings';

const checkpointsTrains: Map<string, CheckpointTrain[]> = new Map();
const sceneriesTrains: Map<string, Train[]> = new Map();

export const useMainStore = defineStore('mainStore', {
  state: () =>
    ({
      region: { id: 'eu', value: 'PL1', name: 'PL1' },

      isOffline: false,
      appUpdate: null,

      dispatcherStatsName: '',
      dispatcherStatsStatus: Status.Data.Initialized,

      driverStatsName: '',
      driverStatsData: undefined,
      driverStatsStatus: Status.Data.Initialized,

      chosenModalTrainId: undefined,

      modalLastClickedTarget: null
    }) as MainStoreState,

  getters: {
    trainList(): Train[] {
      const apiStore = useApiStore();

      checkpointsTrains.clear();
      sceneriesTrains.clear();

      return (apiStore.activeData?.trains ?? [])
        .filter((train) => train.timetable || train.lastSeen >= Date.now() - 60000)
        .map((train) => {
          const stock = train.stockString.split(';');
          const locoType = stock ? stock[0] : train.stockString;

          const timetable = train.timetable;

          const trainObj = {
            id: train.id,
            modalId: `${train.driverName}${train.trainNo}`, // simplified id for train modal

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

            driverRouteLocation: {
              name: 'DriverView',
              query: {
                trainId: train.id
              }
            },

            timetableData: timetable
              ? {
                  timetableId: timetable.timetableId,
                  route: timetable.route,
                  category: timetable.category,
                  followingStops: timetable.stopList,
                  routeDistance: timetable.stopList[timetable.stopList.length - 1].stopDistance,
                  sceneries: timetable.sceneries,
                  TWR: timetable.TWR,
                  SKR: timetable.SKR,
                  warningNotes: timetable.warningNotes,
                  hasDangerousCargo: timetable.hasDangerousCargo,
                  hasExtraDeliveries: timetable.hasExtraDeliveries,

                  timetablePath: timetable.path.split(';').map((pathElementString) => {
                    const [arrival, station, departure] = pathElementString.split(',');

                    return {
                      arrivalRouteExt: arrival,
                      departureRouteExt: departure,
                      stationName: station.split(' ').slice(0, -1).join(' '),
                      stationHash: station.split(' ').slice(-1).join(' ').replace('.sc', '')
                    };
                  })
                }
              : undefined
          } as Train;

          const stationNameKey = train.currentStationName.indexOf('.sc') != -1 ? train.currentStationName.split(' ').slice(0, -1).join(' ') : train.currentStationName;          

          // Sceneries trains map
          if (sceneriesTrains.has(stationNameKey)) {
            sceneriesTrains.set(stationNameKey, [
              ...sceneriesTrains.get(stationNameKey)!,
              trainObj
            ]);
          } else sceneriesTrains.set(stationNameKey, [trainObj]);

          // Checkpoints trains map
          if (trainObj.timetableData) {
            let currentSceneryIndex = 0;
            const timetablePath = trainObj.timetableData.timetablePath;

            trainObj.timetableData.followingStops.forEach((stop, i) => {
              if (/strong|podg|pe/.test(stop.stopName)) {
                const checkpointTrain: CheckpointTrain = {
                  train: trainObj,
                  checkpointStop: stop,

                  previousSceneryElement:
                    currentSceneryIndex > 0 ? timetablePath[currentSceneryIndex - 1] : null,

                  nextSceneryElement:
                    currentSceneryIndex < timetablePath.length - 1
                      ? timetablePath[currentSceneryIndex + 1]
                      : null,

                  timetablePathElement: timetablePath[currentSceneryIndex]
                };

                if (checkpointsTrains.has(stop.stopNameRAW.toLowerCase())) {
                  checkpointsTrains.set(stop.stopNameRAW.toLowerCase(), [
                    ...checkpointsTrains.get(stop.stopNameRAW.toLowerCase())!,
                    checkpointTrain
                  ]);
                } else checkpointsTrains.set(stop.stopNameRAW.toLowerCase(), [checkpointTrain]);
              }

              if (timetablePath[currentSceneryIndex].departureRouteExt == stop.departureLine)
                currentSceneryIndex++;
            });
          }

          return trainObj;
        });
    },

    // computed active sceneries
    activeSceneryList(state): ActiveScenery[] {
      const apiStore = useApiStore();

      if (state.isOffline) return [];

      if (!apiStore.activeData?.activeSceneries) return [];

      const offlineActiveSceneries = this.trainList.reduce((acc, train) => {
        if (!train.timetableData) return acc;

        train.timetableData.timetablePath.forEach((p) => {
          if (
            acc.findIndex(
              (v) =>
                (v.name == p.stationName || v.hash == p.stationHash) && v.region == train.region
            ) != -1 ||
            apiStore.activeData?.activeSceneries?.findIndex(
              (sc) =>
                (sc.stationName == p.stationName || sc.stationHash == p.stationHash) &&
                sc.region == train.region &&
                Date.now() - sc.lastSeen < 1000 * 60 * 2
            ) != -1
          )
            return acc;

          acc.push({
            name: p.stationName,
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
            dispatcherStatus: Status.ActiveDispatcher.FREE,
            dispatcherTimestamp: -1,

            isOnline: false,

            stationTrains: [],
            scheduledTrains: [],

            scheduledTrainCount: {
              all: 0,
              confirmed: 0,
              unconfirmed: 0
            }
          });
        });

        return acc;
      }, [] as ActiveScenery[]);

      const referenceTimestamp = Date.now();

      const onlineActiveSceneries = apiStore.activeData?.activeSceneries.reduce((list, scenery) => {
        if (scenery.isOnline !== 1 && Date.now() - scenery.lastSeen > 1000 * 60 * 2) return list;
        if (scenery.dispatcherStatus == Status.ActiveDispatcher.UNKNOWN) return list;

        const dispatcherTimestamp =
          scenery.dispatcherStatus == Status.ActiveDispatcher.NO_LIMIT
            ? referenceTimestamp + 25500000
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

          stationTrains: [],
          scheduledTrains: [],

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

        let checkpointsSet: Set<string> = new Set();

        // Add checkpoints to active scenery data
        checkpointsSet.add(scenery.name.toLowerCase());

        station?.generalInfo?.checkpoints.forEach((cpName) => {
          checkpointsSet.add(cpName.toLowerCase());
        });

        const checkpoints = Array.from(checkpointsSet);

        scenery.stationTrains =
          sceneriesTrains.get(scenery.name)?.filter((sc) => sc.region == this.region.id) ?? [];

        const uniqueTrainIds: string[] = [];
        checkpoints.forEach((cp) => {
          const scheduledTrains = checkpointsTrains.get(cp.toLowerCase());

          if (!scheduledTrains) return;

          scheduledTrains.forEach(({ train, checkpointStop, timetablePathElement, ...v }) => {
            if (
              scenery.name != timetablePathElement.stationName &&
              scenery.hash != timetablePathElement.stationHash
            )
              return;

            scenery.scheduledTrains.push({ train, checkpointStop, timetablePathElement, ...v });

            if (uniqueTrainIds.includes(train.id) || train.region != this.region.id) return;

            scenery.scheduledTrainCount.all += 1;

            if (checkpointStop.confirmed) scenery.scheduledTrainCount.confirmed++;
            else scenery.scheduledTrainCount.unconfirmed++;

            uniqueTrainIds.push(train.id);
          });
        });
      }

      return allActiveSceneries;
    },

    // computed station data
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

            acc.minRouteSpeed =
              acc.minRouteSpeed == 0
                ? route.routeSpeed
                : Math.min(route.routeSpeed, acc.minRouteSpeed);

            acc.maxRouteSpeed = Math.max(route.routeSpeed, acc.maxRouteSpeed);

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
            sblNames: [],
            minRouteSpeed: 0,
            maxRouteSpeed: 0
          } as StationRoutes
        );

        return {
          name: scenery.name,

          generalInfo: {
            ...scenery,
            authors: scenery.authors?.split(',').map((a) => a.trim()),
            routes: routes,
            checkpoints:
              scenery.checkpoints && scenery.checkpoints.trim().length > 0
                ? scenery.checkpoints.split(';')
                : []
          }
        };
      });
    },

    allStationInfo(): Station[] {
      const onlineUnsavedStations = this.activeSceneryList
        .filter(
          (scenery) =>
            this.stationList.findIndex((st) => st.name == scenery.name) == -1 &&
            scenery.region == this.region.id
        )
        .map((os) => ({
          name: os.name,
          generalInfo: undefined,
          onlineInfo: os
        }));

      return [
        ...onlineUnsavedStations,
        ...this.stationList.map((st) => ({
          ...st,
          onlineInfo: this.activeSceneryList.find(
            (os) => os.name == st.name && os.region == this.region.id
          )
        }))
      ];
    }
  }
});
