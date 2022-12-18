<template>
  <div class="journal-stats">
    <div class="tabs">
      <button
        v-for="tab in data.tabs"
        class="btn--filled"
        :data-selected="tab.name == store.currentStatsTab"
        @click="onTabButtonClick(tab.name)"
      >
        {{ $t(tab.titlePath) }}
      </button>
    </div>

    <div class="stats-tab">
      <keep-alive>
        <JournalDailyStats v-if="store.currentStatsTab == 'daily'" ref="dailyStatsComp" />
        <JournalDriverStats v-else-if="store.currentStatsTab == 'driver'" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onDeactivated, reactive, Ref, ref } from 'vue';
import { useStore } from '../../store/store';
import JournalDailyStats from './DailyStats.vue';
import JournalDriverStats from './JournalDriverStats.vue';

// Types
type TStatTab = 'daily' | 'driver';

// Variables

const store = useStore();
const dailyStatsComp: Ref<InstanceType<typeof JournalDailyStats> | null> = ref(null);

let data = reactive({
  tabs: [
    {
      name: 'daily',
      titlePath: 'journal.daily-stats-title',
    },
    {
      name: 'driver',
      titlePath: 'journal.driver-stats-title',
    },
  ] as { name: TStatTab; titlePath: string }[],
});

// Methods
function onTabButtonClick(tab: TStatTab) {
  store.currentStatsTab = tab;
}

onActivated(() => {
  dailyStatsComp.value?.startFetchingDailyStats();
});

onDeactivated(() => {
  dailyStatsComp.value?.stopFetchingDailyStats();
});

// Translation

// const { t } = useI18n();

// const totalTimetables = computed(() =>
//   t('journal.timetables-stats-total', { count: data.stats.totalTimetables, distance: data.stats.distanceSum })
// );

// const longestTimetable = computed(() =>
//   t('journal.timetable-stats-longest', {
//     id: data.stats.timetableId,
//     author: data.stats.timetableAuthor,
//     driver: data.stats.timetableDriver,
//     distance: data.stats.timetableRouteDistance,
//   })
// );

// const mostActiveDispatcher = computed(() =>
//   t('journal.timetable-stats-most-active', {
//     dispatcher: data.stats.dispatcherName,
//     count: data.stats.dispatcherTimetablesCount,
//   })
// );

// const timetablesStats = computed(
//   () => `&bull; ${totalTimetables.value}<br>&bull; ${longestTimetable.value}<br>&bull; ${mostActiveDispatcher.value}`
// );

// Hooks
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
</style>

