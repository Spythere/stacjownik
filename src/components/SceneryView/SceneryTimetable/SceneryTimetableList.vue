<template>
  <div class="scenery-timetable-list">
    <!-- Checkpoints derived from station data -->
    <div class="timetable-checkpoints" v-if="station?.generalInfo?.checkpoints">
      <template v-for="(ch, i) in station.generalInfo.checkpoints" :key="i">
        <template v-if="i > 0">&bull;</template>
        <router-link
          class="checkpoint-item"
          :class="{ current: chosenCheckpoint === ch }"
          :to="`/scenery?station=${station.name}&checkpoint=${ch}`"
        >
          {{ ch }}
        </router-link>
      </template>
    </div>

    <!-- Missing checkpoints if scenery is not in database -->
    <div class="timetable-checkpoints" v-else-if="onlineScenery">
      <template v-for="(ch, i) in onlineScenery.missingCheckpoints" :key="i">
        <template v-if="i > 0">&bull;</template>
        <router-link
          class="checkpoint-item"
          :class="{ current: chosenCheckpoint === ch }"
          :to="`/scenery?station=${onlineScenery.name}&checkpoint=${ch}`"
        >
          {{ ch }}
        </router-link>
      </template>
    </div>

    <div class="list-container">
      <transition-group name="list-anim" tag="ul">
        <li
          v-if="apiStore.dataStatuses.connection == 0 && sceneryTimetables.length == 0"
          style="padding-bottom: 5em"
          key="list-loading"
        >
          <Loading />
        </li>

        <li
          class="timetable-item empty"
          v-else-if="sceneryTimetables.length == 0 && !onlineScenery"
          key="list-offline"
        >
          {{ $t('scenery.offline') }}
        </li>

        <li
          class="timetable-item empty"
          v-else-if="sceneryTimetables.length == 0"
          key="list-no-timetables"
        >
          {{ $t('scenery.no-timetables') }}
        </li>

        <li
          v-else
          v-for="(row, i) in sceneryTimetables"
          :key="row.train.id"
        >
          <!-- {{ row.train.id + row.checkpointStop.arrivalTimestamp.toString() }} -->
          <router-link class="timetable-item-link" tabindex="0" :to="row.train.driverRouteLocation">
            <span class="item-general">
              <span class="general-info">
                <div class="info-train">
                  <!-- Cargo warnings & details badges -->
                  <span
                    class="train-badge twr"
                    v-if="row.train.timetableData!.twr"
                    data-tooltip-type="BaseTooltip"
                    :data-tooltip-content="$t('warnings.TWR')"
                  >
                    TWR
                  </span>

                  <span
                    class="train-badge tn"
                    v-if="row.train.timetableData!.hasDangerousCargo"
                    data-tooltip-type="BaseTooltip"
                    :data-tooltip-content="$t('warnings.TN')"
                  >
                    TN
                  </span>

                  <span
                    class="train-badge pn"
                    v-if="row.train.timetableData!.hasExtraDeliveries"
                    data-tooltip-type="BaseTooltip"
                    :data-tooltip-content="$t('warnings.PN')"
                  >
                    PN
                  </span>

                  <!-- Train info -->
                  <span
                    data-tooltip-type="TrainInfoTooltip"
                    :data-tooltip-content="row.train.id"
                    class="tooltip-help"
                  >
                    <b class="text--primary">
                      {{ row.train.timetableData!.category }}
                    </b>

                    <b>&nbsp;{{ row.train.trainNo }}</b>
                    &bull;
                    {{ row.train.driverName }}

                    <i
                      class="fa-solid fa-user-slash"
                      style="color: salmon"
                      v-if="!row.train.online && row.train.lastSeen <= Date.now() - 60000"
                    ></i>
                  </span>

                  <!-- Train stop comments -->
                  <span
                    v-if="row.checkpointStop.comments"
                    class="stop-comments-icon"
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

            <span class="item-schedule">
              <span class="schedule-arrival">
                <span class="arrival-time begins" v-if="row.checkpointStop.beginsHere">
                  {{ $t('timetables.begins') }}
                </span>

                <span class="arrival-time" v-else>
                  <div v-if="row.checkpointStop.arrivalDelay == 0">
                    <span>{{ timestampToTimeString(row.checkpointStop.arrivalTimestamp) }}</span>
                  </div>
                  <div v-else>
                    <div>
                      <s style="margin-right: 0.2em" class="text--grayed">{{
                        timestampToTimeString(row.checkpointStop.arrivalTimestamp)
                      }}</s>
                    </div>

                    <span>
                      {{ timestampToTimeString(row.checkpointStop.arrivalRealTimestamp) }}
                      ({{ row.checkpointStop.arrivalDelay > 0 ? '+' : ''
                      }}{{ row.checkpointStop.arrivalDelay }})
                    </span>
                  </div>
                </span>
              </span>

              <span class="schedule-stop">
                <span class="stop-connection">
                  {{ row.currentElement.arrivalRouteExt }}
                </span>

                <span class="stop-time">
                  {{ row.checkpointStop.stopTime || '' }}
                  {{ row.checkpointStop.stopTime ? row.checkpointStop.stopType || 'pt' : '' }}
                </span>

                <span class="stop-connection">
                  {{ row.currentElement.departureRouteExt }}
                </span>
              </span>

              <span class="schedule-departure">
                <span class="departure-time terminates" v-if="row.checkpointStop.terminatesHere">
                  {{ $t('timetables.terminates') }}
                </span>

                <span class="departure-time" v-else>
                  <div v-if="row.checkpointStop.departureDelay == 0">
                    <span>{{ timestampToTimeString(row.checkpointStop.departureTimestamp) }}</span>
                  </div>
                  <div v-else>
                    <div>
                      <s style="margin-right: 0.2em" class="text--grayed">{{
                        timestampToTimeString(row.checkpointStop.departureTimestamp)
                      }}</s>
                    </div>

                    <span>
                      {{ timestampToTimeString(row.checkpointStop.departureRealTimestamp) }}
                      ({{ row.checkpointStop.departureDelay > 0 ? '+' : ''
                      }}{{ row.checkpointStop.departureDelay }})
                    </span>
                  </div>
                </span>
              </span>
            </span>
          </router-link>
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, PropType } from 'vue';
import { Station, ActiveScenery } from '../../../typings/common';
import { SceneryTimetableRow } from '../typings';
import { getTrainStopStatus, stopStatusPriorities } from '../utils';
import { useRoute } from 'vue-router';
import { useMainStore } from '../../../store/mainStore';
import { useApiStore } from '../../../store/apiStore';
import { timestampToTimeString } from '../../../composables/time';
import ScheduledTrainStatus from './ScheduledTrainStatus.vue';
import Loading from '../../Global/Loading.vue';

