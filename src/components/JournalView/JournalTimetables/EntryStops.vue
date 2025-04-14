<template>
  <div class="entry-stops">
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

    <ul class="timetable-path-list" v-if="timetablePathDetails">
      <li
        v-for="(pathData, i) in timetablePathDetails"
        :data-visited="pathData.isVisited"
        :data-next-visited="
          i < timetablePathDetails.length - 1 && timetablePathDetails[i + 1].isVisited
        "
      >
        <span v-if="i > 0" class="path-arrow">&gt;</span>
        <span class="path-arrival" v-if="pathData.arrival">{{ pathData.arrival }}</span>
        <b class="path-scenery">{{ pathData.sceneryName }}</b>
        <span class="path-departure" v-if="pathData.departure">{{ pathData.departure }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import { API } from '../../../typings/api';

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
    timetablePathDetails() {
      if (!this.timetable.path || this.timetable.path == '') return null;

      return this.timetable.path.split(';').map((pathEl, i) => {
        const [arrival, name, departure] = pathEl.split(',');
        const sceneryName = name.split(' ').slice(0, -1).join(' ');
        const sceneryHash = name.split(' ').pop()?.replace('.sc', '') ?? '';
        const isVisited = this.timetable.visitedSceneries.includes(sceneryHash);

        return {
          arrival,
          sceneryName,
          sceneryHash,
          departure,
          isVisited,
          isVisitedOffline:
            !isVisited &&
            this.timetable.visitedSceneries.includes(`${sceneryName} ${sceneryHash}.sc`)
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
        const stopType = timetable.checkpointStopTypes.at(i)?.split(',').slice(1).join(',') || 'pt';
        const stopComments = timetable.checkpointComments.at(i) ?? null;

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
@use '../../../styles/badge';

.entry-stops {
  word-wrap: break-word;
  gap: 0.25em;
  font-size: 0.95em;
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

.timetable-path-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em 0;
  padding: 0.5em 0;
  color: #ccc;

  li > .path-scenery:first-child,
  li > .path-arrival:nth-child(2) {
    border-radius: 0.5em 0 0 0.5em;
  }

  li > :last-child {
    border-radius: 0 0.5em 0.5em 0;
  }
}

.path-scenery {
  padding: 0.25em 0.5em;
  background-color: #303030;
}

.path-arrival,
.path-departure {
  padding: 0.25em;
  display: inline-block;
  background-color: #4e4e4e;
  min-width: 25px;
  text-align: center;
}

.path-arrow {
  padding: 0 0.5em;
}

.timetable-path-list > li[data-visited='true'] {
  .path-arrival,
  .path-scenery,
  .path-arrow {
    color: lightgreen;
  }

  &[data-next-visited='true'] .path-departure {
    color: lightgreen;
  }
}
</style>
