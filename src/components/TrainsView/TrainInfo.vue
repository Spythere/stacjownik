<template>
  <div class="train-info" :data-extended="extended">
    <section class="train-general">
      <div class="general-top-bar">
        <div class="top-bar-header">
          <b class="warning-timeout" v-if="train.isTimeout" :title="$t('trains.timeout')">?</b>
          <span class="timetable-id" v-if="train.timetableData">
            #{{ train.timetableData.timetableId }}
          </span>

          <span class="train-badge twr" v-if="train.timetableData?.TWR" :title="$t('general.TWR')">
            TWR
          </span>

          <span class="train-badge skr" v-if="train.timetableData?.SKR" :title="$t('general.SKR')">
            SKR
          </span>

          <b
            v-if="train.timetableData"
            data-tooltip-type="BaseTooltip"
            :data-tooltip-content="getCategoryExplanation(train.timetableData.category)"
            class="text--primary tooltip-help"
          >
            {{ train.timetableData.category }}
          </b>
          <b class="train-number">{{ train.trainNo }}</b>
          <span>&bull;</span>

          <div class="train-driver">
            <b
              class="level-badge driver"
              :style="calculateExpStyle(train.driverLevel, train.isSupporter)"
            >
              {{ train.driverLevel < 2 ? 'L' : `${train.driverLevel}` }}
            </b>

            <b
              v-if="apiStore.donatorsData.includes(train.driverName)"
              data-tooltip-type="DonatorTooltip"
              :data-tooltip-content="$t('donations.driver-message')"
            >
              {{ train.driverName }}
              <img src="/images/icon-diamond.svg" alt="donator diamond icon" />
            </b>

            <span v-else>{{ train.driverName }}</span>
          </div>
        </div>
      </div>

      <div class="general-timetable" v-if="train.timetableData">
        <strong>{{ train.timetableData.route.replace('|', ' - ') }}</strong>
        <span
          v-if="getSceneriesWithComments(train.timetableData).length > 0"
          data-tooltip-type="BaseTooltip"
          :data-tooltip-content="`${$t('trains.timetable-comments')} (${getSceneriesWithComments(
            train.timetableData
          )})`"
        >
          <img class="image-warning" src="/images/icon-warning.svg" />
        </span>
      </div>

      <hr style="margin: 0.25em 0" />

      <div class="general-stops" v-if="train.timetableData">
        <span v-if="train.timetableData.followingStops.length > 2">
          {{ $t('trains.via-title') }}
          <span v-html="getTrainStopsHtml(train.timetableData.followingStops)"></span>
        </span>
      </div>

      <div class="general-status">
        <div class="status-timetable-progress" v-if="train.timetableData">
          <ProgressBar :progressPercent="confirmedPercentage(train.timetableData.followingStops)" />

          <span class="progress-distance">
            <span>{{ currentDistance(train.timetableData.followingStops) }} km</span>
            <span>/</span>
            <span class="text--primary">{{ train.timetableData.routeDistance }} km </span>
            <span>|</span>
            <span v-html="currentDelay(train.timetableData.followingStops)"></span>
          </span>
        </div>

        <div class="status-badges">
          <div v-if="!train.currentStationHash" class="train-badge offline">
            <img src="/images/icon-offline.svg" alt="offline train icon" />
            {{ $t('trains.scenery-offline') }}
          </div>

          <div v-if="!train.online" class="train-badge offline">
            <img src="/images/icon-offline.svg" alt="offline train icon" />
            Offline {{ lastSeenMessage(train.lastSeen) }}
          </div>
        </div>
      </div>

      <div class="general-stats" v-if="extended">
        <div>
          <img src="/images/icon-length.svg" alt="length icon" />
          {{ train.length }}m
        </div>

        <div>
          <img src="/images/icon-mass.svg" alt="mass icon" />
          {{ (train.mass / 1000).toFixed(1) }}t
        </div>

        <div>
          <img src="/images/icon-speed.svg" alt="speed icon" />
          {{ train.speed }} km/h

          <span v-if="stockSpeedLimit != Infinity">
            &bull;
            <em
              class="text--grayed"
              style="text-decoration: underline dotted"
              tabindex="0"
              :data-tooltip="$t('trains.vmax-tooltip')"
            >
              {{ stockSpeedLimit }} km/h
            </em>
          </span>
        </div>
      </div>

      <div class="text--grayed" style="margin-top: 0.25em">
        {{ displayTrainPosition(train) }}
      </div>
    </section>

    <section class="train-stats" v-if="!extended">
      <StockList :trainStockList="train.stockList" :tractionOnly="true" />

      <div>
        <span>{{ train.speed }}km/h</span>

        <div>
          <span> {{ train.length }}m</span>
          &bull;
          <span> {{ (train.mass / 1000).toFixed(1) }}t</span>
          <span v-if="train.stockList.length > 1">
            &bull;
            {{ $t('trains.cars') }}: {{ train.stockList.length - 1 }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import styleMixin from '../../mixins/styleMixin';
import trainInfoMixin from '../../mixins/trainInfoMixin';
import ProgressBar from '../Global/ProgressBar.vue';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';
import StockList from '../Global/StockList.vue';
import { Train } from '../../typings/common';
import trainCategoryMixin from '../../mixins/trainCategoryMixin';

export default defineComponent({
  mixins: [trainInfoMixin, styleMixin, trainCategoryMixin],
  components: { ProgressBar, StockList },

  props: {
    train: {
      type: Object as () => Train,
      required: true
    },
    extended: {
      type: Boolean
    }
  },

  data() {
    return {
      store: useMainStore(),
      apiStore: useApiStore()
    };
  },

  computed: {
    stockSpeedLimit() {
      return this.train.stockList.reduce((acc, stockName) => {
        const vehicleSpeed =
          this.apiStore.vehiclesData?.find((v) => v.name == stockName.split(':')[0])?.group.speed ??
          300;

        return Math.min(vehicleSpeed, acc);
      }, 300);
    }
  },

  methods: {
    navigateToJournal() {
      this.$router.push({
        path: '/journal/timetables',
        query: {
          'search-driver': this.train.driverName
        }
      });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/badge.scss';

.image-warning {
  height: 1em;
  margin-left: 0.5em;
  vertical-align: middle;
}

.train-stats {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;
  text-align: center;

  line-height: 1.5em;
}

.train-info {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;

  &[data-extended='true'] {
    grid-template-columns: 1fr;
  }

  padding: 1em;

  background-color: #1a1a1a;
  gap: 0.5em;
}

.train-driver {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.train-driver img {
  max-height: 20px;
  vertical-align: text-bottom;
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

.train-general {
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.general-stops {
  font-size: 0.8em;
}

.general-top-bar {
  display: flex;
  justify-content: space-between;
  gap: 0.5em;
}

.top-bar-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.25em;
}

.general-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.25em;
}

.general-stats {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;

  & > div {
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  img {
    width: 1.5em;
  }
}

.general-timetable {
  display: flex;
  align-items: center;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;

  gap: 0.25em;

  img {
    height: 15px;
  }
}

.status-timetable-progress {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;
  padding: 0.5em 0;
}

.progress-distance {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

.timetable-warnings {
  display: flex;
  gap: 0.25em;
}

@include smallScreen() {
  .train-info {
    grid-template-columns: 1fr;
    gap: 1em 0;
  }
}
</style>
