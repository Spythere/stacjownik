<template>
  <div class="card-dimmer" @click="closeCard"></div>

  <div class="stats-card card">
    <div>
      <h2 class="card-title">
        STATYSTYKI MASZYNISTY <span class="text--primary">{{ store.driverStatsName.toUpperCase() }}</span>
      </h2>

      <div class="loading" v-if="!store.driverStatsData">Ładowanie...</div>

      <div v-else>
        <div class="info-stats" v-if="store.driverStatsData._sum.routeDistance != null">
          <span class="stat-badge">
            <span>PRZEBYTO</span>
            <span>{{ store.driverStatsData._sum.routeDistance.toFixed(2) }}km</span>
          </span>
          <span class="stat-badge">
            <span>PORZUCONO</span>
            <span>
              {{ (store.driverStatsData._sum.routeDistance - store.driverStatsData._sum.currentDistance).toFixed(2) }}km
            </span>
          </span>

          <span class="stat-badge">
            <span>WYPEŁNIONO</span>
            <span>{{ store.driverStatsData._count.fulfilled }} RJ</span>
          </span>

          <span class="stat-badge">
            <span>PORZUCONO</span>
            <span>{{ store.driverStatsData._count._all - store.driverStatsData._count.fulfilled }} RJ</span>
          </span>

          <span class="stat-badge">
            <span>ZATWIERDZONO</span>
            <span>{{ store.driverStatsData._sum.confirmedStopsCount }} stacji</span>
          </span>

          <span class="stat-badge">
            <span>PORZUCONO</span>
            <span>
              {{ store.driverStatsData._sum.allStopsCount - store.driverStatsData._sum.confirmedStopsCount }}
              stacji
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DriverStatsAPIData } from '@/scripts/interfaces/api/DriverStatsAPIData';
import { TimetableHistory } from '@/scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '@/scripts/utils/apiURLs';
import { useStore } from '@/store/store';
import axios from 'axios';
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['closeCard'],

  setup() {
    const store = useStore();
    return {
      store,
    };
  },

  data() {
    return {
      test: Math.random(),
      lastDispatcherName: '',

      lastTimetables: [] as TimetableHistory[],
    };
  },

  activated() {
    this.fetchDispatcherStats();
  },

  methods: {
    async fetchDispatcherStats() {
      this.store.driverStatsData = undefined;

      const statsData: DriverStatsAPIData = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getDriverInfo?name=${this.store.driverStatsName}`)
      ).data;

      const recentTimetablesData: TimetableHistory[] = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getTimetables?driverName=${this.store.driverStatsName}`)
      ).data;

      this.store.driverStatsData = statsData;
      this.lastTimetables = recentTimetablesData || [];
    },

    closeCard() {
      this.$emit('closeCard');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.timetable-row {
  display: grid;
  grid-template-columns: 4fr 1fr 1fr 2fr 2fr;
  gap: 0.2em;
  margin: 0.5em 0;
  text-align: center;

  span {
    min-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;

    background-color: #4d4d4d;
    padding: 0.5em 0.2em;
  }

  @include smallScreen() {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    span {
      padding: 0.2em 0.3em;
    }

    grid-template-columns: 1fr;
    background-color: #4d4d4d;
  }
}
</style>
