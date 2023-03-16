import { TrainFilterSection, TrainFilterType } from '../../scripts/enums/TrainFilterType';

export interface TrainFilter {
  id: TrainFilterType;
  section: TrainFilterSection;
  isActive: boolean;
}
