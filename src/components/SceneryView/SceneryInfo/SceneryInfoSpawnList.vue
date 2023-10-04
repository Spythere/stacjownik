<template>
  <section class="info-spawn-list">
    <h3 class="spawn-header section-header">
      <img :src="getIcon('spawn')" alt="icon-spawn" />
      &nbsp;{{ $t('scenery.spawns') }} &nbsp;
      <span class="text--primary">{{ station.onlineInfo?.spawns.length || '0' }}</span>
    </h3>

    <span v-if="station.onlineInfo">
      <span
        class="badge spawn"
        v-for="(spawn, i) in sortedSpawns"
        :key="spawn.spawnName + station.onlineInfo?.dispatcherName + i"
        :data-electrified="spawn.isElectrified"
      >
        <span class="spawn_name">{{ spawn.spawnName }}</span>
        <span class="spawn_length">{{ spawn.spawnLength }}m</span>
      </span>
    </span>

    <span
      class="badge spawn badge-none"
      v-if="!station.onlineInfo || station.onlineInfo.spawns.length == 0"
      >{{ $t('scenery.no-spawns') }}
    </span>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import imageMixin from '../../../mixins/imageMixin';
import Station from '../../../scripts/interfaces/Station';

export default defineComponent({
  mixins: [imageMixin],

  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    }
  },

  computed: {
    sortedSpawns() {
      if (!this.station.onlineInfo) return [];

      return [...this.station.onlineInfo.spawns].sort((s1, s2) =>
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
