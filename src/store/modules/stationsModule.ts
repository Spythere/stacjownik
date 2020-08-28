import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import axios from "axios";

import data from "@/data/stations.json";
import Station from "@/scripts/interfaces/Station";

const stationsOnlineURL =
  "https://api.td2.info.pl:9640/?method=getStationsOnline";
const trainsOnlineURL = "https://api.td2.info.pl:9640/?method=getTrainsOnline";
const dispatchersOnlineURL =
  "https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1";

enum ConnState {
  Loading = 0,
  Error = 1,
  Connected = 2,
}

interface TimetableResponseData {
  stopPoints:
    | {
        arrivalTime: string;
        arrivalDelay: number;
        departureTime: string;
        departureDelay: number;
        pointNameRAW: string;
      }[]
    | [];
  trainInfo: {
    timetableId: number;
    trainCategoryCode: string;
  };
}

interface OnlineStationsResponseData {
  stationName: string;
  stationHash: string;
  maxUsers: number;
  currentUsers: number;
  spawnString: string;
  dispatcherRate: number;
  dispatcherName: string;
  dispatcherExp: number;
  dispatcherId: number;
  region: string;
  isOnline: number;
}

let onlineDispatchersData: [string, string, number, number][];
let onlineStationsData: OnlineStationsResponseData[];

let onlineTrainsData: {
  isOnline: number;
  region: string;
  trainNo: number;
  station: { stationName: string };
}[];

const filterInitStates = {
  default: false,
  notDefault: false,
  nonPublic: false,
  SPK: false,
  SCS: false,
  ręczne: false,
  mechaniczne: false,
  współczesna: false,
  kształtowa: false,
  historyczna: false,
  mieszana: false,
  minLevel: 0,
  minOneWayCatenary: 0,
  minOneWay: 0,
  minTwoWayCatenary: 0,
  minTwoWay: 0,
  "no-1track": false,
  "no-2track": false,
  free: true,
  occupied: false,
  ending: false,
};

const queryStations = axios.get(stationsOnlineURL);
const queryTrains = axios.get(trainsOnlineURL);
const queryDispatchers = axios.get(dispatchersOnlineURL);

