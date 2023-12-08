<template>
  <div class="journal-stats" v-if="!store.isOffline">
    <div class="stats-buttons">
      <button
        v-for="button in data.statsButtons"
        :key="button.name"
        class="btn--filled btn--image"
        :data-selected="button.name == currentStatsTab"
        @click="onTabButtonClick(button.name)"
      >
        <img
          v-if="button.iconName"
          :src="`/images/icon-${button.iconName}.svg`"
          :alt="button.iconName"
        />
        {{ $t(button.localeKey) }}
      </button>
    </div>

    <div class="stats-tab" v-show="currentStatsTab !== null">
      <keep-alive>
        <JournalDailyStats v-if="currentStatsTab == 'journal-daily-stats'" />
        <JournalDriverStats v-else-if="currentStatsTab == 'journal-driver-stats'" />
      </keep-alive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, Ref, ref, watch } from 'vue';
import { useStore } from '../../store/mainStore';
import JournalDailyStats from './JournalDailyStats.vue';
import JournalDriverStats from './JournalDriverStats.vue';
import StorageManager from '../../managers/storageManager';

export type JournalStatsTab = 'journal-driver-stats' | 'journal-daily-stats';

const store = useStore();
const currentStatsTab: Ref<JournalStatsTab | null> = ref(null);

let data = reactive({
  statsButtons: [
    {
      name: 'journal-daily-stats',
      localeKey: 'journal.daily-stats-title',
      iconName: 'stats'
    },
    {
      name: 'journal-driver-stats',
      localeKey: 'journal.driver-stats-title',
      iconName: 'user'
    }
  ] as { name: JournalStatsTab; localeKey: string; iconName?: string }[]
});

function onTabButtonClick(tab: JournalStatsTab) {
  currentStatsTab.value = tab == currentStatsTab.value ? null : tab;
  StorageManager.setStringValue('journalStatsTab', currentStatsTab.value ?? '');
}

watch(
  computed(() => store.driverStatsData),
  (newData, prevData) => {
    currentStatsTab.value =
      JSON.stringify(prevData) !== JSON.stringify(newData) && newData !== undefined
        ? 'journal-driver-stats'
        : currentStatsTab.value;
  }
);

onMounted(() => {
  const storedTab = StorageManager.getStringValue('journalStatsTab');

  if (storedTab && storedTab !== '') currentStatsTab.value = storedTab as JournalStatsTab;
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
@import '../../styles/variables.scss';

.stats-buttons {
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
