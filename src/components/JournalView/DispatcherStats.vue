<template>
  <div class="stats_container" v-click-outside="() => (cardVisible = false)">
    <button class="stats_button" @click="toggleCard">
      Statystyki dyżurnego {{ store.dispatcherStatsName }}
    </button>

    <div class="stats_card" v-if="store.dispatcherStatsName && cardVisible">
      <div>
        <Loading v-if="!store.dispatcherStatsData" />

        <div class="loading" v-else-if="!store.dispatcherStatsData._count._all">
          Ten dyżurny nie ma jeszcze szczegółowych statystyk!
        </div>

        <div v-else>
          <h3>STATYSTYKI WYSTAWIONYCH ROZKŁADÓW</h3>
          
          <div class="info-stats" v-if="store.dispatcherStatsData._count._all">
            <span class="stat-badge">
              <span>LICZBA</span>
              <span>{{ store.dispatcherStatsData._count._all }}</span>
            </span>
            <span class="stat-badge">
              <span>SUMA (KM)</span>
              <span>{{ store.dispatcherStatsData._sum.routeDistance.toFixed(2) }}km</span>
            </span>
            <span class="stat-badge">
              <span>NAJDŁUŻSZY</span>
              <span>{{ store.dispatcherStatsData._max.routeDistance.toFixed(2) }}km</span>
            </span>
            <span class="stat-badge">
              <span>ŚREDNIO</span>
              <span>{{ store.dispatcherStatsData._avg.routeDistance.toFixed(2) }}km</span>
            </span>
          </div>

          <h3>OSTATNIE WYSTAWIONE ROZKŁADY</h3>
          <div class="last-timetables">
            <div class="timetable-row" v-for="timetable in timetables">
              #{{ timetable.timetableId }} | <b>{{ timetable.trainCategoryCode }} {{ timetable.trainNo }}</b> |
              {{ timetable.driverName }} ({{ timetable.routeDistance }}km)
              <div>{{ timetable.route.replace('|', ' > ') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import axios from 'axios';
import { computed, defineComponent } from 'vue';
import { DispatcherStatsAPIData } from '../../scripts/interfaces/api/DispatcherStatsAPIData';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '../../scripts/utils/apiURLs';
import { useStore } from '../../store/store';
import Loading from '../Global/Loading.vue';

export default defineComponent({
  components: { Loading },

  setup() {
    const store = useStore();

    const statsData2 = computed(async () => {
      return await (
        await axios.get(`${URLs.stacjownikAPI}/api/getDispatcherInfo?name=${store.dispatcherStatsName}`)
      ).data;
    });

    return {
      store,
      statsData2,
    };
  },

  data() {
    return {
      cardVisible: false,
      lastDispatcherName: '',
      timetables: [] as TimetableHistory[],
    };
  },

  methods: {
    toggleCard() {
      if (!this.store.dispatcherStatsName) return;

      this.cardVisible = !this.cardVisible;
      if (this.cardVisible) this.fetchDispatcherStats();
    },

    async fetchDispatcherStats() {
      if (this.lastDispatcherName != this.store.dispatcherStatsName) {
        this.store.dispatcherStatsData = undefined;
      }

      const statsData: DispatcherStatsAPIData = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getDispatcherInfo?name=${this.store.dispatcherStatsName}`)
      ).data;

      const timetables: TimetableHistory[] = await (
        await axios.get(`${URLs.stacjownikAPI}/api/getTimetables?authorName=${this.store.dispatcherStatsName}`)
      ).data;

      this.timetables = timetables;
      this.store.dispatcherStatsData = statsData;
      this.lastDispatcherName = this.store.dispatcherStatsName;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';

.stats_container {
  position: relative;
}

.stats_card {
  position: absolute;
  z-index: 999;
  top: 120%;
  right: 0;
  width: 500px;
  max-width: 97vw;
  min-height: 100px;
  overflow: auto;

  border-radius: 1em 0 1em 1em;
  background-color: #222222f1;
  box-shadow: 0 3px 10px 5px #131313;
  padding: 1em 0.5em;
}

.last-timetables {
  max-height: 400px;
  margin: 0.5em 0;
}

.timetable-row {
  width: 95%;
  margin: 0.5em auto;
  padding: 0.5em;

  background-color: #4d4d4d;
}

h2.card-title {
  font-size: 1.8em;
}

h3 {
  margin-top: 1em;
}

h2,
h3 {
  text-align: center;
}


.last-timetables {
  overflow-y: auto;
}



</style>
