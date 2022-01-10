<template>
  <div class="train-table">
    <div class="traffic-warning" v-if="distanceLimitExceeded">
      {{ $t('trains.distance-exceeded') }}
    </div>

    <transition name="train-list-anim" mode="out-in">
      <div :key="computedTrains.length+Number(timetableLoaded)">
        <div class="table-info no-trains" v-if="computedTrains.length == 0 && timetableLoaded">
          {{ $t('trains.no-trains') }}
        </div>
        <div class="table-info loading" v-if="computedTrains.length == 0 && !timetableLoaded">
          {{ $t('trains.loading') }}
        </div>
        <ul class="train-list">
          <li
            class="train-row"
            v-for="train in computedTrains.filter((_, i) => i < 10)"
            :key="train.trainNo + train.driverId"
            tabindex="0"
            @keydown.enter="changeScheduleShowState(train.timetableData?.timetableId)"
            :ref="(el) => registerReference(el, train.timetableData?.timetableId)"
          >
            <div class="row-wrapper" @click="changeScheduleShowState(train.timetableData?.timetableId)">
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
                    <span class="timetable_srjp g-tooltip">
                      <span class="activator">
                        SRJP
                        <img
                          :src="showedSchedule == train.timetableData.timetableId ? icons.arrowAsc : icons.arrowDesc"
                          alt="arrow-icon"
                        />
                      </span>
                      <span class="content"> {{ $t('trains.detailed-timetable') }} {{ train.trainNo }} </span>
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
                    <a :href="'https://td2.info.pl/profile/?u=' + train.driverId" target="_blank">
                      {{ train.driverName }}
                    </a>
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
                    v-if="defaultVehicleIcons.includes(train.locoType)"
                    class="train-image"
                    :src="defaultLocoImage"
                    alt="default vehicle"
                  />
                  <img v-else class="train-image" :src="train.locoURL" :alt="train.locoType" @error="onImageError" />
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
            <transition name="unfold-timetable-anim" @enter="enter" @afterEnter="afterEnter" @leave="leave">
              <TrainSchedule
                v-if="showedSchedule === train.timetableData?.timetableId"
                :followingStops="train.timetableData?.followingStops"
                @click="changeScheduleShowState(train.timetableData?.timetableId)"
              />
            </transition>
          </li>
          <div class="table-info limit" v-if="timetableLoaded && computedTrains.length > 10">
            {{ $t('trains.table-limit') }}
          </div>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, Ref, ref } from '@vue/runtime-core';
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
    computedTrains: {
      type: Array as () => Train[],
      required: true,
    },

    queryTrain: {
      type: String,
      required: false,
    },
  },

  data: () => ({
    showedSchedule: 0,
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
    const elList: Ref<(HTMLElement | null)[]> = ref([]);

    const timetableDataStatus: ComputedRef<DataStatus> = computed(() => store.getters[GETTERS.timetableDataStatus]);

    const queryTimetable = computed(() => {
      const q = props.computedTrains.find((train) => train.trainNo === Number(props.queryTrain))?.timetableData;

      return q;
    });

    return {
      elList,
      queryTimetable,
      timetableLoaded: computed(() => timetableDataStatus.value === DataStatus.Loaded),
      timetableError: computed(() => timetableDataStatus.value === DataStatus.Error),
      distanceLimitExceeded: computed(
        () =>
          props.computedTrains.findIndex(({ timetableData }) => timetableData && timetableData.routeDistance > 200) !=
          -1
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

    registerReference(el: HTMLElement, timetableId: number | undefined) {
      if (timetableId) this.elList[timetableId] = el;
    },

    focusOnTrain(trainNoStr: string) {
      const timetableId = this.computedTrains.find((train) => train.trainNo == Number(trainNoStr))?.timetableData
        ?.timetableId;

      if (!timetableId) return;

      this.changeScheduleShowState(timetableId);
    },

    changeScheduleShowState(timetableId: number | undefined) {
      if (!timetableId || timetableId < 0) return;

      this.showedSchedule = this.showedSchedule == timetableId ? 0 : timetableId;

      setTimeout(() => {
        const currentEl = this.elList[timetableId];

        currentEl?.scrollIntoView({
          behavior: 'smooth',
          block: this.showedSchedule == 0 ? 'nearest' : 'center',
        });
      }, 200);
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;

      imageEl.src = this.defaultLocoImage;
    },

    displayStopList(stops: TrainStop[]): string | undefined {
      if (!stops) return '';

      return stops
        .reduce((acc: string[], stop: TrainStop, i: number) => {
          if (stop.stopType.includes('ph'))
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
  },

  activated() {
    if (this.queryTrain) this.focusOnTrain(this.queryTrain);
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
    transition: all 100ms ease-out 100ms;
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
      width: 2em;
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
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  font-size: 0.9em;

  padding: 1em 0;

  &-main {
    display: flex;
    margin-bottom: 1.5em;

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

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>
