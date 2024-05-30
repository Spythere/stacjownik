<template>
  <section class="scenery-timetable">
    <div class="timetable-header">
      <h3>
        <img src="/images/icon-timetable.svg" alt="icon-timetable" />
        <span>{{ $t('scenery.timetables') }}</span>

        <span>
          <span class="text--primary">{{ onlineScenery?.scheduledTrainCount.all ?? 0 }}</span>
          <span> / </span>
          <span class="text--grayed">
            {{ onlineScenery?.scheduledTrainCount.confirmed ?? 0 }}
          </span>
        </span>

        <span class="header_links" v-if="station">
          <a :href="tabliceZbiorczeHref" target="_blank" :title="$t('scenery.tablice-link')">
            <img src="/images/icon-tablice.ico" alt="icon-tablice" />
          </a>
        </span>
      </h3>

      <div class="timetable-checkpoints" v-if="station?.generalInfo?.checkpoints">
        <span v-for="(cp, i) in station.generalInfo.checkpoints" :key="i">
          {{ (i > 0 && '&bull;') || '' }}

          <button
            :key="cp"
            class="checkpoint_item"
            :class="{ current: chosenCheckpoint === cp }"
            @click="setCheckpoint(cp)"
          >
            {{ cp }}
          </button>
        </span>
      </div>
    </div>

    <div class="timetable-list">
      <transition-group name="list-anim">
        <div
          v-if="apiStore.dataStatuses.connection == 0 && sceneryTimetables.length == 0"
          style="padding-bottom: 5em"
          key="list-loading"
        >
          <Loading />
        </div>

        <span
          class="timetable-item empty"
          v-else-if="sceneryTimetables.length == 0 && !onlineScenery"
          key="list-offline"
        >
          {{ $t('scenery.offline') }}
        </span>

        <div
          class="timetable-item empty"
          v-else-if="sceneryTimetables.length == 0"
          key="list-no-timetables"
        >
          {{ $t('scenery.no-timetables') }}
        </div>

        <div
          class="timetable-item"
          v-else
          v-for="(row, i) in sceneryTimetables"
          :key="row.train.id + i"
          tabindex="0"
          @click.prevent.stop="selectModalTrain(row.train, $event.currentTarget)"
          @keydown.enter.prevent="selectModalTrain(row.train, $event.currentTarget)"
        >
          <span class="timetable-general">
            <span class="general-info">
              <span class="info-number">
                <strong>{{ row.train.timetableData!.category }}</strong>
                {{ row.train.trainNo }}

                <span v-if="row.checkpointStop.comments" :title="row.checkpointStop.comments">
                  <img src="/images/icon-warning.svg" />
                </span>
              </span>
              &nbsp;|&nbsp;
              <span>
                {{ row.train.driverName }}
              </span>

              <div class="info-route">
                <strong>{{ row.train.timetableData!.route.replace('|', ' - ') }}</strong>
              </div>

              <ScheduledTrainStatus :sceneryTimetableRow="row" />
            </span>
          </span>

          <span class="timetable-schedule">
            <span class="schedule-arrival">
              <span class="arrival-time begins" v-if="row.checkpointStop.beginsHere">
                {{ $t('timetables.begins') }}
              </span>

              <span class="arrival-time" v-else>
                <div v-if="row.checkpointStop.arrivalDelay == 0">
                  <span>{{ timestampToString(row.checkpointStop.arrivalTimestamp) }}</span>
                </div>
                <div v-else>
                  <div>
                    <s style="margin-right: 0.2em" class="text--grayed">{{
                      timestampToString(row.checkpointStop.arrivalTimestamp)
                    }}</s>
                  </div>

                  <span>
                    {{ timestampToString(row.checkpointStop.arrivalRealTimestamp) }}
                    ({{ row.checkpointStop.arrivalDelay > 0 ? '+' : ''
                    }}{{ row.checkpointStop.arrivalDelay }})
                  </span>
                </div>
              </span>
            </span>

            <span class="schedule-stop">
              <span class="stop-connection">
                {{ row.arrivingLine }}
              </span>

              <span class="stop-time">
                {{ row.checkpointStop.stopTime || '' }}
                {{ row.checkpointStop.stopTime ? row.checkpointStop.stopType || 'pt' : '' }}
              </span>

              <span class="stop-connection">
                {{ row.departureLine }}
              </span>
            </span>

            <span class="schedule-departure">
              <span class="departure-time terminates" v-if="row.checkpointStop.terminatesHere">
                {{ $t('timetables.terminates') }}
              </span>

              <span class="departure-time" v-else>
                <div v-if="row.checkpointStop.departureDelay == 0">
                  <span>{{ timestampToString(row.checkpointStop.departureTimestamp) }}</span>
                </div>
                <div v-else>
                  <div>
                    <s style="margin-right: 0.2em" class="text--grayed">{{
                      timestampToString(row.checkpointStop.departureTimestamp)
                    }}</s>
                  </div>

                  <span>
                    {{ timestampToString(row.checkpointStop.departureRealTimestamp) }}
                    ({{ row.checkpointStop.departureDelay > 0 ? '+' : ''
                    }}{{ row.checkpointStop.departureDelay }})
                  </span>
                </div>
              </span>
            </span>
          </span>
        </div>
      </transition-group>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRoute } from 'vue-router';

