<template>
  <div class="scenery-timetable">
    <h3 class="timetable-header">
      <img :src="icons.timetable" alt="icon-timetable" />&nbsp;
      <span>{{ $t('scenery.timetables') }}</span>

      <span class="timetable-count">
        <span class="text--primary">{{ station.onlineInfo?.scheduledTrains?.length || '0' }}</span>
        /
        <span class="text--grayed">
          {{ station.onlineInfo?.scheduledTrains?.filter((train) => train.stopInfo.confirmed).length || '0' }}
        </span>
      </span>

      <a :href="currentURL + '&timetable_only=1'" v-if="!timetableOnly" target="_blank" class="timetable-only">
        <img :src="viewIcon" alt="icon-view" :title="$t('timetables.timetable-only')" />
      </a>
    </h3>

    <div class="checkpoints" v-if="station && station.generalInfo?.checkpoints">
      <button
        v-for="cp in station.generalInfo.checkpoints"
        :key="cp.checkpointName"
        class="checkpoint_item btn btn--text"
        :class="{ current: selectedCheckpoint === cp.checkpointName }"
        @click="selectCheckpoint(cp)"
      >
        {{ cp.checkpointName }}
      </button>
    </div>

    <transition name="scenery-timetable-list-anim" mode="out-in">
      <div :key="trainsDataStatus + selectedCheckpoint">
        <span class="timetable-item loading" v-if="trainsDataStatus == 0 && computedScheduledTrains.length == 0">
          {{ $t('app.loading') }}
        </span>

        <span class="timetable-item empty" v-else-if="computedScheduledTrains.length == 0">
          {{ $t('scenery.no-timetables') }}
        </span>

        <div
          class="timetable-item"
          v-for="(scheduledTrain, i) in computedScheduledTrains"
          :key="i + 1"
          tabindex="0"
          @click="navigateToTrain(scheduledTrain.trainNo)"
          @keydown.enter="navigateToTrain(scheduledTrain.trainNo)"
        >
          <span class="timetable-general">
            <span class="general-info">
              <span class="info-number">
                <strong>{{ scheduledTrain.category }}</strong>
                {{ scheduledTrain.trainNo }}

                <span class="g-tooltip" v-if="scheduledTrain.stopInfo.comments">
                  <img :src="icons.warning" />
                  <span class="content" v-html="scheduledTrain.stopInfo.comments"> </span>
                </span>
              </span>
              |
              <span style="color: white">
                {{ scheduledTrain.driverName }}
              </span>
              |
              <span class="general-status">
                <span :class="scheduledTrain.stopStatus">
                  {{ $t(`timetables.${scheduledTrain.stopStatus}`) }}
                  <span v-if="scheduledTrain.stopStatus == 'arriving'"> {{ scheduledTrain.prevStationName }}</span>
                  <span v-if="scheduledTrain.stopStatus.startsWith('departed')">{{
                    scheduledTrain.nextStationName
                  }}</span>
                </span>
              </span>

              <div class="info-route">
                <strong>{{ scheduledTrain.beginsAt }} - {{ scheduledTrain.terminatesAt }}</strong>
              </div>
            </span>
          </span>

          <span class="timetable-schedule">
            <span class="schedule-arrival">
              <span class="arrival-time begins" v-if="scheduledTrain.stopInfo.beginsHere">
                {{ $t('timetables.begins') }}
              </span>

              <span class="arrival-time" v-else>
                <div v-if="scheduledTrain.stopInfo.arrivalDelay == 0">
                  <span>{{ timestampToString(scheduledTrain.stopInfo.arrivalTimestamp) }}</span>
                </div>
                <div v-else>
                  <s style="margin-right: 0.2em;" class="text--grayed">{{
                    timestampToString(scheduledTrain.stopInfo.arrivalTimestamp)
                  }}</s>
                  <span>
                    {{ timestampToString(scheduledTrain.stopInfo.arrivalRealTimestamp) }}
                    ({{ scheduledTrain.stopInfo.arrivalDelay > 0 ? '+' : ''
                    }}{{ scheduledTrain.stopInfo.arrivalDelay }})
                  </span>
                </div>
              </span>
            </span>

            <span class="schedule-stop">
              <span class="stop-time" v-if="scheduledTrain.stopInfo.stopTime">
                {{ scheduledTrain.stopInfo.stopTime }}
                {{ scheduledTrain.stopInfo.stopType || 'pt' }}
              </span>
              <span class="stop-arrow arrow"></span>
            </span>

            <span class="schedule-departure">
              <span class="departure-time terminates" v-if="scheduledTrain.stopInfo.terminatesHere">
                {{ $t('timetables.terminates') }}
              </span>

              <span class="departure-time" v-else>
                <div v-if="scheduledTrain.stopInfo.departureDelay == 0">
                  <span>{{ timestampToString(scheduledTrain.stopInfo.departureTimestamp) }}</span>
                </div>
                <div v-else>
                  <s style="margin-right: 0.2em;" class="text--grayed">{{
                    timestampToString(scheduledTrain.stopInfo.departureTimestamp)
                  }}</s>

                  <span>
                    {{ timestampToString(scheduledTrain.stopInfo.departureRealTimestamp) }}
                    ({{ scheduledTrain.stopInfo.departureDelay > 0 ? '+' : ''
                    }}{{ scheduledTrain.stopInfo.departureDelay }})
                  </span>
                </div>
              </span>
            </span>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Station from '@/scripts/interfaces/Station';
import SelectBox from '../Global/SelectBox.vue';
import { computed, defineComponent, ref } from '@vue/runtime-core';
import { useRoute } from 'vue-router';
import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';
import { DataStatus } from '@/scripts/enums/DataStatus';
import { ComputedRef } from 'vue';
import dateMixin from '@/mixins/dateMixin';
import TrainStop from '@/scripts/interfaces/TrainStop';

