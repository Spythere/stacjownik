<template>
  <div class="card-dimmer" @click="closeCard"></div>

  <div class="stats-card card">
    <div>
      <h2 class="card-title">
        STATYSTYKI DYŻURNEGO <span class="text--primary">{{ store.dispatcherStatsName.toUpperCase() }}</span>
      </h2>

      <div class="loading" v-if="!store.dispatcherStatsData">Ładowanie...</div>
      <div v-else>
        <h3>STATYSTYKI WYSTAWIONYCH ROZKŁADÓW</h3>
        <div class="info-stats">
          <span class="stat-badge">
            <span>LICZBA</span>
            <span>{{ store.dispatcherStatsData.count }}</span>
          </span>
          <span class="stat-badge">
            <span>SUMA (KM)</span>
            <span>{{ store.dispatcherStatsData.sumDistance.toFixed(2) }}km</span>
          </span>
          <span class="stat-badge">
            <span>NAJDŁUŻSZY</span>
            <span>{{ store.dispatcherStatsData.maxTimetableDistance }}km</span>
          </span>
          <span class="stat-badge">
            <span>ŚREDNIO</span>
            <span>{{ store.dispatcherStatsData.avgTimetableDistance }}km</span>
          </span>
        </div>

        <h3>OSTATNIE WYSTAWIONE ROZKŁADY</h3>

        <div class="last-timetables">
          <div class="timetable-row" v-for="timetable in store.dispatcherStatsData.timetables">
            <span>#{{ timetable.timetableId }}</span>
            <span>{{ timetable.routeDistance }}km</span>
            <span>
              <b>{{ timetable.trainNo }}</b
              >&nbsp;{{ timetable.driverName }}
            </span>
            <span>{{ timetable.route.replace('|', ' > ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DispatcherStatsAPIData } from '@/scripts/interfaces/api/DispatcherStatsAPIData';
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
      lastDispatcherName: '',
    };
  },

  activated() {
    this.fetchDispatcherStats();
  },

  methods: {
    async fetchDispatcherStats() {
      this.store.dispatcherStatsData = undefined;

      const statsData: DispatcherStatsAPIData = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getDispatcherInfo?name=${this.store.dispatcherStatsName}`)
      ).data;

      this.store.dispatcherStatsData = statsData.response;
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
  grid-template-columns: 1fr 1fr 3fr 4fr;
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
    grid-template-columns: 1fr 1fr;
    background-color: #4d4d4d;
  }
}
</style>
