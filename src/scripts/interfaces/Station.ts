import { Availability, ActiveScenery, ScheduledTrain } from '../../store/typings';
import { StationRoutes } from './StationRoutes';

export default interface Station {
  name: string;

  generalInfo?: {
    name: string;
    url: string;
    abbr: string;
    hash?: string;

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

  onlineInfo?: ActiveScenery;
}
