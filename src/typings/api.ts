import { Status } from './common';

export namespace API {
  export namespace ActiveData {
    export interface Response {
      activeSceneries?: API.ActiveSceneries.Response;
      trains?: API.ActiveTrains.Response;
    }
  }
  export namespace DispatcherHistory {
    export type Response = Data[];

    export interface Data {
      id: string;
      currentDuration: number;
      dispatcherId: number;
      dispatcherName: string;
      dispatcherLevel: number | null;
      dispatcherRate: number;
      dispatcherIsSupporter: boolean;
      dispatcherStatus?: number;
      isOnline: boolean;
      lastOnlineTimestamp: number;
      region: string;
      stationHash: string;
      stationName: string;
      timestampFrom: number;
      timestampTo?: number;
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
      pointId: string;

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

      TWR: boolean;
      SKR: boolean;
      sceneries: string[];
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

      stopsString?: string;

      stockString?: string;
      stockHistory: string[];

      stockMass?: number;
      stockLength?: number;
      maxSpeed?: number;

      hashesString?: string;
      currentSceneryName?: string;
      currentSceneryHash?: string;

      routeSceneries?: string;

      checkpointArrivals?: string[];
      checkpointDepartures?: string[];

      checkpointArrivalsScheduled?: string[];
      checkpointDeparturesScheduled?: string[];

      checkpointStopTypes?: string[];
    }

    export type Response = Data[];
  }

  export namespace RollingStock {
    export interface Response {
      usage: Record<string, string>;
      info: Info;
    }

    export interface Info {
      'loco-e': [string, string, string, string, boolean][];
      'loco-s': [string, string, string, string, boolean][];
      'loco-szt': [string, string, string, string, boolean][];
      'loco-ezt': [string, string, string, string, boolean][];
      'car-passenger': [string, string, boolean, boolean, string][];
      'car-cargo': [string, string, boolean, boolean, string][];
    }
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