import Loading from '../Global/Loading.vue';
import dateMixin from '../../mixins/dateMixin';
import routerMixin from '../../mixins/routerMixin';
import { useMainStore } from '../../store/mainStore';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import ScheduledTrainStatus from './ScheduledTrainStatus.vue';
import { useApiStore } from '../../store/apiStore';
import { ActiveScenery, Station } from '../../typings/common';
import { SceneryTimetableRow } from './typings';
import { getTrainStopStatus, stopStatusPriority } from './utils';

export default defineComponent({
  name: 'SceneryTimetable',

  components: { Loading, ScheduledTrainStatus },

  mixins: [dateMixin, routerMixin, modalTrainMixin],

  props: {
    station: {
      type: Object as PropType<Station>
    },
    onlineScenery: {
      type: Object as PropType<ActiveScenery>
    }
  },

  data: () => ({
    listOpen: false
  }),

  activated() {
    this.loadSelectedOption();
  },

  setup(props) {
    const route = useRoute();
    const currentURL = computed(() => `${location.origin}${route.fullPath}`);

    const apiStore = useApiStore();
    const mainStore = useMainStore();

    const chosenCheckpoint = ref(
      props.station?.generalInfo?.checkpoints[0] ?? props.station?.name ?? ''
    );

    return {
      currentURL,
      chosenCheckpoint,
      apiStore,
      mainStore
    };
  },

  computed: {
    tabliceZbiorczeHref() {
      let url = `https://tablice-td2.web.app/?station=${this.station!.name}`;
      if (this.chosenCheckpoint) url += `&checkpoint=${this.chosenCheckpoint}`;

      return url;
    },

    sceneryTimetables(): SceneryTimetableRow[] {
      if (!this.station) return [];
      if (!this.onlineScenery) return [];

      return this.onlineScenery.scheduledTrains
        .filter(
          (ct) =>
            ct.train.region == this.mainStore.region.id &&
            this.chosenCheckpoint &&
            ct.checkpointStop.stopNameRAW.toLowerCase() == this.chosenCheckpoint.toLowerCase()
        )
        .map((ct) => {
          const trainStopStatus = getTrainStopStatus(
            ct.checkpointStop,
            ct.train.currentStationName,
            this.station!.name
          );

          const trainStopIndex =
            ct.train.timetableData?.followingStops.findIndex(
              (stop) => stop.stopName == ct.checkpointStop.stopName
            ) ?? -1;

          let prevStationName = '',
            nextStationName = '';

          let departureLine: string | null = null;
          let arrivingLine: string | null = null;

          let prevDepartureLine: string | null = null,
            nextArrivalLine: string | null = null;

          if (trainStopIndex > -1 && ct.train.timetableData?.followingStops !== undefined) {
            for (let i = trainStopIndex; i >= 0; i--) {
              const stop = ct.train.timetableData.followingStops[i];

              if (
                /strong|podg\.|pe\./g.test(stop.stopName) &&
                !prevStationName &&
                i <= trainStopIndex - 1
              )
                prevStationName = stop.stopNameRAW.replace(/,.*/g, '');

              if (
                stop.arrivalLine != null &&
                !arrivingLine &&
                !/-|_|it|sbl/gi.test(stop.arrivalLine)
              ) {
                arrivingLine = stop.arrivalLine;
                prevDepartureLine =
                  ct.train.timetableData.followingStops[i - 1]?.departureLine || null;
              }
            }

            for (let i = trainStopIndex; i < ct.train.timetableData.followingStops.length; i++) {
              const stop = ct.train.timetableData.followingStops[i];

              if (
                /strong|podg\.|pe\./g.test(stop.stopName) &&
                !nextStationName &&
                i > trainStopIndex
              )
                nextStationName = stop.stopNameRAW.replace(/,.*/g, '');

              if (
                stop.departureLine &&
                !departureLine &&
                !/-|_|it|sbl/gi.test(stop.departureLine)
              ) {
                departureLine = stop.departureLine;
                nextArrivalLine = ct.train.timetableData.followingStops[i + 1]?.arrivalLine || null;
              }
            }
          }

          return {
            checkpointStop: ct.checkpointStop,
            train: ct.train,
            prevDepartureLine,
            nextArrivalLine,
            departureLine,
            arrivingLine,
            prevStationName,
            nextStationName,
            status: trainStopStatus
          };
        })
        .sort((a, b) => {
          if (stopStatusPriority.indexOf(a.status) - stopStatusPriority.indexOf(b.status) < 0)
            return -1;

          if (stopStatusPriority.indexOf(a.status) - stopStatusPriority.indexOf(b.status) > 0)
            return 1;

          if (a.checkpointStop.arrivalTimestamp > b.checkpointStop.arrivalTimestamp) return 1;
          if (a.checkpointStop.arrivalTimestamp < b.checkpointStop.arrivalTimestamp) return -1;

          return a.checkpointStop.departureTimestamp > b.checkpointStop.departureTimestamp ? 1 : -1;
        });
    }
  },

  methods: {
    loadSelectedOption() {
      if (!this.station) return;

      this.chosenCheckpoint = this.station.generalInfo?.checkpoints[0] ?? this.station.name;
    },

    setCheckpoint(cp: string) {
      this.chosenCheckpoint = cp;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';
@import '../../styles/animations.scss';

.scenery-timetable {
  height: 100%;
  overflow-y: scroll;
  padding: 0 0.5em;
}

.timetable-header {
  position: sticky;
  top: 0;
  z-index: 99;

  background-color: #181818;

  padding: 0.5em;

  img {
    width: 25px;
    vertical-align: middle;
  }

  h3 {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;

    gap: 0.5em;
    font-size: 1.3em;
  }
}

.header_links {
  display: flex;
  gap: 0.5em;
  margin-left: 0.5em;
}

.timetable {
  &-count {
    margin-left: 0.5em;
  }

  &-item {
    margin: 0.5em auto;
    padding: 0.5em;
    max-width: 1100px;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.2em 0.5em;

    overflow: hidden;

    background: #353535;

    cursor: pointer;
    z-index: 10;

    &.empty {
      padding: 1rem;
      font-size: 1.2em;
      color: #bbb;
    }
  }

  &-general {
    display: flex;
    align-items: center;
    justify-content: space-between;

    text-align: left;
  }

  &-schedule {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.2em;
    align-items: center;

    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
}

.timetable-list {
  position: relative;
}

.timetable-checkpoints {
  display: flex;
  justify-content: center;

  flex-wrap: wrap;
  font-size: 1.1em;

  margin-top: 0.5em;

  button.checkpoint_item {
    color: #aaa;
    display: inline;
  }

  .checkpoint_item.current {
    font-weight: bold;
    color: $accentCol;
  }
}

.general-info {
  display: flex;
  flex-wrap: wrap;

  .info-number {
    color: $accentCol;
  }

  .info-route {
    width: 100%;
  }

  img {
    width: 1.1em;
  }
}

.schedule {
  &-arrival,
  &-departure {
    font-size: 1.15em;
  }

  &-stop {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5em;
    align-items: end;

    .stop-connection {
      font-size: 0.95em;
    }

    .stop-time {
      position: relative;
      inline-size: max-content;
      align-self: center;
      font-size: 0.9em;

      color: $accentCol;

      &::after {
        content: '\027F6';
        display: block;
        font-size: 2.2em;
        line-height: 0.65em;
      }
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.85em;
}

@include smallScreen {
  .timetable-item {
    grid-template-columns: 1fr;
  }
}
</style>
