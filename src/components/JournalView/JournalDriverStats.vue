<template>
  <div class="journal-stats">
    <span v-if="store.driverStatsData">
      <h3>
        {{ $t('journal.stats-title') }} <span class="text--primary">{{ store.driverStatsName.toUpperCase() }}</span>
      </h3>

      <div class="info-stats">
        <span class="stat-badge">
          <span>{{ $t('journal.stats-timetables') }}</span>
          <span>{{ store.driverStatsData._count.fulfilled }} / {{ store.driverStatsData._count._all }}</span>
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

    <span v-else-if="store.driverStatsStatus == DataStatus.Loading">{{ $t('journal.stats-loading') }}</span>
    <span v-else-if="store.driverStatsStatus == DataStatus.Error">
      {{ $t('journal.stats-error ') }}
    </span>
    <span v-else>{{ $t('journal.driver-stats-info') }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { useStore } from '../../store/store';

export default defineComponent({
  data() {
    return {
      store: useStore(),
      DataStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
</style>
