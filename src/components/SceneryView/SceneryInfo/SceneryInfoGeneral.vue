<template>
  <section class="info-general">
    <div v-if="station?.generalInfo === undefined">
      <b>{{ $t('scenery.no-data') }}</b>
    </div>

    <div v-else>
      <span>
        <b>{{ $t('availability.title') }}:</b>
        {{ $t(`availability.${station.generalInfo.availability}`) }}

        <span v-if="station.generalInfo.reqLevel > -1">
          -
          {{
            $t(
              'scenery.req-level',
              { lvl: station.generalInfo.reqLevel },
              station.generalInfo.reqLevel
            )
          }}
        </span>
      </span>

      <span>
        &bull; <b>{{ $t('controls.title') }}:</b>
        {{ $t(`controls.${station.generalInfo.controlType}`) }}
      </span>

      <span>
        &bull; <b>{{ $t('signals.title') }}:</b>
        {{ $t(`signals.${station.generalInfo.signalType}`) }}
      </span>

      <span v-if="station.generalInfo.lines">
        &bull; <b>{{ $t('scenery.lines-title') }}:</b> {{ station.generalInfo.lines }}
      </span>

      <span v-if="station.generalInfo.project">
        &bull; <b>{{ $t('scenery.project-title') }}: </b>
        <a
          style="color: salmon; text-decoration: underline; font-weight: bold"
          :href="station.generalInfo.projectUrl"
          target="_blank"
        >
          {{ station.generalInfo.project }}
        </a>
      </span>

      <span v-if="additionalTools.length != 0">
        &bull; <b>{{ $t('scenery.additional-tools-title') }}: </b>
        {{ additionalTools.join(', ') }}
      </span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Station } from '../../../typings/common';

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station>
    }
  },

  computed: {
    additionalTools() {
      if (this.$props.station?.generalInfo === undefined) return [];
      let tools = [];

      if (this.$props.station.generalInfo.SUP) tools.push('SUP');
      if (this.$props.station.generalInfo.ASDEK) tools.push('ASDEK');

      return tools;
    }
  }
});
</script>

<style lang="scss" scoped>
.info-general {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  div {
    margin: 0 0.15em;
  }
}
</style>
