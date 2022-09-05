<template>
  <section class="trains-view">
    <div class="wrapper">
      <div class="options-bar">
        <train-options />
      </div>

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref, TrainFilter } from 'vue';
import TrainOptions from '../components/TrainsView/TrainOptions.vue';
import TrainStats from '../components/TrainsView/TrainStats.vue';
import TrainTable from '../components/TrainsView/TrainTable.vue';
import { trainFilters } from '../data/trainOptions';
import Train from '../scripts/interfaces/Train';
import { filteredTrainList } from '../scripts/managers/trainFilterManager';
import { useStore } from '../store/store';

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
    // if (this.train) {
    //   this.searchedTrain = this.train;
    //   if(this.x) this.searchedDriver = this.x;
    // }
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

</style>
