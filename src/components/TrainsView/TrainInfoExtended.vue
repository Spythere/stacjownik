<template>
  <div class="train-info extended">
    <section class="info-timetable">
      <div v-if="!train.timetableData">
        <div class="timetable_general">
          <span>
            {{ train.trainNo }} |
            <span>{{ train.driverName }}</span>
          </span>
        </div>
      </div>

      <div v-else>
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

            <span class="timetable_driver-stats">
              <span>
                <b>{{ train.timetableData.category }}</b>
                <b>{{ ' ' + train.trainNo }}</b> |

                <span>{{ train.driverName }}</span>
              </span>

              <img
                class="image-offline"
                v-if="!train.currentStationHash"
                :src="icons.offline"
                alt="offline"
                :title="$t('trains.offline')"
              />

              <span class="hide-info" @click="toggleInfo">
                <img :src="icons.ascArrow" :class="{ hidden: !isInfoShown }" />
                <span>{{ isInfoShown ? 'Ukryj' : 'Pokaż' }} informacje</span>
              </span>
            </span>
          </span>
        </div>

        <div class="timetable_route">
          {{ train.timetableData.route.replace('|', ' - ') }}
        </div>

        <div class="timetable_stops" v-if="isInfoShown">
          <span v-if="train.timetableData.followingStops.length > 2">
            {{ $t('trains.via-title') }}
            <span v-html="displayStopList(train.timetableData.followingStops)"></span>
          </span>
        </div>

        <div class="timetable_comments" v-if="getSceneriesWithComments(train.timetableData).length > 0 && isInfoShown">
          {{ $t('trains.comment') }} <b>{{ getSceneriesWithComments(train.timetableData).join(',') }}</b>
        </div>
      </div>
    </section>

    <section class="info-driver" v-show="isInfoShown">
      <div class="driver_cars">
        <!-- <span v-else>{{ displayLocoInfo(train.locoType) }}</span> -->
      </div>

      <div class="color: #444;">
        <span v-if="train.timetableData">
          <span class="text--primary"> {{ train.timetableData.routeDistance }} </span>km &bull;
        </span>
        <span v-for="(stat, i) in STATS.main" :key="stat.name">
          <span v-if="i > 0">&nbsp;&bull;&nbsp;</span>
          <span class="text--primary">{{ `${~~(train[stat.name] * (stat.multiplier || 1))}` }}</span>
          <span>{{ stat.unit }}</span>
        </span>
      </div>

      <div class="driver_position">
        <span v-if="train.currentStationHash">
          {{ $t('trains.current-scenery') }} <b class="text--primary">{{ train['currentStationName'] }}&nbsp;</b>
        </span>

        <span v-else>
          {{ $t('trains.current-scenery') }}
          <span
            ><b class="text--primary">{{ train['currentStationName'].replace(/.[a-zA-Z0-9]+.sc/, '') }}</b>
            (offline)&nbsp;</span
          >
        </span>

        <span v-if="train.signal">
          {{ $t('trains.current-signal') }} <b class="text--primary">{{ train['signal'] }}&nbsp;</b>
        </span>

        <span v-if="train.connectedTrack">
          {{ $t('trains.current-track') }} <b class="text--primary">{{ train['connectedTrack'] }}&nbsp;</b>
        </span>

        <span v-if="train.distance">({{ displayDistance(train.distance) }})</span>
      </div>

      <div style="margin-top: 0.5em;">
        <b class="text--grayed"> {{ train.locoType }} </b>

        <span v-if="train.cars.length > 0">
          &nbsp;&bull; {{ $t('trains.cars') }}:
          <span class="count">{{ train.cars.length }}</span>
        </span>
      </div>

      <div class="driver_stock">
        <img class="train-image" :src="train.locoURL" alt="loco" @error="onImageError" />

        <img v-if="train.locoType.startsWith('EN')" :src="train.locoURL.replace('rb', 's')" alt="" />
        <img v-if="train.locoType.startsWith('EN71')" :src="train.locoURL.replace('rb', 's')" alt="" />
        <img v-if="train.locoType.startsWith('EN')" :src="train.locoURL.replace('rb', 'ra')" alt="" />

        <img
          v-for="(car, i) in train.cars"
          :key="i"
          :src="`https://rj.td2.info.pl/dist/img/thumbnails/${car.split(':')[0]}.png`"
          @error="onImageError"
          alt="car"
        />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import trainInfoMixin from '@/mixins/trainInfoMixin';
import Train from '@/scripts/interfaces/Train';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    train: {
      type: Object as () => Train,
      required: true,
    },
  },

  mixins: [trainInfoMixin],

  data: () => ({
    icons: {
      warning: require('@/assets/icon-warning.svg'),
      ascArrow: require('@/assets/icon-arrow-asc.svg'),
      offline: require('@/assets/icon-offline.svg'),
    },

    isInfoShown: true,
  }),

  methods: {
    toggleInfo() {
      this.isInfoShown = !this.isInfoShown;
    },
  },
});
</script>

<style lang="scss" scoped>
.image-warning,
.image-offline {
  width: 1em;
  height: 1em;

  margin-left: 0.5em;
}

.extended {
  margin-top: 0.5em;
  padding: 1em;
}

.hide-info {
  margin-left: 1em;

  img {
    width: 1.3em;
    vertical-align: text-bottom;

    &.hidden {
      transform: rotate(180deg);
    }
  }

  cursor: pointer;
}

.info-timetable {
  display: flex;
}

.timetable {
  &_general {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &_hero {
    display: flex;
  }

  &_srjp .activator {
    display: flex;
    align-items: center;

    background-color: #22a8d1;
    border-radius: 0.5em;
    padding: 0.1em 0.35em;
  }

  &_route {
    font-weight: bold;

    margin: 5px 0;

    font-size: 1.1em;
  }

  &_stops {
    margin-bottom: 10px;
    font-size: 0.8em;
  }

  &_comments {
    color: salmon;
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

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;

  padding-top: 1em;

  &_header {
    text-align: center;
    word-wrap: break-word;
    margin-top: 1em;
  }

  &_cars {
    margin: 0.65em 0;
    white-space: pre-wrap;
    text-align: center;

    color: #c5c5c5;

    .count {
      color: var(--clr-primary);
    }
  }

  &_stock {
    display: flex;
    align-items: flex-end;
    overflow-x: auto;

    width: 100%;

    padding: 0.5em 0;
  }

  &_position {
    span {
      text-align: center;
    }

    &:first-letter {
      text-transform: capitalize;
    }
  }
}
</style>
