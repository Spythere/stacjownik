<template>
  <div class="train-info">
    <div class="wrapper">
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
            <!-- <span v-if="train.timetableData.followingStops.length > 2">
              {{ $t('trains.via-title') }}
              <span v-html="displayStopList(train.timetableData.followingStops)"></span>
            </span> -->
          </div>
        </div>

        <div class="info_comments" v-if="getSceneriesWithComments(train.timetableData).length > 0">
          <img
            :src="icons.warning"
            :title="`${$t('trains.timetable-comments')} (${getSceneriesWithComments(train.timetableData).join(',')})`"
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

          <!-- <img class="train-image" hidden="true" :src="train.locoURL" :alt="train.locoType" @load="onImageLoad" /> -->
        </span>
      </span>

      <!-- <span class="stats">
        <div class="stats-main">
          <span v-for="stat in STATS.main" :key="stat.name">
            <img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" />
            {{ `${~~(train[stat.name] * (stat.multiplier || 1))}${stat.unit}` }}
          </span>
        </div>

        <div class="stats-position">
          <span v-for="stat in STATS.position" :key="stat.name">
            <div><img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" /> -</div>
            {{ (train[stat.prop] || '---') + (stat.unit || '') }}
          </span>
        </div>
      </span> -->
    </div>
  </div>
</template>

<script lang="ts">
import Train from '@/scripts/interfaces/Train';
import TrainStop from '@/scripts/interfaces/TrainStop';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    train: {
      type: Object as () => Train,
      required: true,
    },
  },

  data: () => ({
    icons: {
      warning: require('@/assets/icon-warning.svg'),
    },

    STATS: {
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

  methods: {
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

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;

      imageEl.hidden = true;
    },

    onImageLoad(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.hidden = false;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
  grid-template-rows: 1fr;

  @include smallScreen() {
    font-size: 1.2em;
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
</style>
