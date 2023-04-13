<template>
  <section class="info-header">
    <a class="scenery-name" :href="station.generalInfo?.url" target="_blank">
      {{ station.name }}
    </a>

    <div class="scenery-abbrev">{{ $t('scenery.abbrev') }} <b>{{ station.generalInfo?.abbr }}</b></div>

    <div class="scenery-hash" v-if="station.onlineInfo?.hash">#{{ station.onlineInfo.hash }}</div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Station from '../../scripts/interfaces/Station';

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
  font-size: 3em;

  text-transform: uppercase;
}

.scenery-abbrev {
  font-size: 1.3em;
  color: #aaa;
}

.scenery-hash {
  margin-top: 0.5em;
  color: #aaa;
  font-size: 1.2em;
}
</style>

