<template>
  <section class="info-spawn-list">
    <h3 class="spawn-header">
      <img src="/images/icon-spawn.svg" alt="Open spawns icon" />
      &nbsp;{{ $t('scenery.spawns') }} &nbsp;
      <span class="text--primary">{{ onlineScenery?.spawns.length || '0' }}</span>
    </h3>

    <transition-group name="spawns-anim" tag="ul">
      <li
        class="badge badge-none"
        v-if="!onlineScenery || onlineScenery.spawns.length == 0"
        key="no-spawns"
      >
        {{ $t('scenery.no-spawns') }}
      </li>

      <li
        class="badge spawn-badge"
        v-for="(spawn, i) in sortedSpawns"
        :key="spawn.spawnName + onlineScenery?.dispatcherName + i"
        :data-electrified="spawn.isElectrified"
      >
        <span class="name">{{ spawn.spawnName }}</span>
        <span class="length">{{ spawn.spawnLength }}m</span>
      </li>
    </transition-group>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { ActiveScenery } from '../../../typings/common';

export default defineComponent({
  props: {
    onlineScenery: {
      type: Object as PropType<ActiveScenery>,
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
@use '../../../styles/badge';

ul {
  position: relative;
}

h3.spawn-header {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.2em;
}

.spawns-anim {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 250ms ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }

  &-leave-active {
    position: absolute;
  }
}
</style>
