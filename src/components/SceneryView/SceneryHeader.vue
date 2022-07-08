<template>
  <section class="info-header">
    <div class="scenery-name">
      <a v-if="station.generalInfo?.url" :href="station.generalInfo.url" target="_blank" rel="noopener noreferrer">
        {{ station.name }}
        <sup v-if="station.generalInfo?.project" style="color: salmon; font-size: 0.5em; vertical-align: text-top">
          {{ station.generalInfo.project }}
        </sup>
      </a>

      <span v-else>{{ station.name }}</span>
    </div>

    <div class="scenery-authors" v-if="station.generalInfo?.authors">
      Autorzy: {{ station.generalInfo?.authors?.join(', ') }}
    </div>
    <!-- <div class="scenery-hash" v-if="station.onlineInfo?.hash">#{{ station.onlineInfo.hash }}</div> -->
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

  text-transform: uppercase;

  @include smallScreen() {
    font-size: 2.75em;
  }
}

.scenery-hash {
  color: #aaa;
  font-size: 0.3em;

  position: absolute;
  top: 0;
}

.scenery-authors {
  color: #999;
}
</style>
