<template>
  <section class="stations-view">
    <div class="wrapper">
      <div class="body">
        <div class="options-bar">
          <FilterCard
            :showCard="filterCardOpen"
            :exit="closeCard"
            @changeFilterValue="changeFilterValue"
            @invertFilters="invertFilters"
            @resetFilters="resetFilters"
            ref="filterCardRef"
          />
        </div>

        <StationTable
          :stations="computedStations"
          :sorterActive="filterManager.getSorter()"
          :setFocusedStation="setFocusedStation"
          :changeSorter="changeSorter"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Station from '@/scripts/interfaces/Station';

import StorageManager from '@/scripts/managers/storageManager';
import StationFilterManager from '@/scripts/managers/stationFilterManager';

import inputData from '@/data/options.json';

import StationTable from '@/components/StationsView/StationTable.vue';
import FilterCard from '@/components/StationsView/StationFilterCard.vue';
import SelectBox from '@/components/Global/SelectBox.vue';

import { computed, ComputedRef, defineComponent, reactive } from 'vue';
import { useStore } from '@/store/store';

export default defineComponent({
  components: {
    StationTable,
    FilterCard,
    SelectBox,
  },
  data: () => ({
    trainIcon: require('@/assets/icon-train.svg'),
    timetableIcon: require('@/assets/icon-timetable.svg'),
    dolarIcon: require('@/assets/icon-dolar.svg'),
    filterCardOpen: false,
    modalHidden: true,
    STORAGE_KEY: 'options_saved',
    inputs: inputData,

    regions: [
      {
        id: 'eu',
        value: 'PL1',
      },
      {
        id: 'ru',
        value: 'ENG',
      },
    ],
  }),

  setup() {
    const store = useStore();
    const filterManager = reactive(new StationFilterManager());
    const focusedStationName = '';

    const computedStations: ComputedRef<Station[]> = computed(() =>
      filterManager
        .getFilteredStationList(store.stationList)
        .filter((station) => !station.onlineInfo || station.onlineInfo.region == store.region.id)
    );

    return {
      computedStations,
      filterManager,
      focusedStationName,
    };
  },
  mounted() {
    if (!StorageManager.isRegistered(this.STORAGE_KEY)) return;

    this.filterManager.checkFilters();

    this.inputs.options.forEach((option) => {
      const value = StorageManager.getBooleanValue(option.name);
      this.changeFilterValue({ name: option.name, value: value ? 0 : 1 });
      option.value = value;
    });

    this.inputs.sliders.forEach((slider) => {
      const value = StorageManager.getNumericValue(slider.name);
      this.changeFilterValue({ name: slider.name, value });
      slider.value = value;
    });
  },
  methods: {
    toggleCardsState(name: string): void {
      if (name == 'filter') {
        this.filterCardOpen = !this.filterCardOpen;
      }
    },
    changeSorter(index: number) {
      this.filterManager.changeSorter(index);
    },
    changeFilterValue(filter: { name: string; value: number }) {
      this.filterManager.changeFilterValue(filter);
    },
    resetFilters() {
      this.filterManager.resetFilters();
    },
    invertFilters() {
      this.filterManager.invertFilters();
    },
    closeCard() {
      this.filterCardOpen = false;
    },
    setFocusedStation(name: string) {
      this.focusedStationName = this.focusedStationName == name ? '' : name;
    },
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

@include smallScreen {
  .options-bar {
    font-size: 1.1em;
  }
}
</style>
