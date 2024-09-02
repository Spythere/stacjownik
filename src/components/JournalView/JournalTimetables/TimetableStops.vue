<template>
  <div class="timetable-stops">
    <ul class="stop-list">
      <li
        v-for="(stop, i) in timetableStops.filter((_, i) =>
          !showExtraInfo ? i == 0 || i == timetableStops.length - 1 : true
        )"
        :key="stop.stopName"
      >
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

    <div class="path-details" v-if="showExtraInfo && timetablePathDetails">
      <span
        v-for="(pathData, i) in timetablePathDetails"
        :data-visited="pathData.isVisited"
        :data-next-visited="
          i < timetablePathDetails.length - 1 && timetablePathDetails[i + 1].isVisited
        "
      >
        <span class="path-arrival" v-if="pathData.arrival">
          / {{ pathData.arrival }} &RightArrow;
        </span>
        <b class="path-scenery">{{ pathData.sceneryName }}</b>
        <span class="path-departure" v-if="pathData.departure">
          &RightArrow; {{ pathData.departure }}&nbsp;
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import { API } from '../../../typings/api';

interface ITimetableStopDetails {
  stopName: string;
  arrivalTimestamp: number;
  scheduledArrivalTimestamp: number;
  departureTimestamp: number;
  scheduledDepartureTimestamp: number;
  stopTime: number;
  stopType: string;
  isConfirmed: boolean;
}

export default defineComponent({
  mixins: [dateMixin],

  props: {
    showExtraInfo: {
      type: Boolean,
      required: true
    },

    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  },

  computed: {
    timetablePathDetails() {
      if (!this.timetable.path || this.timetable.path == '') return null;

      return this.timetable.path.split(';').map((pathEl, i) => {
        const [arrival, name, departure] = pathEl.split(',');
        const sceneryName = name.split(' ').slice(0, -1).join(' ');
        const sceneryHash = name.split(' ').pop()?.replace('.sc', '') ?? '';

        return {
          arrival,
          sceneryName,
          sceneryHash,
          departure,
          isVisited: this.timetable.visitedSceneries?.includes(sceneryHash) ?? false
        };
      });
    },

    timetableStops(): ITimetableStopDetails[] {
      const timetable = this.timetable;

      const stopNames = timetable.sceneriesString.split('%');

      return stopNames.reduce<ITimetableStopDetails[]>((acc, stopName, i, arr) => {
        const arrivalDate =
          i == arr.length - 1
            ? (timetable.checkpointArrivals.at(i) ?? timetable.endDate)
            : timetable.checkpointArrivals.at(i);

        const scheduledArrivalDate =
          i == arr.length - 1
            ? (timetable.checkpointArrivalsScheduled.at(i) ?? timetable.scheduledEndDate)
            : timetable.checkpointArrivalsScheduled.at(i);

        const departureDate =
          i == 0
            ? (timetable.checkpointDepartures.at(i) ?? timetable.beginDate)
            : timetable.checkpointDepartures.at(i);

        const scheduledDepartureDate =
          i == 0
            ? (timetable.checkpointDeparturesScheduled.at(i) ?? timetable.scheduledBeginDate)
            : timetable.checkpointDeparturesScheduled.at(i);

        const stopTime = Number(timetable.checkpointStopTypes.at(i)?.split(',')[0]) || 0;
        const stopType = timetable.checkpointStopTypes.at(i)?.split(',')[1] || '';

        acc.push({
          stopName,
          arrivalTimestamp: this.dateStringToTimestamp(arrivalDate),
          scheduledArrivalTimestamp: this.dateStringToTimestamp(scheduledArrivalDate),
          departureTimestamp: this.dateStringToTimestamp(departureDate),
          scheduledDepartureTimestamp: this.dateStringToTimestamp(scheduledDepartureDate),
          stopTime,
          stopType,
          isConfirmed: i < timetable.confirmedStopsCount
        });

        return acc;
      }, []);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/badge.scss';

.timetable-stops {
  word-wrap: break-word;
  gap: 0.25em;
  font-size: 0.95em;
  color: #adadad;
}

.stop-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  padding: 0.5em 0;
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
}

.stop-name {
  font-weight: bold;
  color: #ccc;
}

.stop-date {
  s {
    color: #aaa;
  }

  &[data-delayed='true'] {
    color: salmon;
  }

  &[data-preponed='true'] {
    color: lightgreen;
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

.path-details {
  margin-top: 0.5em;
}

.path-details > span[data-visited='true'] {
  .path-arrival,
  .path-scenery {
    color: lightgreen;
  }

  &[data-next-visited='true'] .path-departure {
    color: lightgreen;
  }
}
</style>
