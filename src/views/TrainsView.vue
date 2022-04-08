<template>
  <section class="trains-view">
    <div class="wrapper">
      <div class="options-bar">
        <!-- <TrainStats :trains="trainList" :trainStatsOpen="trainStatsOpen" /> -->

        <TrainOptions />
      </div>

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref, TrainFilter } from 'vue';
import { filteredTrainList } from "@/scripts/managers/trainFilterManager";

import Train from '@/scripts/interfaces/Train';

import TrainTable from '@/components/TrainsView/TrainTable.vue';
import TrainStats from '@/components/TrainsView/TrainStats.vue';
import TrainOptions from '@/components/TrainsView/TrainOptions.vue';

import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';


export default defineComponent({
  components: {
    TrainTable,
    TrainStats,
    TrainOptions,
  },

  props: ['train'],

  data: () => ({
    statsIcon: require('@/assets/icon-stats.svg'),
    trainStatsOpen: false,
  }),

  setup() {
    const store = useStore();

    const trainList: ComputedRef<Train[]> = computed(() => store.getters[GETTERS.trainList]);

    // const timetableDataStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.timetableDataStatus]);

    const sorterActive = ref({ id: 'distance', dir: -1 });
    const filtersActive = reactive([]) as TrainFilter[];

    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);
    provide('filtersActive', filtersActive);

    const computedTrains: ComputedRef<Train[]> = computed(() => {
      return filteredTrainList(
        trainList.value,
        searchedTrain.value,
        searchedDriver.value,
        sorterActive.value,
        filtersActive
      );
    });

    /* Provide list for TrainStats category filter */
    const chosenTrainCategories = reactive([] as string[]);
    provide('chosenTrainCategories', chosenTrainCategories);

    return {
      trainList,
      computedTrains,
      searchedTrain,
      searchedDriver,
      sorterActive,
      chosenTrainCategories,
    };
  },

  mounted() {
    if (this.train) {
      this.searchedTrain = this.train;
      this.searchedDriver = '';
    }
  },

  activated() {
    if (this.train) {
      this.searchedTrain = this.train;
      this.searchedDriver = '';
    }
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';

.trains-view {
  min-height: 100%;
  position: relative;
}

.wrapper {
  margin: 1rem auto;
  max-width: 1300px;

  padding: 0 0.5em;
}

@include smallScreen {
  .options-bar {
    font-size: 1.25em;
  }
}
</style>
