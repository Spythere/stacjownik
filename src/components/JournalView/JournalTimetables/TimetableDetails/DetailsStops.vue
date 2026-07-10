<template>
  <div class="details-stops">
    <h4>{{ $t('journal.timetable-stops-title') }}</h4>

    <ul class="stop-list">
      <li v-for="(stop, i) in timetableStops" :key="stop.stopName">
        <span class="stop-label" :data-confirmed="stop.isConfirmed">
          <span v-if="i > 0">&gt;</span>

          <span class="stop-name">{{ stop.stopName }}</span>

          <span
            class="stop-date"
            v-if="stop.scheduledArrivalTimestamp != 0"
            :data-delayed="
              stop.isConfirmed && stop.arrivalTimestamp - stop.scheduledArrivalTimestamp > 0
            "
            :data-preponed="
              stop.isConfirmed &&
              stop.arrivalTimestamp != 0 &&
              stop.arrivalTimestamp - stop.scheduledArrivalTimestamp < 0
            "
          >
            <span
              v-if="stop.isConfirmed && stop.arrivalTimestamp - stop.scheduledArrivalTimestamp != 0"
            >
              p. <s>{{ timestampToString(stop.scheduledArrivalTimestamp) }}</s>
              {{ timestampToString(stop.arrivalTimestamp) }}
            </span>

            <span v-else>p. {{ timestampToString(stop.scheduledArrivalTimestamp) }}</span>
          </span>

          <span
            class="stop-time"
            v-if="stop.stopTime > 0"
            :data-stop-ph="stop.stopType.includes('ph')"
            :data-stop-pt="stop.stopType.includes('pt')"
            :data-stop-pm="stop.stopType.includes('pm')"
          >
            /<span>{{ stop.stopTime }} {{ stop.stopType }}</span
            >/
          </span>

          <span
            class="stop-date"
            v-if="
              stop.scheduledDepartureTimestamp != 0 &&
              stop.scheduledArrivalTimestamp != stop.scheduledDepartureTimestamp
            "
            :data-delayed="
              stop.isConfirmed && stop.departureTimestamp - stop.scheduledDepartureTimestamp > 0
            "
            :data-preponed="
              stop.isConfirmed &&
              stop.departureTimestamp != 0 &&
              stop.departureTimestamp - stop.scheduledDepartureTimestamp < 0
            "
          >
            <span
              v-if="
                stop.isConfirmed && stop.departureTimestamp - stop.scheduledDepartureTimestamp != 0
              "
            >
              o. <s>{{ timestampToString(stop.scheduledDepartureTimestamp) }}</s>
              {{ timestampToString(stop.departureTimestamp) }}
            </span>

            <span v-else>o. {{ timestampToString(stop.scheduledDepartureTimestamp) }}</span>
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../../mixins/dateMixin';
import { API } from '../../../../typings/api';

interface ITimetableStopDetails {
  stopName: string;
  stopComments: string | null;
  stopTime: number;
  stopType: string;
  arrivalTimestamp: number;
  scheduledArrivalTimestamp: number;
  departureTimestamp: number;
  scheduledDepartureTimestamp: number;
  isConfirmed: boolean;
}

export default defineComponent({
  mixins: [dateMixin],

  props: {
    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  },

  computed: {
    timetableStops(): ITimetableStopDetails[] {
      const timetable = this.timetable;

      const stopNames = timetable.sceneriesString.split('%');

      return stopNames.reduce<ITimetableStopDetails[]>((acc, stopName, i, arr) => {
        const arrivalDate =
          i == arr.length - 1
            ? (timetable.checkpointArrivals[i] ?? timetable.endDate)
            : timetable.checkpointArrivals[i];

        const scheduledArrivalDate =
          i == arr.length - 1
            ? (timetable.checkpointArrivalsScheduled[i] ?? timetable.scheduledEndDate)
            : timetable.checkpointArrivalsScheduled[i];

        const departureDate =
          i == 0
            ? (timetable.checkpointDepartures[i] ?? timetable.beginDate)
            : timetable.checkpointDepartures[i];

        const scheduledDepartureDate =
          i == 0
            ? (timetable.checkpointDeparturesScheduled[i] ?? timetable.scheduledBeginDate)
            : timetable.checkpointDeparturesScheduled[i];

        const stopTime = Number(timetable.checkpointStopTypes[i]?.split(',')[0]) || 0;
        const stopType = timetable.checkpointStopTypes[i]?.split(',').slice(1).join(',') || 'pt';
        const stopComments = timetable.checkpointComments[i] ?? null;

        acc.push({
          stopName,
          stopTime,
          stopType,
          stopComments,
          arrivalTimestamp: this.dateStringToTimestamp(arrivalDate),
          scheduledArrivalTimestamp: this.dateStringToTimestamp(scheduledArrivalDate),
          departureTimestamp: this.dateStringToTimestamp(departureDate),
          scheduledDepartureTimestamp: this.dateStringToTimestamp(scheduledDepartureDate),
          isConfirmed: i < timetable.confirmedStopsCount
        });

        return acc;
      }, []);
    }
  }
});
</script>

<style lang="scss" scoped>
@use '@/styles/badge';

.details-stops {
  word-wrap: break-word;
  gap: 0.25em;
}

.stop-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0.5em;
  font-size: 0.95em;
}

.stop-label {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  align-items: center;
  color: white;

  &[data-confirmed='true'] > .stop-name {
    color: lightgreen;
  }

  &[data-confirmed='true'] > .stop-date:not([data-preponed='true']):not([data-delayed='true']) {
    color: lightgreen;
  }
}

.stop-name {
  font-weight: bold;
  color: #ccc;

  i {
    display: none;
  }
}

.stop-date {
  color: #ccc;

  s {
    color: #aaa;
  }

  &[data-delayed='true'] {
    color: salmon;
  }

  &[data-preponed='true'] {
    color: mediumspringgreen;
  }
}

.stop-time {
  &[data-stop-pt='true'] span {
    color: #999;
  }

  &[data-stop-ph='true'] span,
  &[data-stop-pm='true'] span {
    color: gold;
  }
}
</style>
