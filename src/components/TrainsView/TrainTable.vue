<template>
  <div class="train-table" @keydown.esc="closeTimetableCard">
    <transition name="anim" mode="out-in">
      <div :key="trainsDataStatus">
        <!-- <div class="traffic-warning" v-if="data.">
          {{ $t('trains.distance-exceeded') }}
        </div> -->

        <div class="table-info no-trains" v-if="trains.length == 0 && trainsDataStatus >= 2">
          {{ $t('trains.no-trains') }}
        </div>

        <div class="table-info loading" v-if="trains.length == 0 && trainsDataStatus == 0">
          {{ $t('trains.loading') }}
        </div>

        <ul class="train-list">
          <li
            class="train-row"
            v-for="train in currentTrains"
            :key="train.trainNo + train.driverId"
            tabindex="0"
            @click="showTrainTimetable(train)"
            @keydown.enter="showTrainTimetable(train)"
          >
            <TrainInfo :train="train" :simpleView="true" />
          </li>
        </ul>
      </div>
    </transition>

    <span v-if="chosenTrain">
      <train-timetable-card :train="chosenTrain" @close="closeTimetableCard" ref="card" />
    </span>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, Ref } from '@vue/runtime-core';
import { useStore } from '@/store';

import defaultVehicleIconsJSON from '@/data/defaultVehicleIcons.json';

import Train from '@/scripts/interfaces/Train';

import TrainSchedule from '@/components/TrainsView/TrainSchedule.vue';
import TrainInfo from '@/components/TrainsView/TrainInfo.vue';

import { DataStatus } from '@/scripts/enums/DataStatus';
import { GETTERS } from '@/constants/storeConstants';
import TrainTimetableCard from './TrainTimetableCard.vue';
import { ref } from 'vue';

export default defineComponent({
  components: {
    TrainSchedule,
    TrainTimetableCard,
    TrainInfo,
  },

  props: {
    trains: {
      type: Array as () => Train[],
      required: true,
    },
  },

  data: () => ({
    defaultLocoImage: require('@/assets/unknown.png'),

    icons: {
      arrowAsc: require('@/assets/icon-arrow-asc.svg'),
      arrowDesc: require('@/assets/icon-arrow-desc.svg'),
    },

    defaultVehicleIcons: defaultVehicleIconsJSON,

  }),

  setup(props) {
    const store = useStore();

    const trainsDataStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.trainsDataStatus]);

    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;

    const currentTrains = computed(() => {
      return props.trains;

      //.slice(currentPage.value * PAGE_CAPACITY, currentPage.value * PAGE_CAPACITY + PAGE_CAPACITY);
    });

    const chosenTrainId = ref(null) as Ref<string | null>;
    const chosenTrain = computed(() => props.trains.find(train => train.trainNo + train.driverName === chosenTrainId.value));

    // watch([searchedTrain, searchedDriver], () => {
    //   currentPage.value = 0;
    // });

    // watch(paginatorPageCount, (value) => {
    //   if (currentPage.value >= value)
    //     currentPage.value = paginatorPageCount.value - 1 < 0 ? 0 : paginatorPageCount.value - 1;
    // });

    return {
      searchedTrain,
      searchedDriver,
      currentTrains,

      chosenTrain,
      chosenTrainId,

      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      trainsDataStatus: computed(() => trainsDataStatus.value),
      distanceLimitExceeded: computed(
        () => props.trains.findIndex(({ timetableData }) => timetableData && timetableData.routeDistance > 200) != -1
      ),
    };
  },

  methods: {
    enter(el: HTMLElement) {
      const maxHeight = getComputedStyle(el).height;

      el.style.height = '0px';

      getComputedStyle(el);

      setTimeout(() => {
        el.style.height = maxHeight;
      }, 10);
    },

    afterEnter(el: HTMLElement) {
      el.style.height = 'auto';
    },

    leave(el: HTMLElement) {
      el.style.height = getComputedStyle(el).height;

      setTimeout(() => {
        el.style.height = '0px';
      }, 10);
    },

    showTrainTimetable(train: Train) {
      this.chosenTrainId = train.trainNo + train.driverName;
    },

    closeTimetableCard() {
      this.chosenTrainId = null;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out;
  }
}

.table-info {
  text-align: center;

  padding: 1em;
  margin: 1em 0;

  font-size: 1.35em;

  background: var(--clr-bg);
}

img.train-image {
  width: 12em;
}

.traffic-warning {
  padding: 1em 0.5em;
  margin-bottom: 0.5em;
  background: var(--clr-warning);
}

.train {
  &-list {
    max-height: 100vh;
    min-height: 550px;
    overflow: auto;

    padding-right: 0.5em;

    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    margin-bottom: 1em;

    background-color: var(--clr-secondary);
    cursor: pointer;
  }

  &_cars {
    display: flex;
    align-items: center;

    overflow: auto;
  }
}

.paginator {
  display: flex;
  justify-content: center;

  &_item {
    padding: 0.25em 0.5em;
    margin: 0 0.5em;
    outline: 2px solid salmon;

    min-width: 30px;

    text-align: center;

    cursor: pointer;

    &.page-number {
      font-weight: bold;
      color: gold;
    }

    &.disabled {
      outline: 2px solid lightgray;
      color: lightgray;
    }

    &:focus {
      outline: 2px solid white;
    }
  }
}

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>
