<template>
  <div class="train-info">
    <section class="train-general">
      <div class="general-info">
        <b class="warning-timeout" v-if="train.isTimeout" :title="$t('trains.timeout')">?</b>
        <span class="timetable-id" v-if="train.timetableData">
          #{{ train.timetableData.timetableId }}
        </span>

        <span
          class="timetable-warnings"
          v-if="train.timetableData?.TWR || train.timetableData?.SKR"
        >
          <span class="train-badge twr" v-if="train.timetableData?.TWR" :title="$t('general.TWR')">
            TWR
          </span>
          <span class="train-badge skr" v-if="train.timetableData?.SKR" :title="$t('general.SKR')">
            SKR
          </span>
        </span>

        <strong>
          <span v-if="train.timetableData" class="text--primary"
            >{{ train.timetableData.category }}&nbsp;</span
          >
          <span class="train-number">{{ train.trainNo }}</span>
        </strong>
        <span>&bull;</span>
        <b
          class="level-badge driver"
          :style="calculateExpStyle(train.driverLevel, train.isSupporter)"
        >
          {{ train.driverLevel < 2 ? 'L' : `${train.driverLevel}` }}
        </b>

        <div class="train-driver">
          <b
            v-if="apiStore.donatorsData.includes(train.driverName)"
            data-popup-key="DonatorPopUp"
            :data-popup-content="$t('donations.driver-message')"
          >
            {{ train.driverName }}
            <img src="/images/icon-diamond.svg" alt="donator diamond icon" />
          </b>

          <span v-else>{{ train.driverName }}</span>

          <button
            class="btn--image btn--action btn-timetable"
            @click="navigateToJournal"
            v-if="extended"
          >
            <img src="/images/icon-train.svg" alt="" />
            {{ $t('trains.journal-button') }}
          </button>
        </div>
      </div>

      <div class="general-timetable" v-if="train.timetableData">
        <strong>{{ train.timetableData.route.replace('|', ' - ') }}</strong>
        <span
          v-if="getSceneriesWithComments(train.timetableData).length > 0"
          data-popup-key="TrainCommentsPopUp"
          :data-popup-content="`${$t('trains.timetable-comments')} (${getSceneriesWithComments(
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
          <span v-html="displayStopList(train.timetableData.followingStops)"></span>
        </span>
      </div>

      <div class="general-status">
        <div class="timetable-progress" v-if="train.timetableData">
          <ProgressBar :progressPercent="confirmedPercentage(train.timetableData.followingStops)" />

          <span class="progress-distance">
            &nbsp; {{ currentDistance(train.timetableData.followingStops) }} km /
            <span class="text--primary"> {{ train.timetableData.routeDistance }} km </span>
            |
            <span v-html="currentDelay(train.timetableData.followingStops)"></span>
          </span>
        </div>

        <div class="status-badges">
          <div v-if="!train.currentStationHash" class="train-badge offline">
            <img src="/images/icon-offline.svg" alt="" />
            {{ $t('trains.scenery-offline') }}
          </div>

          <div v-if="!train.online" class="train-badge offline">
            <img src="/images/icon-offline.svg" alt="" />
            Offline {{ lastSeenMessage(train.lastSeen) }}
          </div>
        </div>
      </div>

      <div class="driver_position text--grayed" style="margin-top: 0.25em">
        {{ displayTrainPosition(train) }}
      </div>
    </section>

    <section class="train-stats">
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
import Train from '../../scripts/interfaces/Train';
import ProgressBar from '../Global/ProgressBar.vue';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';
import StockList from '../Global/StockList.vue';
import { usePopupStore } from '../../store/popupStore';
import modalTrainMixin from '../../mixins/modalTrainMixin';

export default defineComponent({
  mixins: [trainInfoMixin, styleMixin, modalTrainMixin],
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
      apiStore: useApiStore(),
      popupStore: usePopupStore()
    };
  },

  methods: {
    navigateToJournal() {
      this.$router.push({
        path: '/journal/timetables',
        query: {
          'search-driver': this.train.driverName
        }
      });

      this.closeModal();
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

  padding: 1em;

  background-color: #1a1a1a;
  gap: 0.5em;
}

.train-driver img {
  max-height: 20px;
  vertical-align: text-bottom;
}

.btn-timetable {
  display: inline-block;
  padding: 0.25em;
  margin-left: 0.5em;
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

.general-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.25em;
  margin-right: 1.5em;
}
.general-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.25em;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;

  gap: 0.25em;

  img {
    height: 15px;
  }
}

.general-timetable {
  display: flex;
  align-items: center;
}

.timetable-warnings {
  display: flex;
  gap: 0.25em;
}

.timetable-progress {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.progress-distance {
  margin-right: 0.25em;
}

@include smallScreen() {
  .train-info {
    grid-template-columns: 1fr;
    gap: 1em 0;
    text-align: center;
  }

  .general-info,
  .general-status,
  .general-timetable {
    justify-content: center;
  }

  .timetable-progress {
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
