<template>
  <section class="info-spawn-list">
    <h3 class="spawn-header section-header">
      <img src="/images/icon-spawn.svg" alt="Open spawns icon" />
      &nbsp;{{ $t('scenery.spawns') }} &nbsp;
      <span class="text--primary">{{ onlineScenery?.spawns.length || '0' }}</span>
    </h3>

    <span v-if="onlineScenery">
      <span
        class="badge spawn"
        v-for="(spawn, i) in sortedSpawns"
        :key="spawn.spawnName + onlineScenery?.dispatcherName + i"
        :data-electrified="spawn.isElectrified"
      >
        <span class="spawn_name">{{ spawn.spawnName }}</span>
        <span class="spawn_length">{{ spawn.spawnLength }}m</span>
      </span>
    </span>

    <span class="badge spawn badge-none" v-if="!onlineScenery || onlineScenery.spawns.length == 0"
      >{{ $t('scenery.no-spawns') }}
    </span>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { OnlineScenery } from '../../../scripts/interfaces/store/storeTypes';

export default defineComponent({
  props: {
    onlineScenery: {
      type: Object as PropType<OnlineScenery>,
      required: false
    }
  },

  computed: {
    sortedSpawns() {
      if (!this.onlineScenery) return [];

      return [...this.onlineScenery.spawns].sort((s1, s2) =>
        s1.spawnLength < s2.spawnLength ? 1 : -1
      );
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';

.spawn {
  color: white;

  &_length {
    background-color: #404040;
    color: #cfcfcf;
  }

  &[data-electrified='true'] > &_name {
    background-color: #007599;
  }
}
</style>