export default defineComponent({
  components: { SelectBox },

  mixins: [dateMixin],

  props: {
    station: {
      type: Object as () => Station,
      required: true,
    },
    timetableOnly: {
      type: Boolean,
    },
  },

  data: () => ({
    viewIcon: require('@/assets/icon-view.svg'),
    listOpen: false,
    icons: {
      warning: require('@/assets/icon-warning.svg'),
      timetable: require('@/assets/icon-timetable.svg'),
    },
  }),

  setup(props) {
    const route = useRoute();
    const currentURL = computed(() => `${location.origin}${route.fullPath}`);

    const store = useStore();

    const trainsDataStatus = computed(() => store.getters[GETTERS.trainsDataStatus]) as ComputedRef<DataStatus>;

    const selectedCheckpoint = ref(
      props.station?.generalInfo?.checkpoints?.length == 0
        ? ''
        : props.station?.generalInfo?.checkpoints[0].checkpointName || ''
    );

    const computedScheduledTrains = computed(() => {
      if (!props.station) return [];

      let scheduledTrains =
        props.station.generalInfo?.checkpoints.find((cp) => cp.checkpointName === selectedCheckpoint.value)
          ?.scheduledTrains ||
        props.station.onlineInfo?.scheduledTrains ||
        [];

      return (
        scheduledTrains?.sort((a, b) => {
          if (a.stopStatusID > b.stopStatusID) return 1;
          else if (a.stopStatusID < b.stopStatusID) return -1;

          if (a.stopInfo.arrivalTimestamp > b.stopInfo.arrivalTimestamp) return 1;
          else if (a.stopInfo.arrivalTimestamp < b.stopInfo.arrivalTimestamp) return -1;

          return a.stopInfo.departureTimestamp > b.stopInfo.departureTimestamp ? 1 : -1;
        }) || []
      );
    });

    return {
      currentURL,
      selectedCheckpoint,
      computedScheduledTrains,
      trainsDataStatus,
    };
  },

  methods: {
    loadSelectedOption() {
      if (!this.station) return;
      if (!this.station.generalInfo) return;
      if (!this.station.generalInfo.checkpoints) return;
      if (this.station.generalInfo.checkpoints.length == 0) return;

      if (this.selectedCheckpoint != '') return;

      this.selectedCheckpoint = this.station.generalInfo.checkpoints[0].checkpointName;
    },

    selectCheckpoint(cp: { checkpointName: string }) {
      this.selectedCheckpoint = cp.checkpointName;
    },

    navigateToTrain(trainNo: number) {
      this.$router.push({
        name: 'TrainsView',
        query: { train: trainNo.toString() },
      });
    },
  },

  mounted() {
    this.loadSelectedOption();
  },

  activated() {
    this.loadSelectedOption();
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';

h3.timetable-header {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  font-size: 1.5em;

  a {
    display: flex;
  }

  img {
    width: 1.2em;
  }
}

.timetable-only {
  margin-left: 0.5em;

  img {
    width: 1.1em;
  }

  &:focus {
    outline: 1px solid white;
  }
}

.scenery-timetable-list-anim {
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

.timetable {
  &-count {
    margin-left: 0.5em;
  }

  &-item {
    margin: 1em auto;
    padding: 0 0.5em;
    max-width: 1100px;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0 0.5em;

    background: $bgCol;

    cursor: pointer;
    z-index: 10;

    &.loading,
    &.empty {
      padding: 1rem;
      font-size: 1.2em;
    }

    &.empty {
      color: #bbb;
    }
  }

  &-general {
    padding: 0.5rem 0;
    border-radius: 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    text-align: left;
  }

  &-schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
    font-size: 1.15em;
  }
}

.checkpoints {
  display: flex;
  justify-content: center;

  flex-wrap: wrap;

  font-size: 1.2em;

  .checkpoint_item {
    &.current {
      font-weight: bold;
      color: $accentCol;
    }

    &:not(:last-child)::after {
      margin: 0 0.5em;
      content: '•';
      color: white;
    }
  }
}

.arrow {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 2px;
  margin-left: 50px;

  position: relative;

  transform: rotate(-45deg);

  &::before {
    content: '';
    position: absolute;
    display: block;
    width: 55px;
    height: 3px;
    top: 4px;
    left: 4px;

    transform: translate(-100%, -1px) rotate(45deg);
    transform-origin: right bottom;

    background: white;
  }
}

.general-info {
  .info-number {
    color: $accentCol;
  }

  .info-route {
    margin-top: 0.5em;
  }

  .g-tooltip > .content {
    z-index: 100;
    color: white;
  }

  img {
    width: 1.1em;
  }
}

.general-status {
  text-align: right;

  span.arriving {
    color: #ccc;
  }

  span.departed {
    color: lime;
    font-weight: bold;

    &-away {
      font-weight: bold;
      color: #5ecc5e;
    }
  }

  span.stopped {
    color: #ffa600;
    font-weight: bold;
  }

  span.online {
    color: gold;
  }

  span.terminated {
    color: salmon;
    font-weight: bold;
  }
}

.schedule {
  &-arrival,
  &-stop,
  &-departure {
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0 0.3rem;
  }

  &-stop {
    position: relative;
    display: flex;
    flex-direction: column;

    .stop-time {
      font-size: 0.85em;
      // position: absolute;
      transform: translateY(-0.25em);
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.85em;
}

@include smallScreen() {
  .timetable {
    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      font-size: 1.2em;
    }

    &-general {
      width: 100%;
    }

    &-schedule {
      width: 100%;
      margin: 0.5em 0;
    }
  }
}
</style>
