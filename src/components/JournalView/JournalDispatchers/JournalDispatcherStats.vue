<template>
  <div class="journal-stats dispatcher" v-if="dispatcherName && stats">
    <span class="loading" v-if="!stats.issuedTimetables && !stats.services">
      {{ $t('journal.dispatcher-stats.empty') }}
    </span>

    <span v-else>
      <h3>
        <i18n-t keypath="journal.dispatcher-stats.title">
          <template #name>
            <span class="text--primary">{{ dispatcherName.toUpperCase() }}</span>
          </template>
        </i18n-t>
      </h3>

      <hr class="header-separator" />

      <div class="info-stats">
        <span class="stat-badge" v-if="stats.services">
          <span>{{ $t('journal.dispatcher-stats.services-count') }}</span>
          <span>{{ stats.services.count }}</span>
        </span>

        <span class="stat-badge" v-if="stats.services">
          <span>{{ $t('journal.dispatcher-stats.service-max') }}</span>
          <span>{{ calculateDuration(stats.services.durationMax) }}</span>
        </span>

        <span class="stat-badge" v-if="stats.services">
          <span>{{ $t('journal.dispatcher-stats.service-avg') }}</span>
          <span>{{ calculateDuration(stats.services.durationAvg) }}</span>
        </span>
      </div>

      <hr class="section-separator" />

      <div class="info-stats">
        <span class="stat-badge" v-if="stats.issuedTimetables">
          <span>{{ $t('journal.dispatcher-stats.timetables-count') }}</span>
          <span>{{ stats.issuedTimetables.count }}</span>
        </span>

        <span class="stat-badge" v-if="stats.issuedTimetables">
          <span>{{ $t('journal.dispatcher-stats.timetables-sum') }}</span>
          <span>{{ stats.issuedTimetables.distanceSum.toFixed(2) }}km</span>
        </span>

        <span class="stat-badge" v-if="stats.issuedTimetables">
          <span>{{ $t('journal.dispatcher-stats.timetables-max') }}</span>
          <span>{{ stats.issuedTimetables.distanceMax.toFixed(2) }}km</span>
        </span>

        <span class="stat-badge" v-if="stats.issuedTimetables">
          <span>{{ $t('journal.dispatcher-stats.timetables-avg') }}</span>
          <span>{{ stats.issuedTimetables.distanceAvg.toFixed(2) }}km</span>
        </span>
      </div>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import { useMainStore } from '../../../store/mainStore';

export default defineComponent({
  name: 'journal-dispatcher-stats',

  mixins: [dateMixin],

  setup() {
    const store = useMainStore();

    return {
      stats: store.dispatcherStatsData,
      dispatcherName: store.dispatcherStatsName
    };
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/JournalStats.scss';
</style>
