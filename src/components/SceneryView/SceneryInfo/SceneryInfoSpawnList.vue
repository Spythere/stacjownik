<template>
  <section class="info-spawn-list">
    <h3 class="spawn-header section-header">
      <img :src="icons.spawn" alt="icon-spawn" />
      &nbsp;{{ $t('scenery.spawns') }} &nbsp;
      <span class="text--primary">{{ station.onlineInfo?.spawns.length || '0' }}</span>
    </h3>

    <span v-if="station.onlineInfo">
      <span
        class="badge spawn"
        v-for="(spawn, i) in station.onlineInfo.spawns"
        :key="spawn.spawnName + station.onlineInfo?.dispatcherName + i"
      >
        <span class="spawn_name">{{ spawn.spawnName }}</span>
        <span class="spawn_length">{{ spawn.spawnLength }}m</span>
      </span>
    </span>

    <span class="badge spawn badge-none" v-if="!station.onlineInfo || station.onlineInfo.spawns.length == 0"
      >{{ $t('scenery.no-spawns') }}
    </span>
  </section>
</template>

<script lang="ts">
import Station from '@/scripts/interfaces/Station';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },

  data: () => ({
    icons: {
      spawn: require('@/assets/icon-spawn.svg'),
    },
  }),
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';

.spawn {
  &_length {
    background: $accentCol;
    color: black;
  }
}
</style>
