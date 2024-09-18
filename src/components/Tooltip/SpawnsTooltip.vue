<template>
  <div class="tooltip-content" v-if="spawns.length != 0">
    <span v-for="(spawn, i) in spawns">
      <template v-if="i > 0"> | </template>
      <b>{{ spawn.spawnName }}</b> ({{ spawn.spawnLength }}m)
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import { ScenerySpawn } from '../../typings/common';

export default defineComponent({
  data() {
    return {
      tooltipStore: useTooltipStore()
    };
  },

  computed: {
    spawns() {
      if (this.tooltipStore.content == '') return [];

      const parsedSpawns = JSON.parse(this.tooltipStore.content) as ScenerySpawn[];
      return parsedSpawns ?? [];
    }
  }
});
</script>

<style scoped>
.tooltip-content {
  width: 200px;

  padding: 0.25em 0.5em;
  border-radius: 0.25em;

  background-color: #1b1b1b;
  box-shadow: 0 0 5px 2px #aaa;
}
</style>
