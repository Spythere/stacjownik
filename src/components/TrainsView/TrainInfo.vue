<template>
  <div class="train-info">
    <section class="train-route">
      <div class="train_general">
        <b class="warning-timeout" v-if="train.isTimeout" :title="$t('trains.timeout')">?</b>
        <span class="timetable-id" v-if="train.timetableData">#{{ train.timetableData.timetableId }}</span>

        <span class="timetable_warnings" v-if="train.timetableData?.TWR || train.timetableData?.SKR">
          <span class="train-badge twr" v-if="train.timetableData?.TWR" :title="$t('general.TWR')">TWR</span>
          <span class="train-badge skr" v-if="train.timetableData?.SKR" :title="$t('general.SKR')">SKR</span>
        </span>

        <strong>
          <span v-if="train.timetableData" class="text--primary">{{ train.timetableData.category }}&nbsp;</span>
          <span class="train-number">{{ train.trainNo }}</span>
        </strong>
        <span>&bull;</span>
        <b class="level-badge driver" :style="calculateExpStyle(train.driverLevel, train.isSupporter)">
          {{ train.driverLevel < 2 ? 'L' : `${train.driverLevel}` }}
        </b>
        <span>{{ train.driverName }}</span>
      </div>

      <div class="timetable_route" v-if="train.timetableData">
        <strong>{{ train.timetableData.route.replace('|', ' - ') }}</strong>
        <img
          v-if="getSceneriesWithComments(train.timetableData).length > 0"
          class="image-warning"
          :src="getIcon('warning')"
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
        <ProgressBar :progressPercent="confirmedPercentage(train.timetableData.followingStops)" />

        <span class="timetable_progress-distance">
          &nbsp; {{ currentDistance(train.timetableData.followingStops) }} km /
          <span class="text--primary"> {{ train.timetableData.routeDistance }} km </span>
          |
          <span v-html="currentDelay(train.timetableData.followingStops)"></span>
        </span>

        <div class="train-status-badges">
          <div v-if="!train.currentStationHash" class="train-badge offline">{{ $t('trains.scenery-offline') }}</div>
          <div v-if="!train.online" class="train-badge offline">Offline {{ lastSeenMessage(train.lastSeen) }}</div>
        </div>
      </div>

      <div class="driver_position text--grayed" style="margin-top: 0.25em">
        {{ displayTrainPosition(train) }}
      </div>
    </section>

    <section class="train-stats">
      <TrainThumbnail :name="train.locoType" />

      <div class="text--grayed">
        {{ train.locoType }}
        <span v-if="train.stockList.length > 0">
          &nbsp;&bull; {{ $t('trains.cars') }}:
          <span class="count">{{ train.stockList.length }}</span>
        </span>
      </div>

      <div>
        <span v-for="(stat, i) in STATS.main" :key="stat.name">
          <span v-if="i > 0"> &bull; </span>
          <span>{{ `${~~((train as any)[stat.name] * (stat.multiplier || 1))}${stat.unit}` }} </span>
        </span>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import styleMixin from '../../mixins/styleMixin';
import trainInfoMixin from '../../mixins/trainInfoMixin';
import Train from '../../scripts/interfaces/Train';
import ProgressBar from '../Global/ProgressBar.vue';
import TrainThumbnail from '../Global/TrainThumbnail.vue';

export default defineComponent({
  props: {
    train: {
      type: Object as () => Train,
      required: true,
    },
    extended: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [trainInfoMixin, imageMixin, styleMixin],
  components: { ProgressBar, TrainThumbnail },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/badge.scss';

.image-warning {
  height: 1em;

  margin-left: 0.5em;
}

.train-stats {
  display: flex;
  justify-content: center;
  align-content: center;

  flex-direction: column;
  text-align: center;

  img {
    margin: 0.5em auto;
    width: 12em;
  }
}

.train-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;

  padding: 1em;

  background-color: #1a1a1a;
  gap: 0.5em;
}

.timetable-id {
  color: #d2d2d2;
}

.warning-timeout {
  background-color: #be3728;

  display: inline-block;
  text-align: center;

  padding: 0 0.25em;
}

.timetable_stops {
  font-size: 0.75em;
}

.train_general {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.25em;
  margin-right: 1.5em;
}
.train-status-badges {
  display: flex;
  flex-wrap: wrap;

  gap: 0.25em;
}

.train-driver {
  &.supporter {
    color: orange;
    text-shadow: orange 0 0 5px;
  }
}

.timetable_route {
  display: flex;
  align-items: center;

  margin-top: 0.5em;
}

.timetable_warnings {
  display: flex;
  gap: 0.25em;
}

.timetable_progress {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.timetable_progress-distance {
  margin-right: 0.25em;
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
  .train-info {
    grid-template-columns: 1fr;
    gap: 1em 0;
    text-align: center;

    font-size: 1.15em;
  }

  .train-stats {
    font-size: 1.1em;
  }

  .train_general {
    justify-content: center;
  }

  .train-status-badges {
    justify-content: center;
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
