<template>
  <section class="info-header">
    <a class="scenery-name" :href="station?.generalInfo?.url" target="_blank">
      {{ stationName.replace(/_/g, ' ') }}
    </a>

    <div class="scenery-abbrev" v-if="station?.generalInfo?.abbr">
      {{ $t('scenery.abbrev') }} <b>{{ station.generalInfo.abbr }}</b>
    </div>

    <div class="scenery-hash" v-if="onlineScenery?.hash">#{{ onlineScenery.hash }}</div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { ActiveScenery, Station } from '../../typings/common';

export default defineComponent({
  props: {
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
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.info-header {
  margin-top: 1em;
}

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
