import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { JournalFilterType } from './scripts/enums/JournalFilterType';
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

  

  interface JournalFilter {
    id: JournalFilterType;
    filterSection: string;
    isActive: boolean;
  }


}