import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { TrainFilterType } from './scripts/enums/TrainFilterType';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    count: number
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }

  // Train filter for TrainView
  interface TrainFilter {
    id: TrainFilterType;
    isActive: boolean;
  }
}