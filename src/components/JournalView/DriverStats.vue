<template>
  <div class="journal-stats" v-if="store.driverStatsData?._sum.routeDistance != null">
    <h1>
      STATYSTYKI MASZYNISTY <span class="text--primary">{{ store.driverStatsName.toUpperCase() }}</span>
    </h1>

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
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { computed, defineComponent, ref } from 'vue';
import { DriverStatsAPIData } from '../../scripts/interfaces/api/DriverStatsAPIData';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '../../scripts/utils/apiURLs';
import { useStore } from '../../store/store';

export default defineComponent({
  emits: ['closeCard'],

  setup() {
    const store = useStore();
    return {
      store,
      driverStatsName: computed(() => store.driverStatsName),
    };
  },

  data() {
    return {
      test: Math.random(),
      lastDispatcherName: '',

      lastTimetables: [] as TimetableHistory[],
    };
  },

  watch: {
    driverStatsName(value: string) {
      this.fetchDispatcherStats();
    },
  },

  methods: {
    async fetchDispatcherStats() {
      this.store.driverStatsData = undefined;

      if (!this.store.driverStatsName) return;

      const statsData: DriverStatsAPIData = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getDriverInfo?name=${this.store.driverStatsName}`)
      ).data;

      this.store.driverStatsData = statsData;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
</style>
