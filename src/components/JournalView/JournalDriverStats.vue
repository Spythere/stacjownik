<template>
  <div class="journal-stats" v-if="store.driverStatsData">
    <span>
      <h3>
        {{ $t('journal.stats-title') }}
        <span class="text--primary">{{ store.driverStatsName.toUpperCase() }}</span>
      </h3>

      <hr class="header-separator" />

      <div class="info-stats">
        <span class="stat-badge">
          <span>{{ $t('journal.stats-timetables') }}</span>
          <span
            >{{ store.driverStatsData._count.fulfilled }} /
            {{ store.driverStatsData._count._all }}</span
          >
        </span>

        <span class="stat-badge">
          <span>{{ $t('journal.stats-longest-timetable') }}</span>
          <span> {{ store.driverStatsData._max.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="stat-badge">
          <span>{{ $t('journal.stats-avg-timetable') }}</span>
          <span> {{ store.driverStatsData._avg.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="stat-badge">
          <span>{{ $t('journal.stats-distance') }}</span>
          <span>
            {{ store.driverStatsData._sum.currentDistance.toFixed(2) }} /
            {{ store.driverStatsData._sum.routeDistance.toFixed(2) }}km
          </span>
        </span>

        <span class="stat-badge">
          <span>{{ $t('journal.stats-stations') }}</span>
          <span>
            {{ store.driverStatsData._sum.confirmedStopsCount }} /
            {{ store.driverStatsData._sum.allStopsCount }}
          </span>
        </span>
      </div>
    </span>

    <!-- <b v-else-if="store.driverStatsStatus == Status.Data.Loading">{{
      $t('journal.stats-loading')
    }}</b>
    <b v-else-if="store.driverStatsStatus == Status.Data.Error">
      {{ $t('journal.stats-error ') }}
    </b>
    <b v-else>{{ $t('journal.driver-stats-info') }}</b> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { Status } from '../../typings/common';

export default defineComponent({
  name: 'journal-driver-stats',

  data() {
    return {
      store: useMainStore(),
      Status: Status
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
</style>
