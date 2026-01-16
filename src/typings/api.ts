import { Status, Vehicle, VehicleGroup } from './common';

export enum APIDataStatus {
  OK = 'OK',
  WARNING = 'WARNING'
}

export interface APICache {
  lastModified: string;
  name: string;
}

export namespace API {
  export namespace ActiveData {
    export interface APIStatuses {
      stationsAPI: APIDataStatus;
      trainsAPI: APIDataStatus;
      dispatchersAPI: APIDataStatus;
      sceneryRequirementsAPI: APIDataStatus;
    }

    export interface Response {
      activeSceneries?: API.ActiveSceneries.Response;
      trains?: API.ActiveTrains.Response;
      apiStatuses?: APIStatuses;
      caches: APICache[];
    }
  }

  export namespace DispatcherHistory {
    export type Response = Data[];

    export interface Data {
      id: number;
      currentDuration: number;
      dispatcherId: number;
      dispatcherName: string;
      dispatcherLevel: number | null;
      dispatcherRate: number;
      dispatcherIsSupporter: boolean;
      dispatcherLanguageId: number | null;
      dispatcherStatus?: number;
      isOnline: boolean;
      lastOnlineTimestamp: number;
      region: string;
      stationHash: string;
      stationName: string;
      timestampFrom: number;
      timestampTo?: number;
      statusHistory: string[];
    }
  }

  export namespace DispatcherStats {
    export interface DistanceStat {
      routeDistance: number | null;
    }

    export interface DurationStat {
      currentDuration: number | null;
    }

    export interface Count {
      _all: number;
    }

    export interface Response {
      services: {
        count: number;
        durationMax: number;
        durationAvg: number;
      } | null;

      issuedTimetables: {
        count: number;
        distanceMax: number;
        distanceAvg: number;
        distanceSum: number;
      } | null;
    }
  }

  export namespace DriverStats {
    export interface SumStats {
      routeDistance: number;
      confirmedStopsCount: number;
      allStopsCount: number;
      currentDistance: number;
    }

    export interface CountStats {
      fulfilled: number;
      terminated: number;
      _all: number;
    }

    export interface MaxStats {
      routeDistance: number;
    }

    export interface AvdStats {
      routeDistance: number;
    }

    export interface Response {
      _sum: SumStats;
      _count: CountStats;
      _max: MaxStats;
      _avg: AvdStats;
    }
  }

  export namespace ActiveSceneries {
    export interface Data {
      dispatcherId: number;
      dispatcherName: string;
      dispatcherIsSupporter: boolean;
      dispatcherLanguageId: number;
      stationName: string;
      stationHash: string;
      region: string;
      maxUsers: number;
      currentUsers: number;
      spawn: number;
      lastSeen: number;
      dispatcherExp: number;
      nameFromHeader: string;
      spawnString: string | null;
      networkConnectionString: string;
      isOnline: number;
      dispatcherRate: number;
      dispatcherStatus: Status.ActiveDispatcher | number;
    }

    export type Response = Data[];
  }

  export namespace ActiveTrains {
    export type Response = Data[];

    export interface Data {
      id: string;
      trainNo: number;
      mass: number;
      length: number;
      speed: number;
      stockString: string;

      signal: string;
      distance: number;
      connectedTrack: string;

      driverName: string;
      driverId: number;
      driverIsSupporter: boolean;
      driverLevel?: number;
      driverLanguageId: number;

      currentStationName: string;
      currentStationHash?: string;

      online: number;
      lastSeen: number;

      region: string;
      isTimeout: boolean;

      timetable?: Timetable;
    }

    export interface TimetableStop {
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

      comments?: any;

      beginsHere: boolean;
      terminatesHere: boolean;
      confirmed: number;
      stopped: number;
      stopTime: number | null;
    }

    export interface Timetable {
      timetableId: number;
      category: string;
      route: string;
      stopList: TimetableStop[];
      twr: boolean;
      hasDangerousCargo: boolean;
      hasExtraDeliveries: boolean;
      warningNotes: string | null;
      sceneries: string[];
      path: string;
      trainMaxSpeed: number;
    }
  }

