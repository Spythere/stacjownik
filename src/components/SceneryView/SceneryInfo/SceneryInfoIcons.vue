<template>
  <section class="info-icons">
    <span
      v-if="station.generalInfo"
      class="scenery-icon icon-info"
      :class="station.generalInfo.controlType.replace('+', '-')"
      :title="$t('desc.control-type') + $t(`controls.${station.generalInfo.controlType}`)"
      v-html="getControlTypeAbbrev(station.generalInfo.controlType)"
    >
    </span>

    <img
      v-if="station.generalInfo?.SUP"
      class="icon-info"
      :src="require(`@/assets/icon-SUP.svg`)"
      alt="SUP (RASP-UZK)"
      :title="$t('desc.SUP')"
    />

    <img
      v-if="station.generalInfo?.signalType"
      class="icon-info"
      :src="require(`@/assets/icon-${station.generalInfo.signalType}.svg`)"
      :alt="station.generalInfo.signalType"
      :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
    />

    <img
      v-if="station.generalInfo?.availability == 'nonPublic'"
      class="icon-info"
      :src="icons.lock"
      alt="Non-public scenery"
      :title="$t('desc.non-public')"
    />

    <img
      v-if="station.generalInfo?.availability == 'unavailable'"
      class="icon-info"
      :src="icons.unavailable"
      alt="Unavailable scenery"
      :title="$t('desc.unavailable')"
    />

    <img
      v-if="station.generalInfo?.availability == 'abandoned'"
      class="icon-info"
      :src="icons.abandoned"
      alt="Abandoned scenery"
      :title="$t('desc.abandoned')"
    />

    <img
      v-if="station.generalInfo?.lines"
      class="icon-info"
      :src="icons.real"
      alt="real scenery"
      :title="`${$t('desc.real')} ${station.generalInfo.lines}`"
    />

    <img
      v-if="!station.generalInfo"
      class="icon-info"
      :src="icons.unknown"
      alt="icon-unknown"
      :title="$t('desc.unknown')"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import stationInfoMixin from '@/mixins/stationInfoMixin';

import Station from '@/scripts/interfaces/Station';

export default defineComponent({
  mixins: [stationInfoMixin],
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },

  data: () => ({
    icons: {
      td2: require('@/assets/icon-td2.svg'),
      lock: require('@/assets/icon-lock.svg'),
      unavailable: require('@/assets/icon-unavailable.svg'),
      unknown: require('@/assets/icon-unknown.svg'),
      abandoned: require('@/assets/icon-abandoned.svg'),

      real: require('@/assets/icon-real.svg'),
    },
  }),
});
</script>

<style lang="scss" scoped>
@import '../../../styles/icons.scss';
.info-icons {
  display: flex;
  justify-content: center;
}
.icon-info {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 3em;
  font-size: 1.2em;

  margin: 1em 0.5em;

  border: 2px solid #4e4e4e;
  border-radius: 0.5em;
}
</style>
