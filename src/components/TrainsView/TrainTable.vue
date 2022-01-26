<template>
  <div class="train-table">
    <train-timetable-card test="test" />

    <transition name="train-list-anim" mode="out-in">
      <div :key="Number(timetableLoaded) + currentPage">
        <div class="traffic-warning" v-if="distanceLimitExceeded">
          {{ $t('trains.distance-exceeded') }}
        </div>

        <div class="table-info no-trains" v-if="trains.length == 0 && timetableLoaded">
          {{ $t('trains.no-trains') }}
        </div>

        <div class="table-info loading" v-if="trains.length == 0 && !timetableLoaded">
          {{ $t('trains.loading') }}
        </div>
        <!-- 
            :ref="(el) => registerReference(el, train.timetableData?.timetableId)"
 -->
        <ul class="train-list">
          <li
            class="train-row"
            v-for="train in currentTrains"
            :key="train.trainNo + train.driverId"
            tabindex="0"
            @click="showTrainTimetable(train.timetableData?.timetableId)"
            @keydown.enter="showTrainTimetable(train.timetableData?.timetableId)"
          >
            <TrainInfo :train="train" />
            <!-- <TrainSchedule
              v-if="train.timetableData?.timetableId == chosenSchedule"
              :followingStops="train.timetableData?.followingStops"
            /> -->
          </li>
        </ul>
      </div>
    </transition>

    <!-- <transition name="train-list-anim">
      <div class="paginator" v-if="timetableLoaded && currentTrains.length > 0">
        <span
          class="paginator_item"
          :tabindex="currentPage == 0 ? -1 : 0"
          :class="{ disabled: currentPage == 0 }"
          @click="changePageTo(0)"
          @keydown.enter="changePageTo(0)"
        >
          1&lt;
        </span>

        <span
          class="paginator_item"
          :tabindex="currentPage == 0 ? -1 : 0"
          :class="{ disabled: currentPage == 0 }"
          @click="changePageTo(currentPage - 1)"
          @keydown.enter="changePageTo(currentPage - 1)"
        >
          &lt;
        </span>

        <span class="paginator_item page-number">
          {{ currentPage + 1 }}
        </span>

        <span
          class="paginator_item"
          :tabindex="currentPage == paginatorPageCount - 1 ? -1 : 0"
          :class="{ disabled: currentPage == paginatorPageCount - 1 }"
          @click="changePageTo(currentPage + 1)"
          @keydown.enter="changePageTo(currentPage + 1)"
        >
          &gt;
        </span>
        <span
          class="paginator_item"
          :tabindex="currentPage == paginatorPageCount - 1 ? -1 : 0"
          :class="{ disabled: currentPage == paginatorPageCount - 1 }"
          @click="changePageTo(paginatorPageCount - 1)"
          @keydown.enter="changePageTo(paginatorPageCount - 1)"
        >
          &gt;{{ paginatorPageCount }}
        </span>
      </div>
    </transition> -->
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, Ref, ref, watch } from '@vue/runtime-core';
import { useStore } from '@/store';

import defaultVehicleIconsJSON from '@/data/defaultVehicleIcons.json';

import Train from '@/scripts/interfaces/Train';

import TrainSchedule from '@/components/TrainsView/TrainSchedule.vue';
import TrainInfo from '@/components/TrainsView/TrainInfo.vue';

import { DataStatus } from '@/scripts/enums/DataStatus';
import { GETTERS } from '@/constants/storeConstants';
import TrainTimetableCard from './TrainTimetableCard.vue';

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

    const timetableDataStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.timetableDataStatus]);

    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;

    const chosenSchedule = ref(0);

    // PAGINATION
    const PAGE_CAPACITY = 5;

    const currentPage = ref(0);
    const paginatorPageCount = computed(() => Math.ceil(props.trains.length / PAGE_CAPACITY));

    const currentTrains = computed(() => {
      return props.trains;

      //.slice(currentPage.value * PAGE_CAPACITY, currentPage.value * PAGE_CAPACITY + PAGE_CAPACITY);
    });

    watch([searchedTrain, searchedDriver], () => {
      currentPage.value = 0;
    });

    watch(paginatorPageCount, (value) => {
      if (currentPage.value >= value)
        currentPage.value = paginatorPageCount.value - 1 < 0 ? 0 : paginatorPageCount.value - 1;
    });

    return {
      searchedTrain,
      searchedDriver,
      chosenSchedule,

      currentTrains,
      paginatorPageCount,
      currentPage,

      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      timetableLoaded: computed(() => timetableDataStatus.value === DataStatus.Loaded),
      timetableError: computed(() => timetableDataStatus.value === DataStatus.Error),
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

    showTrainTimetable(timetableId: number | undefined) {
      if(!timetableId) return;

      console.log("Gituwa", timetableId);
      
      // if (!timetableId && this.trains.length == 1) this.searchedTrain = '';
      // if (!timetableId) return;
      // this.searchedTrain =
      //   this.searchedTrain == trainNo.toString() && this.chosenSchedule != 0 ? '' : trainNo.toString();
      // this.chosenSchedule = this.chosenSchedule == timetableId ? 0 : timetableId;
    },

    changePageTo(index: number) {
      this.currentPage = index < 0 ? 0 : index >= this.paginatorPageCount ? this.paginatorPageCount - 1 : index;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.unfold-timetable-anim {
  &-leave-active,
  &-enter-active {
    transition: all 150ms ease-out;
    overflow: hidden;
  }
}

.train-list-anim {
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
    max-height: 1000px;
    overflow: auto;

    padding-right: 0.5em;

    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    padding: 1em;
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
