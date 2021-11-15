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

          <div class="paypal-link">
            <a target="_blank" href="https://paypal.me/spythere">
              <img
                src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white"
                alt="PayPal image"
                style="width: 7em"
              />
            </a>
          </div>
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

import { StoreData } from '@/scripts/interfaces/StoreData';
import { DataStatus } from '@/scripts/enums/DataStatus';
import { computed, ComputedRef, defineComponent, reactive } from 'vue';
import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';

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

    const data: ComputedRef<StoreData> = computed(() => store.getters[GETTERS.allData]);

    const computedStations: ComputedRef<Station[]> = computed(() => {
      return filterManager.getFilteredStationList(store.getters[GETTERS.stationList]);
    });

    const getStatusClass = computed(() => {
      if (data.value.dataConnectionStatus == DataStatus.Loading) return 'loading';
      if (data.value.dataConnectionStatus == DataStatus.Error) return 'error';
      return 'success';
    });

    const timetableDataStatusClass = computed(() => {
      if (data.value.timetableDataStatus == DataStatus.Loading) return 'loading';
      if (data.value.timetableDataStatus == DataStatus.Error) return 'error';
      return 'success';
    });

    const focusedStationInfo = computed(() =>
      computedStations.value.find((station) => station.stationName === focusedStationName)
    );

    return {
      data,
      computedStations,
      filterManager,
      getStatusClass,
      timetableDataStatusClass,
      focusedStationName,
      focusedStationInfo,
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
  padding: 0 0.5em;
}

.body {
  max-width: 100%;
}

.options-bar {
  display: flex;
  align-items: center;

  margin-bottom: 0.5em;
}

.paypal-link {
  flex-grow: 2;
  text-align: right;

  img {
    vertical-align: middle;
    border-radius: 0.5em;
    transition: box-shadow 150ms;
  }

  a:hover img,
  a:focus img {
    box-shadow: 0 0 10px 4px #04477e;
  }
}

@include smallScreen {
  .options-bar {
    font-size: 1.1em;
  }
}
</style>
