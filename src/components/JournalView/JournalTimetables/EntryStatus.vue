<template>
  <div class="entry-status" style="margin: 0.5em 0">
    <ProgressBar
      :progressPercent="~~((timetable.currentDistance / timetable.routeDistance) * 100)"
      :progressType="!timetable.fulfilled && timetable.terminated ? 'abandoned' : ''"
    />

    <span>
      <span
        :style="{
          color: timetable.fulfilled ? 'lightgreen' : timetable.terminated ? 'salmon' : ''
        }"
      >
        {{ timetable.currentDistance + ' km' }}
      </span>
      <span> / </span>
      <span class="text--primary">{{ timetable.routeDistance }} km</span>
      |
      <span class="text--grayed"
        >{{ timetable.confirmedStopsCount }}/{{ timetable.allStopsCount }}</span
      >
    </span>

    <span class="entry-location" v-if="timetable.currentSceneryName">
      <b>
        {{ $t(`journal.${timetable.terminated ? 'last-seen-at' : 'currently-at'}`) }}
        {{ timetable.currentSceneryName.replace(/.[a-zA-Z0-9]+.sc/, '') }}

        <span v-if="timetable.currentLocation[0] || timetable.currentLocation[1]">&lpar;</span>

        <span v-if="timetable.currentLocation[1]">
          {{ $t('journal.timetable-location-route') }} {{ timetable.currentLocation[1] }}
        </span>

        <span v-else-if="timetable.currentLocation[0]">
          {{ $t('journal.timetable-location-signal') }} {{ timetable.currentLocation[0] }}
        </span>

        <span v-if="timetable.currentLocation[0] || timetable.currentLocation[1]">&rpar;</span>
      </b>
    </span>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import ProgressBar from '../../Global/ProgressBar.vue';
import { API } from '../../../typings/api';

export default defineComponent({
  components: { ProgressBar },
  props: {
    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../../styles/responsive';

.entry-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;

  @include responsive.smallScreen{
    justify-content: center;
  }
}

.entry-location {
  text-align: center;
  color: #ccc;
}
</style>
