<template>
  <div
    class="journal-stats dispatcher"
    v-if="store.dispatcherStatsName && store.dispatcherStatsData"
  >
    <span class="loading" v-if="!store.dispatcherStatsData._count._all">
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
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  name: 'journal-dispatcher-stats',

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
