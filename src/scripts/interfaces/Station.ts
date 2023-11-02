import { Availability, OnlineScenery } from './store/storeTypes';
import { ScheduledTrain } from './ScheduledTrain';
import StationRoutes from './StationRoutes';

export default interface Station {
  name: string;

  generalInfo?: {
    name: string;
    url: string;
    abbr: string;

    reqLevel: number;
    // supportersOnly: boolean;

    lines: string;
    project: string;
    projectUrl?: string;

    signalType: string;
    controlType: string;

    SUP: boolean;
    authors?: string[];

    availability: Availability;
    routes: StationRoutes;

    checkpoints: {
      checkpointName: string;
      scheduledTrains: ScheduledTrain[];
    }[];
  };

  onlineInfo?: OnlineScenery;
}
