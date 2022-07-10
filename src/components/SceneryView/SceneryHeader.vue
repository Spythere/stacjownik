<template>
  <section class="info-header">
    <div class="scenery-name">
      <a v-if="station.generalInfo?.url" :href="station.generalInfo.url" target="_blank" rel="noopener noreferrer">
        {{ station.name }}
      </a>

      <span v-else>{{ station.name }}</span>
    </div>

    <div class="scenery-hash" v-if="station.onlineInfo?.hash">#{{ station.onlineInfo.hash }}</div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Station from '@/scripts/interfaces/Station';

export default defineComponent({
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';
@import '../../styles/responsive.scss';

.scenery-name {
  font-weight: bold;
  color: $accentCol;

  position: relative;

  font-size: 3.5em;
  padding: 0 0.5em;

  text-transform: uppercase;

  @include smallScreen() {
    font-size: 2.75em;
  }
}

.scenery-hash {
  color: #aaa;
  font-size: 1.2em;
}
</style>