  export namespace TimetableHistory {
    export interface Data {
      id: number;
      createdAt: string;
      updatedAt: string;

      timetableId: number;
      trainNo: number;
      trainCategoryCode: string;

      driverId: number;
      driverName: string;
      driverLevel: number | null;
      driverIsSupporter: boolean;
      driverLanguageId: number | null;

      route: string;
      twr: number;
      skr: number;
      sceneriesString: string;
      currentLocation: string[];

      routeDistance: number;
      currentDistance: number;

      confirmedStopsCount: number;
      allStopsCount: number;

      beginDate: string;
      endDate: string;

      scheduledBeginDate: string;
      scheduledEndDate: string;

      terminated: boolean;
      fulfilled: boolean;

      authorName?: string;
      authorId?: number;

      stockString?: string;
      stockHistory: string[];

      stockMass?: number;
      stockLength?: number;
      maxSpeed?: number;

      currentSceneryName?: string;
      currentSceneryHash?: string;
      routeSceneries: string;
      checkpointArrivals: string[];
      checkpointDepartures: string[];
      checkpointArrivalsScheduled: string[];
      checkpointDeparturesScheduled: string[];
      checkpointStopTypes: string[];
      checkpointComments: string[];
      visitedSceneries: string[];
      sceneryNames: string[];
      path: string;
      warningNotes: string | null;
      hasDangerousCargo: boolean;
      hasExtraDeliveries: boolean;
      trainMaxSpeed?: number;
    }

    export type Response = Data[];
  }

  export namespace DailyStats {
    export interface Response {
      totalTimetables: number;
      distanceSum: number;
      distanceAvg: number;
      maxTimetable: API.TimetableHistory.Data | null;

      globalDiff: GlobalDiff;
      globalMax: GlobalMax;

      mostActiveDispatchers: MostActiveDispatcher[];
      mostActiveDrivers: MostActiveDriver[];

      longestDuties: LongestDuty[];
    }

    export interface MostActiveDispatcher {
      name: string;
      count: number;
    }

    export interface MostActiveDriver {
      name: string;
      distance: number;
    }

    export interface LongestDuty {
      name: string;
      duration: number;
      station: string;
    }

    export interface GlobalDiff {
      rippedSwitches: number;
      derailments: number;
      skippedStopSignals: number;
      radioStops: number;
      kills: number;
      drivenKilometers: number;
      routedTrains: number;
    }

    export interface GlobalMax {
      _max: {
        drivers: number;
        dispatchers: number;
        timetables: number;
      };
    }
  }

  export namespace Donators {
    export type Response = string[];
  }

  export namespace VehiclesData {
    export interface VehicleObject {
      id: number;
      name: string;
      type: string;
      cabinName: string | null;
      restrictions: Record<string, any> | null;
      vehicleGroupsId: number;
    }

    export interface VehicleGroupObject {
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

    export interface Data {
      vehicles: VehicleObject[];
      vehicleGroups: VehicleGroupObject[];
    }

    export type Response = Data;
  }
}

export namespace GithubAPI {
  export namespace Release {
    export interface Author {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      gravatar_id: string;
      url: string;
      html_url: string;
      followers_url: string;
      following_url: string;
      gists_url: string;
      starred_url: string;
      subscriptions_url: string;
      organizations_url: string;
      repos_url: string;
      events_url: string;
      received_events_url: string;
      type: string;
      site_admin: boolean;
    }

    export interface Response {
      url: string;
      assets_url: string;
      upload_url: string;
      html_url: string;
      id: number;
      author: Author;
      node_id: string;
      tag_name: string;
      target_commitish: string;
      name: string;
      draft: boolean;
      prerelease: boolean;
      created_at: Date;
      published_at: Date;
      assets: any[];
      tarball_url: string;
      zipball_url: string;
      body: string;
    }
  }
}

export namespace Websocket {
  export interface Payload {
    activeSceneries: API.ActiveSceneries.Response;
    activeTrains: API.ActiveTrains.Response;
    connectedSocketCount: number;
  }
}
