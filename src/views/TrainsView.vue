<template>
  <section class="trains-view">
    <div class="wrapper">
      <div class="options-bar">
        <!-- <TrainStats :trains="trainList" :trainStatsOpen="trainStatsOpen" /> -->

        <train-options />
      </div>

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref, TrainFilter } from 'vue';
import { filteredTrainList } from '@/scripts/managers/trainFilterManager';
import  { trainFilters } from "@/data/trainOptions";

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

    const sorterActive = ref({ id: 'distance', dir: -1 });
    const filterList = reactive([...trainFilters]) as TrainFilter[];
    const isTrainOptionsCardVisible = ref(false);

    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);
    provide('filterList', filterList);
    provide('isTrainOptionsCardVisible', isTrainOptionsCardVisible);

    const computedTrains: ComputedRef<Train[]> = computed(() => {
      return filteredTrainList(
        trainList.value,
        searchedTrain.value,
        searchedDriver.value,
        sorterActive.value,
        filterList
      );
    });


    return {
      trainList,
      computedTrains,
      searchedTrain,
      searchedDriver,
      sorterActive,
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
  max-width: 1350px;
}

@include smallScreen {
  .options-bar {
    font-size: 1.25em;
  }
}
</style>
