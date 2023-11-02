<template>
  <section class="info-header">
    <a class="scenery-name" :href="station.generalInfo?.url" target="_blank">
      {{ station.name }}
    </a>

    <div class="scenery-abbrev">
      {{ $t('scenery.abbrev') }} <b>{{ station.generalInfo?.abbr }}</b>
    </div>

    <div class="scenery-hash" v-if="onlineScenery?.hash">#{{ onlineScenery.hash }}</div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import Station from '../../scripts/interfaces/Station';
import { OnlineScenery } from '../../scripts/interfaces/store/storeTypes';

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    },

    onlineScenery: {
      type: Object as PropType<OnlineScenery>,
      required: false
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';
@import '../../styles/responsive.scss';

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