const getStationLabel = (stationStatus: any) => {
  if (!stationStatus) return "NIEZALOGOWANY";

  const statusCode = stationStatus[2];
  const statusTimestamp = stationStatus[3];

  switch (statusCode) {
    case 0:
      if (statusTimestamp - Date.now() > 21000000) return "BEZ LIMITU";

      return `DO ${new Date(statusTimestamp).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    case 1:
      return "Z/W";

    case 2:
      if (statusTimestamp == 0) return "KOŃCZY";
      break;

    case 3:
      return "BRAK MIEJSCA";

    default:
      break;
  }

  return "NIEDOSTĘPNY";
};

const getOpenSpawns = (spawnString: string) => {
  if (!spawnString) return "";

  return spawnString
    .split(";")
    .map((v) => (v.split(",")[6] ? v.split(",")[6] : v.split(",")[0]));
};

const filterStations = (stations, filters) => {
  return stations.filter((station) => {
    if ((station.nonPublic || !station.reqLevel) && filters["nonPublic"])
      return false;
    if (!station.reqLevel || station.reqLevel == "-1") return true;

    if (station.online && station.occupiedTo == "KOŃCZY" && filters["ending"])
      return false;
    if (station.online && filters["occupied"]) return false;
    if (!station.online && filters["free"]) return false;

    if (station.default && filters["default"]) return false;
    if (!station.default && filters["notDefault"]) return false;

    if (station.reqLevel < filters["minLevel"]) return false;

    if (
      filters["no-1track"] &&
      (station.routes.oneWay.catenary != 0 ||
        station.routes.oneWay.noCatenary != 0)
    )
      return false;
    if (
      filters["no-2track"] &&
      (station.routes.twoWay.catenary != 0 ||
        station.routes.twoWay.noCatenary != 0)
    )
      return false;

    if (station.routes.oneWay.catenary < filters["minOneWayCatenary"])
      return false;
    if (station.routes.oneWay.noCatenary < filters["minOneWay"]) return false;

    if (station.routes.twoWay.catenary < filters["minTwoWayCatenary"])
      return false;
    if (station.routes.twoWay.noCatenary < filters["minTwoWay"]) return false;

    if (filters[station.controlType]) return false;
    if (filters[station.signalType]) return false;

    if (filters["SPK"] && station.controlType.includes("SPK")) return false;
    if (filters["SCS"] && station.controlType.includes("SCS")) return false;
    if (filters["mechaniczne"] && station.controlType.includes("mechaniczne"))
      return false;
    if (filters["ręczne"] && station.controlType.includes("ręczne"))
      return false;

    return true;
  });
};

@Module
export default class StationsModule extends VuexModule {
  private trainCount: number = 0;
  private stationCount: number = 0;

  private stationsConnectionState: ConnState = ConnState.Loading;

  private stations: Station[] = [];
  private filteredStations: {}[] = [];

  private filters: any = { ...filterInitStates };

  get getConnectionState() {
    return this.stationsConnectionState;
  }

  get getOnlineInfo() {
    return { trainCount: this.trainCount, stationCount: this.stationCount };
  }

  get getStationList() {
    return this.filteredStations;
  }

  get getFilters() {
    return this.filters;
  }

  @Mutation
  private setConnectionState(state: ConnState) {
    this.stationsConnectionState = state;
  }

  @Mutation
  private updateStations(updatedStations) {
    this.stations = this.stations.reduce((acc, station) => {
      const onlineStationData = updatedStations.find(
        (uStation) => uStation.stationName === station.stationName
      );

      if (!onlineStationData) {
        acc.push({
          ...station,
          stationProject: "",
          spawnString: "",
          stationHash: "",
          maxUsers: 0,
          currentUsers: 0,
          dispatcherName: "",
          dispatcherRate: 0,
          dispatcherExp: -1,
          dispatcherId: 0,
          occupiedTo: "WOLNA",
          statusTimestamp: 0,
          scheduledTrains: [],
          online: false,
        });

        return acc;
      }

      acc.push({ ...station, ...onlineStationData, online: true });

      // updatedStations = updatedStations.filter(
      //     (updated: any) => updated.stationName !== station.stationName
      // );

      return acc;
    }, [] as Station[]);

    // Dodawanie do listy online potencjalnych scenerii niewpisanych do bazy
    updatedStations.forEach((updated: any) => {
      const alreadyInList: any = this.stations.find(
        (station) => station.stationName === updated.stationName
      );

      if (!alreadyInList) {
        this.stations.push({ ...updated, online: true, reqLevel: "-1" });
      }
    });

    this.filteredStations = filterStations(this.stations, this.filters);

    this.stationCount = this.stations.filter(
      (station) => station.online
    ).length;

    this.trainCount = onlineTrainsData.filter(
      (train) => train.isOnline && train.region === "eu"
    ).length;

    this.stationsConnectionState = ConnState.Connected;
  }

  @Mutation
  private resetFilterList() {
    this.filters = { ...filterInitStates };
    this.filteredStations = filterStations(this.stations, this.filters);
  }

  @Mutation
  private changeFilter({ filterName, value }) {
    this.filters[filterName] = value;
    this.filteredStations = filterStations(this.stations, this.filters);
  }

  @Mutation
  private mutateStations(stations) {
    this.stations = stations;
  }

  @Action({ commit: "changeFilter" })
  setFilter(payload: { filterName: string; value: number | boolean }) {
    return payload;
  }

  @Action({ commit: "resetFilterList" })
  resetFilters() {}

  @Action({ commit: "mutateStations" })
  async loadStations() {
    return await data.map((stationData) => ({
      stationProject: "",
      spawnString: "",
      stationHash: "",
      maxUsers: 0,
      currentUsers: 0,
      dispatcherName: "",
      dispatcherRate: 0,
      dispatcherExp: -1,
      dispatcherId: 0,
      online: false,
      occupiedTo: "WOLNA",
      statusTimestamp: 0,
      scheduledTrains: [],
      ...stationData,
    }));
  }

  @Action
  async initStations() {
    this.context.dispatch("loadStations");
    this.context.dispatch("fetchOnlineStations");
  }

  @Action({ commit: "updateStations" })
  async fetchOnlineStations() {
    return await Promise.all([
      axios.get(stationsOnlineURL),
      axios.get(trainsOnlineURL),
      axios.get(dispatchersOnlineURL),
    ])
      .then(async (response) => {
        onlineStationsData = response[0].data.message;
        onlineTrainsData = await response[1].data.message;
        onlineDispatchersData = await response[2].data.message;

        const updatedStations = await Promise.all(
          onlineStationsData
            .filter((station) => station.region === "eu" && station.isOnline)
            .map(async (station) => {
              const stationStatus = onlineDispatchersData.find(
                (status) =>
                  status[0] == station.stationHash && status[1] == "eu"
              );

              const statusLabel = getStationLabel(stationStatus);
              const statusTimestamp = stationStatus ? stationStatus[3] : -1;
              const trains = onlineTrainsData.filter(
                (train) =>
                  train.region === "eu" &&
                  train.isOnline &&
                  train.station.stationName === station.stationName
              );

              const stationData = data.find(
                (s) => s.stationName === station.stationName
              ) || { stationName: station.stationName, stationURL: "" };

              return {
                ...stationData,
                stationHash: station.stationHash,
                maxUsers: station.maxUsers,
                currentUsers: station.currentUsers,
                spawnString: getOpenSpawns(station.spawnString),
                dispatcherName: station.dispatcherName,
                dispatcherRate: station.dispatcherRate,
                dispatcherId: station.dispatcherId,
                dispatcherExp: station.dispatcherExp,
                occupiedTo: statusLabel,
                statusTimestamp,
                trains,
              };
            })
        );
        return updatedStations;
      })
      .catch(() => {
        this.context.commit("setConnectionState", ConnState.Error);
      });
  }
}
