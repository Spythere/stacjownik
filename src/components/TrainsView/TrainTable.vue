<template>
  <div class="train-table">
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
            @click="showTrainTimetable(train.trainNo, train.timetableData?.timetableId)"
            @keydown.enter="showTrainTimetable(train.trainNo, train.timetableData?.timetableId)"
          >
            <div class="row-wrapper">
              <span class="info">
                <div class="info_timetable" v-if="!train.timetableData">
                  <div class="timetable_general">
                    <span>
                      {{ train.trainNo }} |
                      <span style="color: gold">
                        {{ $t('trains.no-timetable') }}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="info_timetable" v-else>
                  <div class="timetable_general">
                    <span class="timetable_hero">
                      <span class="timetable_warnings">
                        <span class="warning twr" v-if="train.timetableData.TWR">
                          TWR
                        </span>

                        <span class="warning skr" v-if="train.timetableData.SKR">
                          SKR
                        </span>
                      </span>

                      <span>
                        <strong>{{ train.timetableData.category }}</strong>
                        {{ train.trainNo }} |
                        <span style="color: gold"> {{ train.timetableData.routeDistance }} km </span>
                      </span>
                    </span>
                  </div>

                  <div class="timetable_route">
                    {{ train.timetableData.route.replace('|', ' - ') }}
                  </div>

                  <div class="timetable_stops">
                    <span v-if="train.timetableData.followingStops.length > 2">
                      {{ $t('trains.via-title') }}
                      <span v-html="displayStopList(train.timetableData.followingStops)"></span>
                    </span>
                  </div>
                </div>

                <div class="info_comments" v-if="getSceneriesWithComments(train.timetableData).length > 0">
                  <img
                    :src="icons.warning"
                    :title="
                      `${$t('trains.timetable-comments')} (${getSceneriesWithComments(train.timetableData).join(',')})`
                    "
                  />
                </div>
              </span>

              <span class="driver">
                <div class="driver-info">
                  <span class="driver-name">
                    {{ train.driverName }}
                  </span>
                  &bull;
                  <span class="driver-type">
                    {{ train.locoType }}
                  </span>
                </div>

                <span class="driver-loco">
                  <div class="driver-cars">
                    <span v-if="train.cars.length > 0">
                      {{ $t('trains.cars') }}:
                      <span class="count">{{ train.cars.length }}</span>
                    </span>
                    <span v-else>{{ displayLocoInfo(train.locoType) }}</span>
                  </div>

                  <img
                    class="train-image"
                    hidden="true"
                    :src="train.locoURL"
                    :alt="train.locoType"
                    @load="onImageLoad"
                  />
                </span>
              </span>

              <span class="stats">
                <div class="stats-main">
                  <span v-for="stat in stats.main" :key="stat.name">
                    <img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" />
                    {{ `${~~(train[stat.name] * (stat.multiplier || 1))}${stat.unit}` }}
                  </span>
                </div>

                <div class="stats-position">
                  <span v-for="stat in stats.position" :key="stat.name">
                    <div>
                      <img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" />
                    </div>
                    {{ (train[stat.prop] || '---') + (stat.unit || '') }}
                  </span>
                </div>
              </span>
            </div>

            <TrainSchedule
              v-if="train.timetableData?.timetableId == chosenSchedule"
              :followingStops="train.timetableData?.followingStops"
            />
          </li>
        </ul>
      </div>
    </transition>

    <transition name="train-list-anim">
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
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, Ref, ref, watch } from '@vue/runtime-core';
import { useStore } from '@/store';

import defaultVehicleIconsJSON from '@/data/defaultVehicleIcons.json';

import Train from '@/scripts/interfaces/Train';
import TrainStop from '@/scripts/interfaces/TrainStop';
import TrainSchedule from '@/components/TrainsView/TrainSchedule.vue';

import { DataStatus } from '@/scripts/enums/DataStatus';
import { GETTERS } from '@/constants/storeConstants';

