import { TrainFilterSection, TrainFilterType } from '../../enums/TrainFilterType'

export interface TrainFilter {
  id: TrainFilterType;
  section: TrainFilterSection;
  isActive: boolean;
}
