<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="body">
        <div class="options-bar">
          <StationFilterCard :showCard="filterCardOpen" :exit="(filterCardOpen = false)" ref="filterCardRef" />
        </div>

        <StationTable :stations="computedStationList" />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import StorageManager from '../scripts/managers/storageManager';
import StationTable from '../components/StationsView/StationTable.vue';
import StationFilterCard from '../components/StationsView/StationFilterCard.vue';
import SelectBox from '../components/Global/SelectBox.vue';
import { useStationFiltersStore } from '../store/stationFiltersStore';
import { useStore } from '../store/store';

export default defineComponent({
  components: {
    StationTable,
    StationFilterCard,
    SelectBox,
  },

  data: () => ({
    filterCardOpen: false,
    modalHidden: true,
    STORAGE_KEY: 'options_saved',
    focusedStationName: '',
  }),

  setup() {
    return {
      filterStore: useStationFiltersStore(),
      store: useStore(),
    };
  },

  computed: {
    computedStationList() {
      const list = this.filterStore.getFilteredStationList(this.store.stationList, this.store.region.id);

      return list;
    },
  },

  mounted() {
    this.filterStore.setupFilters();
    // this.filterStore.inputs.options.forEach((option) => {
    //   const value = StorageManager.getBooleanValue(option.name);
    //   option.value = value;
    //   this.filterStore.changeFilterValue({ name: option.name, value: value });
    // });

    // this.filterStore.inputs.sliders.forEach((slider) => {
    //   const value = StorageManager.getNumericValue(slider.name);
    //   slider.value = value;
    //   this.filterStore.changeFilterValue({ name: slider.name, value: value });
    // });
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/responsive.scss';

@keyframes blinkAnim {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.indicator-anim {
  &-enter-active,
  &-leave-active {
    transition: all 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.stations-view {
  position: relative;

  padding: 1em 0;
  min-height: 100%;
}

.wrapper {
  display: flex;
  justify-content: center;
}

.body {
  max-width: 100%;
}

.options-bar {
  display: flex;
  align-items: center;

  margin-bottom: 0.5em;
}
</style>
