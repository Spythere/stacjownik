<template>
  <div class="stop-list" v-if="showExtraInfo == true">
    <span
      v-for="(stop, i) in timetableStops.filter((_, i) =>
        !showExtraInfo ? i == 0 || i == timetableStops.length - 1 : true
      )"
      class="stop-list-item"
      :key="stop.stopName"
      :data-confirmed="stop.confirmed"
    >
      <span v-if="i > 0">
        &gt;
        <span v-if="!showExtraInfo && i == 1 && timetableStops.length > 2">
          ... (+{{ timetableStops.length - 2 }}) &gt;
        </span>
      </span>

      <span class="stop-name">{{ stop.stopName }}</span>
      <span v-html="stop.html"></span>
    </span>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';

import { TimetableHistory } from '../../../scripts/interfaces/api/TimetablesAPIData';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    showExtraInfo: {
      type: Boolean,
      required: true
    },

    timetable: {
      type: Object as PropType<TimetableHistory>,
      required: true
    }
  },

  computed: {
    timetableStops() {
      const timetable = this.timetable;

      const stopNames = timetable.sceneriesString.split('%');

      const beginDateHTML = ` (o. ${
        timetable.beginDate != timetable.scheduledBeginDate
          ? `<s class="text--grayed">${this.localeTime(timetable.beginDate, this.$i18n.locale)}</s>`
          : ''
      } <span>${this.localeTime(timetable.scheduledBeginDate, this.$i18n.locale)}</span>)`;

      const endDateHTML = ` (p. ${
        timetable.endDate != timetable.scheduledEndDate && timetable.fulfilled
          ? `<s class="text--grayed">${this.localeTime(timetable.endDate, this.$i18n.locale)}</s>`
          : ''
      } <span>${this.localeTime(timetable.scheduledEndDate, this.$i18n.locale)}</span>)`;

      return stopNames.map((stopName, i) => {
        const confirmed = i < timetable.confirmedStopsCount;
        if (i == 0) return { stopName, html: beginDateHTML, confirmed };
        if (i == stopNames.length - 1) return { stopName, html: endDateHTML, confirmed };

        const departureDateScheduled = this.stringToDate(
          timetable.checkpointDeparturesScheduled?.at(i)
        );
        const departureDateReal = this.stringToDate(timetable.checkpointDepartures?.at(i));
        const arrivalDateScheduled = this.stringToDate(
          timetable.checkpointArrivalsScheduled?.at(i)
        );
        const arrivalDateReal = this.stringToDate(timetable.checkpointArrivals?.at(i));
        const arrivalHTML =
          (arrivalDateReal &&
          arrivalDateScheduled &&
          arrivalDateReal?.getTime() != arrivalDateScheduled?.getTime()
            ? `<s class="text--grayed">${this.parseDateToTimeString(arrivalDateScheduled)}</s> `
            : '') + this.parseDateToTimeString(arrivalDateReal || arrivalDateScheduled);
        const departureHTML =
          (departureDateReal &&
          departureDateScheduled &&
          departureDateReal?.getTime() != departureDateScheduled?.getTime()
            ? `<s class="text--grayed">${this.parseDateToTimeString(departureDateScheduled)}</s> `
            : '') + this.parseDateToTimeString(departureDateReal || departureDateScheduled);
        let html = `${arrivalHTML}${departureHTML ? ` / ${departureHTML}` : ''}`;
        if (html) html = ` (${html})`;
        return { stopName, html, confirmed };
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.stop-list {
  word-wrap: break-word;
  gap: 0.25em;
  font-size: 0.95em;

  color: #adadad;

  &-item[data-confirmed='true'] {
    color: lightgreen;

    .stop-name {
      font-weight: bold;
    }
  }
}
</style>
