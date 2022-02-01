<template>
  <div class="train-info">
    <!-- SIMPLE VIEW -->
    <div v-if="simpleView">
      <div class="simple-view wrapper">
        <span>
          <span v-if="train.timetableData">
            <div>
              <strong>{{ train.timetableData.category }} {{ train.trainNo }}</strong>
              |
              {{ train.driverName }}
            </div>

            <div>
              <strong>{{ train.timetableData.route.replace('|', ' - ') }}</strong>
            </div>

            <div style="margin-top: 0.5em">
              <span style="color: #ccc">
                {{ train.locoType }}
              </span>
              |
              <span style="color: gold"> {{ train.timetableData.routeDistance }} km </span>
              |
              <span>
                {{ $t('trains.route-progress') }} {{ confirmedPercentage(train.timetableData.followingStops) }}%</span
              >
              |
              <span v-html="currentDelay(train.timetableData.followingStops)"></span>

              <div class="comments" v-if="getSceneriesWithComments(train.timetableData).length > 0">
                <img
                  class="image-warning"
                  :src="icons.warning"
                  :title="
                    `${$t('trains.timetable-comments')} (${getSceneriesWithComments(train.timetableData).join(',')})`
                  "
                />

                <b>{{ $t('trains.timetable-comments').toUpperCase() }}</b>
              </div>
            </div>
          </span>

          <span v-else>
            <span>
              {{ train.trainNo }} |
              <span style="color: gold">
                {{ $t('trains.no-timetable') }}
              </span>
            </span>
          </span>
        </span>

        <span class="train-image" style="display: flex; justify-content: center; align-items: center;">
          <img :src="train.locoURL" alt="Not Found" @error="onImageError" />
        </span>

        <span class="info-stats">
          <span v-for="stat in STATS.main" :key="stat.name">
            <span>{{ $t(`trains.option-${stat.name}`).toUpperCase() }}</span
            >:
            <span class="text--primary">{{ `${~~(train[stat.name] * (stat.multiplier || 1))}${stat.unit}` }} </span>
          </span>
        </span>
      </div>
    </div>

    <!-- EXTENDED VIEW -->
    <div class="extended-view wrapper" v-else>
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
                <span style="color: gold"> {{ train.timetableData.routeDistance }} km</span>
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
            class="image-warning"
            :src="icons.warning"
            :title="`${$t('trains.timetable-comments')} (${getSceneriesWithComments(train.timetableData).join(',')})`"
          />
        </div>
      </span>

      <span class="stats">
        <div class="stats-main">
          <span v-for="stat in STATS.main" :key="stat.name">
            <img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" />
            {{ `${~~(train[stat.name] * (stat.multiplier || 1))}${stat.unit}` }}
          </span>
        </div>

        <div class="stats-position">
          <span v-for="stat in STATS.position" :key="stat.name">
            <div><img :src="require(`@/assets/icon-${stat.name}.svg`)" :alt="stat.name" /></div>
            {{ (train[stat.prop] || '---') + (stat.unit || '') }}
          </span>
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

          <div class="driver-stock">
            <img class="train-image" :src="train.locoURL" alt="loco" @error="onImageError" />
            <img
              v-for="(car, i) in train.cars"
              :key="i"
              :src="`https://rj.td2.info.pl/dist/img/thumbnails/${car.split(':')[0]}.png`"
              @error="onImageError"
              alt="car"
              srcset=""
            />
          </div>
        </span>
      </span>
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

    simpleView: {
      type: Boolean,
      default: false,
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

    confirmedPercentage(stops: TrainStop[]) {
      return ((stops.filter((stop) => stop.confirmed).length / stops.length) * 100).toFixed(0);
    },

    currentDelay(stops: TrainStop[]) {
      const delay =
        stops.find((stop, i) => (i == 0 && !stop.confirmed) || (i > 0 && stops[i - 1].confirmed && !stop.confirmed))
          ?.departureDelay || 0;

      if (delay > 0) return `<span style='color: salmon'>${this.$t('trains.delayed')} ${delay} min</span>`;
      else if (delay < 0) return `<span style='color: lightgreen'>${this.$t('trains.preponed')} ${delay} min</span>`;
      else return this.$t('trains.on-time');
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
      imageEl.src = require('@/assets/unknown.png');

      console.log('error');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.image-warning {
  width: 1.35em;
}

.wrapper {
  display: grid;
  padding: 1em;

  &.extended-view {
    grid-template-columns: repeat(auto-fit, minmax(30em, 1fr));
    grid-template-rows: 1fr;

    margin-top: 0.5em;
  }

  &.simple-view {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 1fr;

    gap: 0.5em;

    &:hover {
      background: #424242;
    }

    .info-stats {
      text-align: right;

      display: flex;
      flex-direction: column;
    }

    .comments {
      display: flex;
      align-items: center;

      font-size: 0.9em;

      margin-top: 1em;

      img {
        margin-right: 0.5em;
      }
    }

    @include smallScreen() {
      grid-template-columns: 1fr;
      gap: 1em 0;
      text-align: center;

      .info-stats {
        text-align: center;
      }

      .comments {
        flex-direction: column;
        justify-content: center;

        img {
          margin: 0 0 0.5em 0;
        }
      }
    }
  }

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
}

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;

  padding-top: 1em;

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

  &-stock {
    display: flex;
    align-items: flex-end;
    overflow-x: auto;

    img {
      margin: 0 auto;
    }
  }
}

.stats {
  font-size: 0.9em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  padding-top: 1em;

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
