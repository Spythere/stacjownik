<template>
  <section class="info-header">
    <div class="scenery-name">
      <div v-if="station.generalInfo?.project" style="color: salmon; font-size: 0.6em; line-height: 0.7em;">
        {{ station.generalInfo.project }}
      </div>

      <a v-if="station.generalInfo?.url" :href="station.generalInfo.url" target="_blank" rel="noopener noreferrer">{{
        station.name
      }}</a>

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
@import '../../../styles/variables.scss';
@import '../../../styles/responsive.scss';


.info-header {
  padding: 2em 1em;

  & > .scenery-name {
    font-weight: bold;
    color: $accentCol;

    font-size: 3.5em;

    text-transform: uppercase;

    @include smallScreen() {
      font-size: 2.75em;
    }
  }

  & > .scenery-hash {
    line-height: 0.8em;
    color: #aaa;

    font-size: 1.5em;
  }
}
</style>