const props = defineProps({
  station: {
    type: Object as PropType<Station>
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  },

  chosenCheckpoint: {
    type: String,
    required: true
  }
});

const route = useRoute();
const mainStore = useMainStore();
const apiStore = useApiStore();

const sceneryTimetables: ComputedRef<SceneryTimetableRow[]> = computed(() => {
  if (!props.onlineScenery) return [];

  const sceneryName = route.query['station']?.toString().replace(/_/g, ' ') ?? '';

  return props.onlineScenery.scheduledTrains
    .filter(
      (ct) =>
        // ct.timetablePathElement.stationName == sceneryName &&
        ct.train.region == mainStore.region.id &&
        props.chosenCheckpoint &&
        ct.checkpointStop.stopNameRAW.toLowerCase() == props.chosenCheckpoint.toLowerCase()
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
        prevElement: ct.previousSceneryElement,
        nextElement: ct.nextSceneryElement,
        currentElement: ct.timetablePathElement,
        status: trainStopStatus
      };
    })
    .sort((a, b) => {
      if (stopStatusPriorities.indexOf(a.status) - stopStatusPriorities.indexOf(b.status) < 0)
        return -1;

      if (stopStatusPriorities.indexOf(a.status) - stopStatusPriorities.indexOf(b.status) > 0)
        return 1;

      if (a.checkpointStop.arrivalTimestamp > b.checkpointStop.arrivalTimestamp) return 1;
      if (a.checkpointStop.arrivalTimestamp < b.checkpointStop.arrivalTimestamp) return -1;

      return a.checkpointStop.departureTimestamp > b.checkpointStop.departureTimestamp ? 1 : -1;
    });
});
</script>

<style lang="scss" scoped>
@use '../../../styles/responsive';
@use '../../../styles/animations';
@use '../../../styles/badge';

.scenery-timetable-list {
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  gap: 1em;
}

.item-general {
  display: flex;
  align-items: center;
  justify-content: space-between;

  text-align: left;
}

.item-schedule {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.2em;
  align-items: center;

  width: 100%;
  max-width: 400px;
  margin: 0 auto;
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
    color: var(--clr-primary);
  }
}

.list-container {
  position: relative;
  overflow-y: auto;
}

.timetable-item,
.timetable-item-link {
  margin: 0.5em 0;
  padding: 0.5em;
  max-width: 1100px;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.2em 0.5em;

  overflow: hidden;

  background: #353535;

  z-index: 10;

  &.empty {
    padding: 1rem;
    font-size: 1.2em;
    color: #bbb;
  }
}

.general-info {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}

.info-train {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

.info-train > .train-badge {
  font-size: 0.85em;
}

.info-number {
  color: var(--clr-primary);
}

.info-route {
  width: 100%;
  margin-top: 0.25em;
}

.stop-comments-icon > img {
  width: 1.3em;
  vertical-align: top;
}

.schedule-arrival,
.schedule-departure {
  font-size: 1.15em;
}

.schedule-stop {
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

    color: var(--clr-primary);

    &::after {
      content: '\027F6';
      display: block;
      font-size: 2.2em;
      line-height: 0.65em;
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.85em;
}

@include responsive.smallScreen {
  .timetable-item {
    grid-template-columns: 1fr;
  }
}
</style>
