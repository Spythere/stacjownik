<template>
  <div class="journal-stats">
    <div class="tabs">
      <button
        v-for="tab in data.tabs"
        class="btn--filled"
        :data-selected="tab.name == store.currentStatsTab && areStatsOpen"
        :data-inactive="tab.inactive"
        @click="onTabButtonClick(tab.name)"
      >
        {{ $t(tab.titlePath) }}
      </button>
    </div>

    <div class="stats-tab" v-show="areStatsOpen">
      <keep-alive>
        <JournalDailyStats v-if="store.currentStatsTab == 'daily'" ref="dailyStatsComp" />
        <JournalDriverStats v-else-if="store.currentStatsTab == 'driver'" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, KeepAlive, onActivated, onDeactivated, reactive, Ref, ref, watch } from 'vue';
import { useStore } from '../../store/store';
import JournalDailyStats from './DailyStats.vue';
import JournalDriverStats from './JournalDriverStats.vue';

// Types
type TStatTab = 'daily' | 'driver';

// Variables

const store = useStore();
const dailyStatsComp: Ref<InstanceType<typeof JournalDailyStats> | null> = ref(null);

const areStatsOpen = ref(true);
const lastClickedTab = ref('');

let data = reactive({
  tabs: [
    {
      name: 'daily',
      titlePath: 'journal.daily-stats-title',
    },
    {
      name: 'driver',
      titlePath: 'journal.driver-stats-title',
      inactive: true,
    },
  ] as { name: TStatTab; titlePath: string; inactive?: boolean }[],
});

// Methods
function onTabButtonClick(tab: TStatTab) {
  if (lastClickedTab.value == tab || !areStatsOpen.value) {
    areStatsOpen.value = !areStatsOpen.value;
  }

  store.currentStatsTab = tab;
  lastClickedTab.value = tab;
}

onActivated(() => {
  dailyStatsComp.value?.startFetchingDailyStats();
});

onDeactivated(() => {
  dailyStatsComp.value?.stopFetchingDailyStats();
});

watch(
  computed(() => store.driverStatsData),
  (statsData) => {
    data.tabs[1].inactive = statsData ? false : true;

    lastClickedTab.value = statsData ? 'driver' : 'daily';
    if (statsData) areStatsOpen.value = true;
  }
);
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
@import '../../styles/variables.scss';

.tabs {
  position: relative;

  display: flex;
  gap: 0.5em;

  margin-bottom: 0.5em;

  button {
    font-weight: bold;
    padding: 0.5em 0.75em;

    &[data-inactive='true'] {
      color: gray;
    }

    &[data-selected='true'] {
      color: $accentCol;
    }
  }
}
</style>

