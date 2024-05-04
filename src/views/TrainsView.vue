<template>
  <section class="trains-view">
    <div class="trains_wrapper">
      <div class="trains_topbar">
        <TrainOptions
          :sorter-option-ids="sorterIds"
          :current-options-active="currentOptionsActive"
        />

        <TrainStats />
      </div>

      <TrainTable :trains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, provide, reactive, ref, watch } from 'vue';
import TrainOptions from '../components/TrainsView/TrainOptions.vue';
import TrainTable from '../components/TrainsView/TrainTable.vue';
import modalTrainMixin from '../mixins/modalTrainMixin';
import { useMainStore } from '../store/mainStore';
import { TrainFilter, trainFilters } from '../components/TrainsView/typings';
import { filteredTrainList } from '../managers/trainFilterManager';
import TrainStats from '../components/TrainsView/TrainStats.vue';
import { Train } from '../typings/common';

export default defineComponent({
  components: {
    TrainTable,
    TrainOptions,
    TrainStats
  },

  mixins: [modalTrainMixin],

  props: {
    train: {
      type: String,
      required: false
    },

    driver: {
      type: String,
      required: false
    },

    trainId: {
      type: String,
      required: false
    }
  },

  data: () => ({
    trainStatsOpen: false,
    sorterIds: ['routeDistance', 'id', 'progress', 'delay', 'mass', 'speed', 'length']
  }),

  setup() {
    const store = useMainStore();
    const initTrainFilters = [...trainFilters.map((f) => ({ ...f }))];

    const sorterActive = reactive({ id: 'routeDistance', dir: -1 });
    const filterList = reactive([...trainFilters]) as TrainFilter[];

    const currentOptionsActive = ref(false);

    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);
    provide('filterList', filterList);

    const computedTrains: ComputedRef<Train[]> = computed(() => {
      return filteredTrainList(
        store.trainList.filter((train) => train.region == store.region.id),
        searchedTrain.value,
        searchedDriver.value,
        sorterActive,
        filterList
      );
    });

    watch([searchedTrain, searchedDriver, sorterActive, filterList], ([sT, sD, sA, fL]) => {
      const areFiltersActive = fL.some((f, i) => f.isActive !== initTrainFilters[i].isActive);

      currentOptionsActive.value =
        sT.length > 0 || sD.length > 0 || sA.id != 'routeDistance' || areFiltersActive;
    });

    return {
      computedTrains,
      searchedTrain,
      searchedDriver,
      sorterActive,
      store,
      currentOptionsActive
    };
  },

  activated() {
    if (this.train) {
      this.searchedTrain = this.train;
      this.searchedDriver = this.driver || '';
    }

    this.$nextTick(() => {
      if (this.trainId) {
        this.selectModalTrain(this.trainId);
      }
    });
  }
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';

.trains-view {
  min-height: 600px;
  position: relative;
}

.trains_wrapper {
  margin: 1rem auto;
  max-width: 1500px;
}

.trains_topbar {
  display: flex;
  align-items: center;
  gap: 0.5em;

  position: relative;
  margin-bottom: 0.5em;
}
</style>
