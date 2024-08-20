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
          <a :href="pragotronHref" target="_blank" :title="$t('scenery.pragotron-link')">
            <img src="/images/icon-pragotron.svg" alt="icon-pragotron" />
          </a>

          <a :href="tabliceZbiorczeHref" target="_blank" :title="$t('scenery.tablice-link')">
            <img src="/images/icon-tablice.ico" alt="icon-tablice" />
          </a>
        </span>
      </h3>

      <div class="timetable-checkpoints" v-if="station?.generalInfo?.checkpoints">
        <template v-for="(ch, i) in station.generalInfo.checkpoints" :key="i">
          <template v-if="i > 0">&bull;</template>
          <router-link
            class="checkpoint-item"
            :class="{ current: chosenCheckpoint === ch }"
            :to="`/scenery?station=${station.name}&checkpoint=${ch}`"
            >{{ ch }}</router-link
          >
        </template>
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
              <div class="info-train">
                <b
                  data-tooltip-type="BaseTooltip"
                  :data-tooltip-content="getCategoryExplanation(row.train.timetableData!.category)"
                  class="text--primary tooltip-help"
                >
                  {{ row.train.timetableData!.category }}
                </b>
                <span>&nbsp;</span>
                <b>{{ row.train.trainNo }}</b>
                <span>&nbsp;&bull;&nbsp;</span>
                <span>{{ row.train.driverName }}</span>
                <span
                  v-if="row.checkpointStop.comments"
                  data-tooltip-type="BaseTooltip"
                  :data-tooltip-content="row.checkpointStop.comments"
                >
                  <img src="/images/icon-warning.svg" />
                </span>
              </div>

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
import { computed, defineComponent, PropType, ref, watch } from 'vue';
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
import trainCategoryMixin from '../../mixins/trainCategoryMixin';

export default defineComponent({
  name: 'SceneryTimetable',

  components: { Loading, ScheduledTrainStatus },

  mixins: [dateMixin, routerMixin, modalTrainMixin, trainCategoryMixin],

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

  watch: {
    currentURL() {
      this.loadSelectedOption();
    }
  },

  setup(props) {
    const route = useRoute();
    const currentURL = computed(() => `${location.origin}${route.fullPath}`);

    const apiStore = useApiStore();
    const mainStore = useMainStore();

    const chosenCheckpoint = ref(
      props.station?.generalInfo?.checkpoints[0] ??
        props.station?.name ??
        route.query['station']?.toString() ??
        ''
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

    pragotronHref() {
      let url = `https://pragotron-td2.web.app/board?name=${this.station!.name}&region=${this.store.region.id}`;
      if (this.chosenCheckpoint) url += `&checkpoint=${this.chosenCheckpoint}`;

      return url;
    },

    sceneryTimetables(): SceneryTimetableRow[] {
      if (!this.onlineScenery) return [];

      const sceneryName = this.$route.query['station']?.toString().replace(/_/g, ' ') ?? '';

      return this.onlineScenery.scheduledTrains
        .filter(
          (ct) =>
            // ct.timetablePathElement.stationName == sceneryName &&
            ct.train.region == this.mainStore.region.id &&
            this.chosenCheckpoint &&
            ct.checkpointStop.stopNameRAW.toLowerCase() == this.chosenCheckpoint.toLowerCase()
        )
        .map((ct) => {
          const trainStopStatus = getTrainStopStatus(
            ct.checkpointStop,
            ct.train.currentStationName,
            sceneryName
          );

          return {
            checkpointStop: ct.checkpointStop,
            train: ct.train,
            prevDepartureLine: ct.previousSceneryElement?.departureRouteExt ?? null,
            nextArrivalLine: ct.nextSceneryElement?.arrivalRouteExt ?? null,
            departureLine: ct.timetablePathElement.departureRouteExt ?? null,
            arrivingLine: ct.timetablePathElement.arrivalRouteExt ?? null,
            prevStationName: ct.previousSceneryElement?.stationName ?? null,
            nextStationName: ct.nextSceneryElement?.stationName ?? null,
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

      if (!this.station.generalInfo) {
        this.chosenCheckpoint = this.station.name;
        return;
      }

      const queryCheckpoint = this.$route.query['checkpoint']?.toString();

      this.chosenCheckpoint =
        this.station.generalInfo.checkpoints.find(
          (ch) => ch.toLocaleLowerCase() === queryCheckpoint?.toLocaleLowerCase()
        ) ??
        this.station.generalInfo.checkpoints[0] ??
        this.station.name;
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

.timetable-checkpoints {
  display: flex;
  justify-content: center;
  gap: 0.5em;

  flex-wrap: wrap;
  font-size: 1.1em;

  margin-top: 0.5em;
}

.checkpoint-item {
  color: #aaa;
  display: inline;

  &:hover {
    color: white;
  }

  &.current {
    font-weight: bold;
    color: $accentCol;
  }
}

.timetable-list {
  position: relative;
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
    height: 0.9em;
    vertical-align: middle;
    margin: 0 0.25em;
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
