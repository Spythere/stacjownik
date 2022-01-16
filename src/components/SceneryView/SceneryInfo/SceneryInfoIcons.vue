<template>
  <section class="info-icons">
    <img
      v-if="station.generalInfo?.controlType"
      :src="require(`@/assets/icon-${station.generalInfo.controlType}.svg`)"
      :alt="station.generalInfo.controlType"
      :title="$t('desc.control-type') + $t(`controls.${station.generalInfo.controlType}`)"
    />

    <img
      v-if="station.generalInfo?.SUP"
      :src="require(`@/assets/icon-SUP.svg`)"
      alt="SUP (RASP-UZK)"
      :title="$t('desc.SUP')"
    />

    <img
      v-if="station.generalInfo?.signalType"
      :src="require(`@/assets/icon-${station.generalInfo.signalType}.svg`)"
      :alt="station.generalInfo.signalType"
      :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
    />

    <img
      v-if="station.generalInfo && station.generalInfo.SBL !== ''"
      :src="icons.SBL"
      :alt="$t('desc.SBL') + `${station.generalInfo.SBL}`"
      :title="$t('desc.SBL') + `${station.generalInfo.SBL}`"
    />

    <img
      v-if="station.generalInfo && station.generalInfo.TWB !== ''"
      :src="icons.TWB"
      alt="two way route blockade"
      :title="
        `${station.generalInfo.TWB === 'TAK' ? $t('desc.TWB-all') : $t('desc.TWB-routes') + station.generalInfo.TWB}`
      "
    />

    <img v-if="station.generalInfo?.default" :src="icons.td2" alt="default scenery" :title="$t('desc.default')" />

    <img
      v-if="station.generalInfo?.nonPublic"
      :src="icons.lock"
      alt="non public scenery"
      :title="$t('desc.non-public')"
    />

    <img
      v-if="station.generalInfo?.unavailable"
      :src="icons.unavailable"
      alt="icon unavailable"
      :title="$t('desc.unavailable')"
    />

    <img
      v-if="station.generalInfo && station.generalInfo.lines != ''"
      :src="icons.real"
      alt="real scenery"
      :title="`${$t('desc.real')} ${station.generalInfo.lines}`"
    />

    <img v-if="!station.generalInfo" :src="icons.unknown" alt="icon-unknown" :title="$t('desc.unknown')" />
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

  data: () => ({
    icons: {
      SBL: require('@/assets/icon-SBL.svg'),
      TWB: require('@/assets/icon-2way-block.svg'),
      td2: require('@/assets/icon-td2.svg'),
      lock: require('@/assets/icon-lock.svg'),
      unavailable: require('@/assets/icon-unavailable.svg'),
      unknown: require('@/assets/icon-unknown.svg'),

      real: require('@/assets/icon-real.svg'),
    },
  }),
});
</script>

<style lang="scss" scoped>
.info-icons {
  padding: 1em 0;

  img {
    width: 3.5em;
    margin: 0 0.5em;

    border: 2px solid #4e4e4e;
    border-radius: 0.5em;
  }
}
</style>
