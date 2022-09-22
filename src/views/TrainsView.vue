<template>
  <section class="trains-view">
    <div class="trains_wrapper">
      <TrainOptions :sorter-option-ids="['distance', 'progress', 'delay', 'mass', 'speed', 'length']" />

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref } from 'vue';
import TrainOptions from '../components/TrainsView/TrainOptions.vue';
import TrainStats from '../components/TrainsView/TrainStats.vue';
import TrainTable from '../components/TrainsView/TrainTable.vue';
import { trainFilters } from '../constants/Trains/TrainOptionsConsts';
import Train from '../scripts/interfaces/Train';
import { filteredTrainList } from '../scripts/managers/trainFilterManager';
import { useStore } from '../store/store';
import { TrainFilter } from '../types/Trains/TrainOptionsTypes';

export default defineComponent({
  components: {
    TrainTable,
    TrainStats,
    TrainOptions,
  },

  props: {
    train: {
      type: String,
      required: false,
    },

    driver: {
      type: String,
      required: false,
    },
  },

  data: () => ({
    trainStatsOpen: false,
  }),

  setup() {
    const store = useStore();

    const sorterActive = ref({ id: 'distance', dir: -1 });
    const filterList = reactive([...trainFilters]) as TrainFilter[];

    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);
    provide('filterList', filterList);

    const computedTrains: ComputedRef<Train[]> = computed(() => {
      return filteredTrainList(
        store.trainList,
        searchedTrain.value,
        searchedDriver.value,
        sorterActive.value,
        filterList
      );
    });

    return {
      computedTrains,
      searchedTrain,
      searchedDriver,
      sorterActive,
    };
  },

  activated() {
    if (this.train) {
      this.searchedTrain = this.train;
      this.searchedDriver = this.driver || '';
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

.trains_wrapper {
  margin: 1rem auto;
  max-width: 1350px;
}
</style>