export default defineComponent({
  components: {
    TrainSchedule,
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
      warning: require('@/assets/icon-warning.svg'),
      arrowAsc: require('@/assets/icon-arrow-asc.svg'),
      arrowDesc: require('@/assets/icon-arrow-desc.svg'),
    },

    defaultVehicleIcons: defaultVehicleIconsJSON,

    stats: {
      main: [
        {
          name: 'mass',
          unit: 't',
          multiplier: 0.001,
        },
        {
          name: 'speed',
          unit: 'km/h',
        },
        {
          name: 'length',
          unit: 'm',
        },
      ],

      position: [
        {
          name: 'scenery',
          prop: 'currentStationName',
        },
        {
          name: 'route',
          prop: 'connectedTrack',
        },
        {
          name: 'signal',
          prop: 'signal',
        },
        {
          name: 'distance',
          prop: 'distance',
          unit: 'm',
        },
      ],
    },
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
      return props.trains.slice(currentPage.value * PAGE_CAPACITY, currentPage.value * PAGE_CAPACITY + PAGE_CAPACITY);
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

    showTrainTimetable(trainNo: number, timetableId: number | undefined) {
      if (!timetableId && this.trains.length == 1) this.searchedTrain = '';
      if (!timetableId) return;

      this.searchedTrain =
        this.searchedTrain == trainNo.toString() && this.chosenSchedule != 0 ? '' : trainNo.toString();
      this.chosenSchedule = this.chosenSchedule == timetableId ? 0 : timetableId;
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;

      imageEl.hidden = true;
    },

    onImageLoad(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.hidden = false;
    },

    displayStopList(stops: TrainStop[]): string | undefined {
      if (!stops) return '';

      return stops
        .reduce((acc: string[], stop: TrainStop, i: number) => {
          if (stop.stopType.includes('ph') && !stop.stopNameRAW.includes('po.'))
            acc.push(`<strong style='color:${stop.confirmed ? 'springgreen' : 'white'}'>${stop.stopName}</strong>`);
          else if (
            i > 0 &&
            i < stops.length - 1 &&
            !stop.stopNameRAW.includes('po.') &&
            !stop.stopNameRAW.includes('SBL')
          )
            acc.push(`<span style='color:${stop.confirmed ? 'springgreen' : 'lightgray'}'>${stop.stopName}</span>`);
          return acc;
        }, [])
        .join(' > ');
    },

    displayLocoInfo(locoType: string) {
      if (locoType.includes('EN')) return `${this.$t('trains.EZT')}`;
      if (locoType.includes('SN')) return `${this.$t('trains.SZT')}`;
      if (locoType.startsWith('E')) return `${this.$t('trains.loco-electric')}`;
      if (locoType.startsWith('S')) return `${this.$t('trains.loco-diesel')}`;

      return '';
    },

    getSceneriesWithComments(timetableData: Train['timetableData']) {
      return (
        timetableData?.followingStops.reduce((acc, stop) => {
          if (stop.comments) acc.push(stop.stopNameRAW);

          return acc;
        }, [] as string[]) || []
      );
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
    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    padding: 1em;
    margin-bottom: 1em;

    background-color: var(--clr-secondary);
    cursor: pointer;

    .row-wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
      grid-template-rows: 1fr;

      @include smallScreen() {
        font-size: 1.2em;
      }
    }
  }

  &_cars {
    display: flex;
    align-items: center;

    overflow: auto;
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & .timetable {
    &_hero {
      display: flex;
    }

    &_general {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &_srjp .activator {
      display: flex;
      align-items: center;

      background-color: #22a8d1;
      border-radius: 0.5em;
      padding: 0.1em 0.35em;
    }

    &_route {
      display: flex;
      align-items: center;

      font-weight: bold;

      margin: 5px 0;

      font-size: 1.1em;
    }

    &_stops {
      margin-bottom: 10px;
      font-size: 0.7em;
    }

    &_warnings {
      display: flex;
      color: black;

      .warning {
        padding: 0.1em 0.65em;
        margin-right: 0.35em;

        font-weight: bold;

        &.twr {
          background: var(--clr-twr);
        }

        &.skr {
          background: var(--clr-skr);
        }
      }
    }
  }

  &_comments {
    img {
      width: 1.75em;
    }
  }
}

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;

  grid-row: span 2;

  padding: 2em 0;

  &-info {
    text-align: center;
    word-wrap: break-word;
  }

  &-name {
    font-weight: bold;
  }

  &-loco {
    width: 100%;
    text-align: center;
  }

  &-cars {
    margin: 0.65em 0;
    white-space: pre-wrap;
    text-align: center;

    color: #c5c5c5;

    .count {
      color: var(--clr-primary);
    }
  }
}

.stats {
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding: 1em 0;

  &-main {
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > span {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100%;
    }

    img {
      margin: 0 0.3em;
      width: 2em;
    }
  }

  &-position {
    display: flex;

    margin-top: 1em;
    text-align: center;

    p {
      color: var(--clr-accent);
    }

    & > span {
      width: 100%;

      img {
        width: 2em;
      }
    }
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
