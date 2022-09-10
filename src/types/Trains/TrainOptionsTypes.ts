import { TrainFilterType } from "../../scripts/enums/TrainFilterType";

export interface TrainFilter {
  id: TrainFilterType;
  isActive: boolean;
}