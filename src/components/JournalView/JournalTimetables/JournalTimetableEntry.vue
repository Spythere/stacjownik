<template>
  <li class="timetable-history-entry">
    <!-- General -->
    <EntryGeneral :timetable="timetableEntry" />

    <div @click="toggleExtraInfo" style="cursor: pointer">
      <!-- Route -->
      <span class="entry-route">
        <b>{{ timetableEntry.route.replace('|', ' - ') }}</b>
      </span>

      <hr />

      <!-- Status -->
      <EntryStatus :timetable="timetableEntry" />
    </div>

    <!-- Extra -->
    <EntryDetails
      :timetable="timetableEntry"
      :show-extra-info="showExtraInfo"
      @toggle-extra-info="toggleExtraInfo"
    />
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { API } from '../../../typings/api';
import trainCategoryMixin from '../../../mixins/trainCategoryMixin';
import dateMixin from '../../../mixins/dateMixin';
import { useApiStore } from '../../../store/apiStore';
import { Journal } from '../typings';

import styleMixin from '../../../mixins/styleMixin';
import EntryGeneral from './EntryGeneral.vue';
import EntryStatus from './EntryStatus.vue';
import EntryDetails from './EntryDetails.vue';

export default defineComponent({
  props: {
    timetableEntry: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    },
    showExtraInfo: {
      type: Boolean,
      required: true
    }
  },

  components: { EntryDetails, EntryGeneral, EntryStatus },
  mixins: [trainCategoryMixin, dateMixin, styleMixin],
  emits: ['toggleShowExtraInfo'],

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  computed: {
    timetablePathDetails() {
      if (!this.timetableEntry.path || this.timetableEntry.path == '') return null;

      return this.timetableEntry.path.split(';').map((pathEl, i) => {
        const [arrival, name, departure] = pathEl.split(',');
        const sceneryName = name.split(' ').slice(0, -1).join(' ');
        const sceneryHash = name.split(' ').pop()?.replace('.sc', '') ?? '';

        return {
          arrival,
          sceneryName,
          sceneryHash,
          departure,
          isVisited: this.timetableEntry.visitedSceneries?.includes(sceneryHash) ?? false
        };
      });
    },

    timetableStops(): Journal.TimetableStopDetails[] {
      const timetableEntry = this.timetableEntry;

      const stopNames = timetableEntry.sceneriesString.split('%');

      return stopNames.reduce<Journal.TimetableStopDetails[]>((acc, stopName, i, arr) => {
        const arrivalDate =
          i == arr.length - 1
            ? (timetableEntry.checkpointArrivals.at(i) ?? timetableEntry.endDate)
            : timetableEntry.checkpointArrivals.at(i);

        const scheduledArrivalDate =
          i == arr.length - 1
            ? (timetableEntry.checkpointArrivalsScheduled.at(i) ?? timetableEntry.scheduledEndDate)
            : timetableEntry.checkpointArrivalsScheduled.at(i);

        const departureDate =
          i == 0
            ? (timetableEntry.checkpointDepartures.at(i) ?? timetableEntry.beginDate)
            : timetableEntry.checkpointDepartures.at(i);

        const scheduledDepartureDate =
          i == 0
            ? (timetableEntry.checkpointDeparturesScheduled.at(i) ??
              timetableEntry.scheduledBeginDate)
            : timetableEntry.checkpointDeparturesScheduled.at(i);

        const stopTime = Number(timetableEntry.checkpointStopTypes.at(i)?.split(',')[0]) || 0;
        const stopType = timetableEntry.checkpointStopTypes.at(i)?.split(',')[1] || '';

        acc.push({
          stopName,
          arrivalTimestamp: this.dateStringToTimestamp(arrivalDate),
          scheduledArrivalTimestamp: this.dateStringToTimestamp(scheduledArrivalDate),
          departureTimestamp: this.dateStringToTimestamp(departureDate),
          scheduledDepartureTimestamp: this.dateStringToTimestamp(scheduledDepartureDate),
          stopTime,
          stopType,
          isConfirmed: i < timetableEntry.confirmedStopsCount
        });

        return acc;
      }, []);
    }
  },

  methods: {
    toggleExtraInfo() {
      this.$emit('toggleShowExtraInfo', this.timetableEntry.id);
    }
  }
});
</script>

<style lang="scss" scoped>
.timetable-history-entry {
  background-color: #1a1a1a;
  padding: 1em;
}
</style>
