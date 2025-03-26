<template>
  <div class="journal-stats driver" v-if="store.driverStatsData">
    <span>
      <h3>
        <i18n-t keypath="journal.driver-stats.title">
          <template #name>
            <span class="text--primary">{{ store.driverStatsName.toUpperCase() }}</span>
          </template>
        </i18n-t>
      </h3>

      <hr class="header-separator" />

      <div class="info-stats">
        <span class="badge stat-badge">
          <span>{{ $t('journal.driver-stats.timetables') }}</span>
          <span
            >{{ store.driverStatsData._count.fulfilled }} /
            {{ store.driverStatsData._count._all }}</span
          >
        </span>

        <span class="badge stat-badge">
          <span>{{ $t('journal.driver-stats.longest-timetable') }}</span>
          <span> {{ store.driverStatsData._max.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ $t('journal.driver-stats.avg-timetable') }}</span>
          <span> {{ store.driverStatsData._avg.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ $t('journal.driver-stats.distance') }}</span>
          <span>
            {{ store.driverStatsData._sum.currentDistance.toFixed(2) }} /
            {{ store.driverStatsData._sum.routeDistance.toFixed(2) }}km
          </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ $t('journal.driver-stats.stations') }}</span>
          <span>
            {{ store.driverStatsData._sum.confirmedStopsCount }} /
            {{ store.driverStatsData._sum.allStopsCount }}
          </span>
        </span>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../../store/mainStore';
import { Status } from '../../../typings/common';

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
@use '../../../styles/journal-stats';
</style>
