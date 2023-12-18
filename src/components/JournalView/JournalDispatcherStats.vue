<template>
  <div
    class="journal-stats dispatcher"
    v-if="store.dispatcherStatsName && store.dispatcherStatsData"
  >
    <span
      class="loading"
      v-if="!store.dispatcherStatsData.issuedTimetables || !store.dispatcherStatsData.services"
    >
      Ten dyżurny nie ma jeszcze szczegółowych statystyk!
    </span>

    <span v-else>
      <h3>
        <i18n-t keypath="journal.dispatcher-stats-title">
          <template #name>
            <span class="text--primary">{{ store.dispatcherStatsName.toUpperCase() }}</span>
          </template>
        </i18n-t>
      </h3>

      <hr class="header-separator" />

      <div class="info-stats">
        <span class="stat-badge">
          <span>DYŻURY</span>
          <span>{{ store.dispatcherStatsData.services.count }}</span>
        </span>
        <span class="stat-badge">
          <span>WYSTAWIONE RJ</span>
          <span>{{ store.dispatcherStatsData.issuedTimetables.count }}</span>
        </span>
        <span class="stat-badge">
          <span>MAKS. CZAS DYŻURU</span>
          <span>{{ calculateDuration(store.dispatcherStatsData.services.durationMax) }}</span>
        </span>
        <span class="stat-badge">
          <span>ŚREDNI CZAS DYŻURU</span>
          <span>{{ calculateDuration(store.dispatcherStatsData.services.durationAvg) }}</span>
        </span>
        <span class="stat-badge">
          <span>SUMA WYSTAWIONYCH RJ</span>
          <span>{{ store.dispatcherStatsData.issuedTimetables.distanceSum.toFixed(2) }}km</span>
        </span>
        <span class="stat-badge">
          <span>NAJDŁUŻSZY WYSTAWIONY RJ</span>
          <span>{{ store.dispatcherStatsData.issuedTimetables.distanceMax.toFixed(2) }}km</span>
        </span>
        <span class="stat-badge">
          <span>ŚREDNIA WYSTAWIONYCH RJ</span>
          <span>{{ store.dispatcherStatsData.issuedTimetables.distanceAvg.toFixed(2) }}km</span>
        </span>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import dateMixin from '../../mixins/dateMixin';

export default defineComponent({
  name: 'journal-dispatcher-stats',

  mixins: [dateMixin],

  setup() {
    const store = useMainStore();

    return {
      store
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalStats.scss';
</style>
