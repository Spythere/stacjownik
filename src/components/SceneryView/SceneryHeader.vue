<template>
  <section class="info-header">
    <div class="scenery-name">
      <a v-if="station?.generalInfo" :href="station.generalInfo.url" target="_blank">
        {{ stationName.replace(/_/g, ' ') }}
      </a>

      <span v-else> {{ stationName.replace(/_/g, ' ') }}</span>
    </div>

    <div class="scenery-hash" v-if="onlineScenery?.hash">#{{ onlineScenery.hash }}</div>
  </section>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { ActiveScenery, Station } from '../../typings/common';

defineProps({
  station: {
    type: Object as PropType<Station>
  },

  stationName: {
    type: String,
    required: true
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use 'sass:color';

.info-header {
  padding: 0 1em;
  background-color: var(--clr-tile);
}

.scenery-name {
  font-weight: bold;
  font-size: 3em;

  text-align: center;

  text-transform: uppercase;
}

.scenery-hash {
  color: #aaa;
  font-size: 1.2em;
}

@include responsive.smallScreen {
  .scenery-name {
    font-size: 2.5em;
  }
}
</style>
