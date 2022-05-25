<template>
  <div class="train-info simple" tabindex="0">
    <section>
      <span>
        <div>
          <span>
            <span class="timetable_warnings">
              <span class="warning twr" v-if="train.timetableData?.TWR">TWR</span>
              <span class="warning skr" v-if="train.timetableData?.SKR">SKR</span>
            </span>
            <strong v-if="train.timetableData">{{ train.timetableData.category }}&nbsp;</strong>
            <strong>{{ train.trainNo }}</strong>
            <span>&nbsp;| {{ train.driverName }}</span>
          </span>

          <img
            class="image-offline"
            style="height: 1em"
            v-if="!train.currentStationHash"
            :src="icons.offline"
            alt="offline"
            :title="$t('trains.offline')"
          />
        </div>

        <div class="timetable_route">
          <strong v-if="train.timetableData">{{ train.timetableData.route.replace('|', ' - ') }}</strong>
          <img
            v-if="getSceneriesWithComments(train.timetableData).length > 0"
            class="image-warning"
            :src="icons.warning"
            :title="`${$t('trains.timetable-comments')} (${getSceneriesWithComments(train.timetableData)})`"
          />
        </div>

        <hr style="margin: 0.25em 0" />

        <div class="timetable_stops" v-if="train.timetableData">
          <span v-if="train.timetableData.followingStops.length > 2">
            {{ $t('trains.via-title') }}
            <span v-html="displayStopList(train.timetableData.followingStops)"></span>
          </span>
        </div>

        <div class="timetable_progress" style="margin-top: 0.5em" v-if="train.timetableData">
          <!-- <span> </span> -->
          <span class="timetable_progress-bar">
            <!-- {{ confirmedPercentage(train.timetableData.followingStops) }}%&nbsp; -->
            <span class="bar-bg"></span>
            <span
              class="bar-fg"
              :style="{ width: `${Math.floor(confirmedPercentage(train.timetableData.followingStops))}%` }"
            ></span>
          </span>

          <span>
            &nbsp; {{ currentDistance(train.timetableData.followingStops) }} km /
            <span class="text--primary"> {{ train.timetableData.routeDistance }} km </span>
            |
            <span v-html="currentDelay(train.timetableData.followingStops)"></span>
          </span>
        </div>

        <div class="driver_position text--grayed" style="margin-top: 0.25em">
          <span v-if="train.currentStationHash">
            {{ $t('trains.current-scenery') }} <span>{{ train['currentStationName'] }}&nbsp;</span>
          </span>

          <span v-else>
            {{ $t('trains.current-scenery') }}
            <span>{{ train['currentStationName'].replace(/.[a-zA-Z0-9]+.sc/, '') }} (offline)&nbsp;</span>
          </span>

          <span v-if="train.signal">
            {{ $t('trains.current-signal') }} <span>{{ train['signal'] }}&nbsp;</span>
          </span>

          <span v-if="train.connectedTrack">
            {{ $t('trains.current-track') }} <span>{{ train['connectedTrack'] }}&nbsp;</span>
          </span>

          <span v-if="train.distance">({{ displayDistance(train.distance) }})</span>
        </div>
      </span>
    </section>

    <section class="train-image" style="display: flex; justify-content: center; align-items: center">
      <img :src="train.locoURL" loading="lazy" alt="Loco image not found" @error="onImageError" />

      <div class="text--grayed">
        {{ train.locoType }}
        <span v-if="train.cars.length > 0">
          &nbsp;&bull; {{ $t('trains.cars') }}:
          <span class="count">{{ train.cars.length }}</span>
        </span>
      </div>

      <div>
        <div>
          <span v-for="(stat, i) in STATS.main" :key="stat.name">
            <span v-if="i > 0"> &bull; </span>
            <span>{{ `${~~(train[stat.name] * (stat.multiplier || 1))}${stat.unit}` }} </span>
          </span>
        </div>
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
      offline: require('@/assets/icon-offline.svg'),
    },
  }),
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.image-warning,
.image-offline {
  height: 1em;

  margin-left: 0.5em;
}

.train-image {
  display: flex;
  flex-direction: column;

  img {
    margin: 0.5em 0;
    width: 12em;
  }
}

.simple {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;

  padding: 1em;
  background-color: #202020;
  gap: 0.5em;
}

.driver_position:first-letter {
  text-transform: capitalize;
}

.timetable_stops {
  font-size: 0.75em;
}

.timetable_route {
  display: flex;
  align-items: center;

  margin-top: 0.5em;
}

.timetable_warnings {
  color: black;

  .warning {
    padding: 0.1em 0.5em;
    margin-right: 0.2em;

    font-weight: bold;

    &.twr {
      background: var(--clr-twr);
    }

    &.skr {
      background: var(--clr-skr);
    }
  }
}

.timetable_progress {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.timetable_progress-bar {
  position: relative;

  width: 6em;
  height: 1em;

  .bar-fg,
  .bar-bg {
    position: absolute;
    height: 1em;
    width: 100%;

    left: 0;
  }

  .bar-fg {
    background-color: springgreen;
  }

  .bar-bg {
    background-color: #5b5b5b;
  }
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
  .simple {
    grid-template-columns: 1fr;
    gap: 1em 0;
    text-align: center;
  }

  .info-stats {
    text-align: center;
  }

  .timetable_route {
    justify-content: center;
  }

  .timetable_progress {
    justify-content: center;
  }

  .comments {
    flex-direction: column;
    justify-content: center;

    img {
      margin: 0 0 0.5em 0;
    }
  }
}
</style>
