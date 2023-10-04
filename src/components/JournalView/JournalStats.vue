<template>
  <div class="journal-stats" v-if="!store.isOffline">
    <div class="tabs">
      <button
        v-for="tab in data.tabs"
        :key="tab.name"
        class="btn--filled"
        :data-selected="tab.name == store.currentStatsTab && areStatsOpen"
        :data-inactive="tab.inactive"
        :data-disabled="tab.inactive"
        :disabled="tab.inactive"
        @click="onTabButtonClick(tab.name)"
      >
        {{ $t(tab.titlePath) }}
      </button>
    </div>

    <div class="stats-tab" v-show="areStatsOpen">
      <keep-alive>
        <JournalDailyStats
          v-if="store.currentStatsTab == 'daily'"
          @toggleStatsOpen="toggleStatsOpen"
        />
        <JournalDriverStats v-else-if="store.currentStatsTab == 'driver'" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useStore } from '../../store/store';
import JournalDailyStats from './DailyStats.vue';
import JournalDriverStats from './JournalDriverStats.vue';
import StorageManager from '../../scripts/managers/storageManager';

// Types
type TStatTab = 'daily' | 'driver';

// Variables
const store = useStore();

const lastDailyStatsOpen = ref(false);
const areStatsOpen = ref(false);
const lastClickedTab: Ref<'daily' | 'driver' | null> = ref(null);

let data = reactive({
  tabs: [
    {
      name: 'daily',
      titlePath: 'journal.daily-stats-title'
    },
    {
      name: 'driver',
      titlePath: 'journal.driver-stats-title'
      // inactive: true,
    }
  ] as { name: TStatTab; titlePath: string; inactive?: boolean }[]
});

// Methods
function onTabButtonClick(tab: TStatTab) {
  if (lastClickedTab.value == tab || !areStatsOpen.value) areStatsOpen.value = !areStatsOpen.value;

  if (tab == 'daily') {
    StorageManager.setBooleanValue('dailyStatsOpen', areStatsOpen.value);
    lastDailyStatsOpen.value = areStatsOpen.value;
  }

  store.currentStatsTab = tab;
  lastClickedTab.value = tab;

  if (areStatsOpen.value == false) store.currentStatsTab = null;
}

function toggleStatsOpen(open: boolean) {
  areStatsOpen.value = open;
}

watch(
  computed(() => store.driverStatsData),
  (statsData) => {
    store.currentStatsTab = statsData ? 'driver' : lastClickedTab.value;
    areStatsOpen.value = statsData ? true : lastClickedTab.value !== null;
  }
);

onMounted(() => {
  if (StorageManager.getBooleanValue('dailyStatsOpen')) {
    areStatsOpen.value = true;
    store.currentStatsTab = 'daily';
  }
});
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
