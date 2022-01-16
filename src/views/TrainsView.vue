<template>
  <section class="trains-view">
    <div class="wrapper">
      <div class="options-bar">
        <TrainStats :trains="trainList" :trainStatsOpen="trainStatsOpen" />

        <TrainOptions />
      </div>

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, Ref, ref, watch } from 'vue';

import { DataStatus } from '@/scripts/enums/DataStatus';
import Train from '@/scripts/interfaces/Train';

import TrainTable from '@/components/TrainsView/TrainTable.vue';
import TrainStats from '@/components/TrainsView/TrainStats.vue';
import TrainOptions from '@/components/TrainsView/TrainOptions.vue';

import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';

const filteredTrainList = (
  trainList: Train[],
  searchedTrain: string,
  searchedDriver: string,
  sorterActive: { id: string; dir: number }
) => {
  return trainList
    .filter(
      (train) =>
        (searchedTrain.length > 0 ? train.trainNo.toString().startsWith(searchedTrain) : true) &&
        (searchedDriver.length > 0 ? train.driverName.toLowerCase().startsWith(searchedDriver.toLowerCase()) : true)
    )
    .sort((a: Train, b: Train) => {
      switch (sorterActive.id) {
        case 'mass':
          if (a.mass > b.mass) return sorterActive.dir;
          return -sorterActive.dir;

        case 'distance':
          if ((a.timetableData?.routeDistance || -1) > (b.timetableData?.routeDistance || -1)) return sorterActive.dir;

          return -sorterActive.dir;

        case 'speed':
          if (a.speed > b.speed) return sorterActive.dir;
          return -sorterActive.dir;

        case 'timetable':
          if (a.trainNo > b.trainNo) return sorterActive.dir;
          return -sorterActive.dir;

        case 'length':
          if (a.length > b.length) return sorterActive.dir;
          return -sorterActive.dir;

        default:
          break;
      }

      return 0;
    });
};

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

  setup(props) {
    const store = useStore();

    const trainList: ComputedRef<Train[]> = computed(() => store.getters[GETTERS.trainList]);

    const timetableDataStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.timetableDataStatus]);

    const sorterActive = ref({ id: 'distance', dir: -1 });
    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);

    const computedTrains: ComputedRef<Train[]> = computed(() => {
      if (timetableDataStatus.value != DataStatus.Loaded) return [];

      return filteredTrainList(trainList.value, searchedTrain.value, searchedDriver.value, sorterActive.value);
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
