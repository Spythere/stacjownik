<template>
  <div class="timetables-stats">
    <div class="tabs">
      <button
        v-for="tab in data.tabs"
        class="btn--filled"
        :disabled="tab.disabled"
        :data-disabled="tab.disabled"
        :data-selected="tab.name == store.currentStatsTab"
        @click="onTabButtonClick(tab.name, tab.disabled)"
      >
        {{ tab.title }}
      </button>
    </div>

    <div class="journal-stats" v-html="timetablesStats" v-if="store.currentStatsTab == 'daily'"></div>
    <DriverStats v-else-if="store.currentStatsTab == 'driver'" />
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onActivated, onDeactivated, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ITimetablesDailyStats, ITimetablesDailyStatsResponse } from '../../scripts/interfaces/api/StatsAPIData';
import { URLs } from '../../scripts/utils/apiURLs';
import { useStore } from '../../store/store';
import DriverStats from './DriverStats.vue';

// Types
type TStatTab = 'daily' | 'driver';

// Variables

const store = useStore();
const intervalId = ref(-1);

let data = reactive({
  tabs: [
    {
      name: 'daily',
      title: 'STATYSTYKI DNIA',
      disabled: false,
    },
    {
      name: 'driver',
      title: 'STATYSTYKI GRACZA',
      disabled: true,
    },
  ] as { name: TStatTab; title: string; disabled: boolean }[],
  stats: {
    totalTimetables: 0,
    distanceSum: 0,
    distanceAvg: 0,
    timetableAuthor: '',
    timetableDriver: '',
    timetableId: 0,
    timetableRouteDistance: 0,
    dispatcherName: '',
    dispatcherTimetablesCount: 0,
  } as ITimetablesDailyStats,
});

// Methods
function onTabButtonClick(tab: TStatTab, disabled: boolean) {
  if (!disabled) store.currentStatsTab = tab;
}

async function fetchDailyTimetableStats() {
  console.log('test');

  try {
    const {
      distanceAvg,
      distanceSum,
      maxTimetable,
      totalTimetables,
      mostActiveDispatcher,
    }: ITimetablesDailyStatsResponse = await (
      await axios.get(`${URLs.stacjownikAPI}/api/getDailyTimetableStats`)
    ).data;

    data.stats = {
      totalTimetables,
      distanceSum,
      distanceAvg,
      timetableAuthor: maxTimetable?.authorName || '',
      timetableDriver: maxTimetable?.driverName || '',
      timetableId: maxTimetable?.timetableId || 0,
      timetableRouteDistance: maxTimetable?.routeDistance || 0,
      dispatcherName: mostActiveDispatcher?.name || '',
      dispatcherTimetablesCount: mostActiveDispatcher?.count || 0,
    };
  } catch (error) {
    console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
  }
}
// Translation

const { t } = useI18n();

const totalTimetables = computed(() =>
  t('journal.timetables-stats-total', { count: data.stats.totalTimetables, distance: data.stats.distanceSum })
);

const longestTimetable = computed(() =>
  t('journal.timetable-stats-longest', {
    id: data.stats.timetableId,
    author: data.stats.timetableAuthor,
    driver: data.stats.timetableDriver,
    distance: data.stats.timetableRouteDistance,
  })
);

const mostActiveDispatcher = computed(() =>
  t('journal.timetable-stats-most-active', {
    dispatcher: data.stats.dispatcherName,
    count: data.stats.dispatcherTimetablesCount,
  })
);

const timetablesStats = computed(
  () => `&bull; ${totalTimetables.value}<br>&bull; ${longestTimetable.value}<br>&bull; ${mostActiveDispatcher.value}`
);

// Hooks & watchers

watch(
  computed(() => store.driverStatsData),
  (stats) => {
    data.tabs[1].disabled = stats ? false : true;
  }
);

onActivated(() => {
  fetchDailyTimetableStats();
  intervalId.value = setInterval(fetchDailyTimetableStats, 60000);
});

onDeactivated(() => {
  clearInterval(intervalId.value);
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
@import '../../styles/variables.scss';

.tabs {
  display: flex;
  gap: 0.5em;

  button {
    font-weight: bold;
    border-radius: 0.4em 0.4em 0 0;
    padding: 0.5em 0.75em;

    &[data-selected='true'] {
      color: $accentCol;
    }
  }
}

.timetables-stats {
  margin-bottom: 0.5em;
}
</style>

