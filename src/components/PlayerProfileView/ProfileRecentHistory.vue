<template>
  <div class="profile-recent-history">
    <h2 class="recent-history-header">
      <RotateCcwClockIcon :size="25" />
      {{ t('profile.recent-history.header') }}
    </h2>

    <ProfileChart
      v-if="journalStatus == Status.Data.Loaded"
      :playerName="playerName"
      :playerJournal="playerJournal"
      :journalStatus="journalStatus"
    />

    <ProfileHistoryList
      :playerName="playerName"
      :playerJournal="playerJournal"
      :journalStatus="journalStatus"
    />
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import ProfileChart from './ProfileChart.vue';
import ProfileHistoryList from './ProfileHistoryList.vue';
import { Status } from '@/typings/common.ts';
import { API } from '@/typings/api.ts';
import { useI18n } from 'vue-i18n';
import { RotateCcwClockIcon } from '@lucide/vue';

const { t } = useI18n();

const props = defineProps({
  playerName: {
    type: String
  },

  playerJournal: {
    type: Object as PropType<API.PlayerJournal.Data>
  },

  journalStatus: {
    type: Number as PropType<Status.Data>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.profile-recent-history {
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: auto;
  background-color: var(--clr-tile);
  border-radius: 0.5em;
}

.recent-history-header {
  display: flex;
  justify-content: center;
  align-items: center;

  gap: 0.25em;
  padding: 0.5em;
}
</style>
