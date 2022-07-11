<template>
  <keep-alive>
    <TrainModal v-if="chosenTrain" :chosen-train="chosenTrain" @close-modal="closeTimetable" />
  </keep-alive>

  <div class="train-table" @keydown.esc="closeTimetable">
    <button class="return-btn" @click="scrollToTop" v-if="showReturnButton">
      <img :src="icons.arrowAsc" alt="return arrow" />
    </button>

    <transition name="anim" mode="out-in">
      <div :key="store.dataStatuses.trains">
        <Loading v-if="trains.length == 0 && store.dataStatuses.trains == 0" />

        <div class="table-info no-trains" v-if="trains.length == 0 && store.dataStatuses.trains != 0">
          {{ $t('trains.no-trains') }}
        </div>

        <ul class="train-list">
          <li
            class="train-row"
            v-for="train in currentTrains"
            :key="train.trainNo + train.driverId"
            @click.stop="toggleTimetable(train)"
            @keydown.enter="toggleTimetable(train)"
          >
            <TrainInfo :train="train" />
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, Ref } from '@vue/runtime-core';

import defaultVehicleIconsJSON from '@/data/defaultVehicleIcons.json';

import Train from '@/scripts/interfaces/Train';

import TrainSchedule from '@/components/TrainsView/TrainSchedule.vue';
import TrainInfo from '@/components/TrainsView/TrainInfo.vue';

import returnBtnMixin from '@/mixins/returnBtnMixin';
import { useStore } from '@/store/store';
import Loading from '../Global/Loading.vue';
import TrainModal from '../Global/TrainModal.vue';

export default defineComponent({
  components: {
    TrainSchedule,
    TrainInfo,
    Loading,
    TrainModal,
  },

  mixins: [returnBtnMixin],

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
    chosenTrainId: null as string | null,
  }),

  setup(props) {
    const store = useStore();

    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;

    const currentTrains = computed(() => {
      return props.trains;
    });

    return {
      searchedTrain,
      searchedDriver,
      currentTrains,
      store,

      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      distanceLimitExceeded: computed(
        () => props.trains.findIndex(({ timetableData }) => timetableData && timetableData.routeDistance > 200) != -1
      ),
    };
  },

  computed: {
    chosenTrain() {
      return this.trains.find((train) => train.trainId == this.chosenTrainId);
    },
  },

  activated() {
    const query = this.$route.query;

    if (query.trainNo && query.driverName) {
      this.searchedDriver = query.driverName.toString();
      this.searchedTrain = query.trainNo.toString();

      setTimeout(() => {
        this.chosenTrainId = query.driverName + <string>query.trainNo;
      }, 20);
    }
  },

  deactivated() {
    this.chosenTrainId = null;
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

    toggleTimetable(train: Train, state?: boolean) {
      if (state !== undefined) {
        this.chosenTrainId = train.trainId;
        return;
      }

      this.chosenTrainId = this.chosenTrainId && this.chosenTrainId == train.trainId ? null : train.trainId;
    },

    closeTimetable() {
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

  padding: 1em 0;
  margin: 1em 0;

  font-size: 1.5em;

  background: #333;
}

img.train-image {
  width: 12em;
}

.traffic-warning {
  padding: 1em 0;
  margin-bottom: 0.5em;
  background: var(--clr-warning);
}

.train {
  &-list {
    overflow: auto;

    margin-top: 1em;

    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    background-color: var(--clr-secondary);
    margin-bottom: 1em;

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
