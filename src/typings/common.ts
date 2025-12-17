import { RouteLocationRaw } from 'vue-router';
import { StationJSONData } from '../store/typings';

export type Availability = 'default' | 'unavailable' | 'nonPublic' | 'abandoned' | 'nonDefault';
export type ScenerySpawnType = 'passenger' | 'freight' | 'loco' | 'all';

export enum StopStatus {
  ARRIVING = 'arriving',
  DEPARTED = 'departed',
  DEPARTED_AWAY = 'departed-away',
  ONLINE = 'online',
  STOPPED = 'stopped',
  TERMINATED = 'terminated'
}

export namespace Status {
  export enum ActiveDispatcher {
    FREE = -3,
    INVALID = -2,
    UNKNOWN = -1,
    NO_LIMIT = 0,
    AFK = 1,
    ENDING = 2,
    NO_SPACE = 3,
    UNAVAILABLE = 4,
    NOT_LOGGED_IN = 5
  }

  export enum Data {
    Offline = -2,
    Initialized = -1,
    Loading = 0,
    Error = 1,
    Loaded = 2,
    Warning = 3
  }
}

export interface RegionCounters {
  stationCount: number;
  trainsCount: number;
  timetablesCount: number;
}

export interface TimetablePathElement {
  arrivalRouteExt?: string;
  departureRouteExt?: string;
  stationName: string;
  stationHash: string;
}

export interface Train {
  id: string;
  modalId: string;
  mass: number;
  length: number;
  speed: number;
  signal: string;
  distance: number;
  connectedTrack: string;
  driverId: number;
  trainNo: number;
  driverName: string;
  driverLevel: number;
  currentStationName: string;
  currentStationHash: string;
  locoType: string;
  online: boolean;
  lastSeen: number;
  region: string;
  stockList: string[];

  isTimeout: boolean;
  isSupporter: boolean;

  driverRouteLocation: RouteLocationRaw;

  timetableData?: TrainTimetableData;
}

export interface TrainTimetableData {
  timetableId: number;
  category: string;
  route: string;
  followingStops: TrainStop[];
  twr: boolean;
  hasDangerousCargo: boolean;
  hasExtraDeliveries: boolean;
  warningNotes: string | null;
  routeDistance: number;
  sceneries: string[];
  timetablePath: TimetablePathElement[];
  trainMaxSpeed: number;
}

export interface Station {
  name: string;
  generalInfo?: StationGeneralInfo;
  onlineInfo?: ActiveScenery;
}

export interface StationGeneralInfo {
  name: string;
  url: string;
  abbr: string;
  hash?: string;
  reqLevel: number;
  lines?: string;
  project: string;
  projectUrl?: string;
  signalType: string;
  controlType: string;
  SUP: boolean;
  ASDEK: boolean;
  authors?: string[];
  availability: Availability;
  routes: StationRoutes;
  checkpoints: string[];
  hidden: boolean;
}

export interface StationRoutes {
  single: StationRoutesInfo[];
  double: StationRoutesInfo[];
  all: StationRoutesInfo[];

  singleElectrifiedNames: string[];
  singleOtherNames: string[];
  doubleElectrifiedNames: string[];
  doubleOtherNames: string[];
  sblNames: string[];

  minRouteSpeed: number;
  maxRouteSpeed: number;
}

export interface StationRoutesInfo {
  routeName: string;
  isElectric: boolean;
  isInternal: boolean;
  isRouteSBL: boolean;
  routeLength: number;
  routeSpeed: number;
  routeSpeedExit?: number;
  routeTracks: number;
  hidden?: boolean;
  realLineNo?: number;
}

export interface ActiveScenery {
  name: string;
  hash: string;
  region: string;
  maxUsers: number;
  currentUsers: number;
  spawns: ScenerySpawn[];
  dispatcherName: string;
  dispatcherRate: number;
  dispatcherId: number;
  dispatcherExp: number;
  dispatcherIsSupporter: boolean;
  dispatcherStatus: Status.ActiveDispatcher | number;
  dispatcherTimestamp: number | null;
  isOnline: boolean;
  stationTrains: Train[];
  scheduledTrains: CheckpointTrain[];
  scheduledTrainCount: {
    all: number;
    confirmed: number;
    unconfirmed: number;
  };
  missingCheckpoints: string[];  
}

export interface ScenerySpawn {
  spawnName: string;
  spawnLength: number;
  isElectrified: boolean;
  spawnType: ScenerySpawnType;
}

export interface TrainStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  mainStop: boolean;

  arrivalLine: string | null;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine: string | null;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;

  comments?: string;

  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: number;
  stopped: number;
  stopTime: number | null;
}

export interface CheckpointTrain {
  checkpointStop: TrainStop;
  train: Train;
  timetablePathElement: TimetablePathElement;
  previousSceneryElement: TimetablePathElement | null;
  nextSceneryElement: TimetablePathElement | null;
}

// Vehicles Data

export interface VehicleData {
  id: number;
  name: string;
  type: string;
  cabinName: string | null;
  restrictions: Record<string, any> | null;
  vehicleGroupsId: number;
  group: VehiclesGroup;
}

export interface VehiclesGroup {
  id: number;
  name: string;
  speed: number;
  speedLoaded?: number;
  speedLoco?: number;
  length: number;
  weight: number;
  cargoTypes: VehicleCargo[] | null;

  locoProps: {
    coldStart: boolean;
    doubleManned: boolean;
  } | null;

  massSpeeds: VehicleGroupMassSpeeds | null;
}

export interface VehicleGroupMassSpeeds {
  passenger: Record<string, number> | null;
  cargo: Record<string, number> | null;
  none: number | null;
}

export interface VehicleCargo {
  id: string;
  weight: number;
}

export interface TooltipUserTrain {
  driverName: string;
  trainNo: number;
}

export interface TooltipTrainInfo {
  mass: number;
  length: number;
  speed: number;
  signal: string;
  distance: number;
  connectedTrack: string;
  trainNo: number;
  driverName: string;
  driverLevel: number;
  currentStationName: string;
  currentStationHash: string;
  headVehicleName: string;
  stockCount: number;
  trainTimetableCategory?: string;
}
