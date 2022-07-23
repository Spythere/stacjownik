<template>
  <section class="info-icons">
    <span
      v-if="station.generalInfo && station.generalInfo.reqLevel >= 0"
      class="scenery-icon icon-info level"
      :style="calculateExpStyle(station.generalInfo.reqLevel)"
    >
      {{ station.generalInfo.reqLevel >= 2 ? station.generalInfo.reqLevel : 'L' }}
    </span>

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
      :src="getIcon('SUP')"
      alt="SUP (RASP-UZK)"
      :title="$t('desc.SUP')"
    />

    <img
      v-if="station.generalInfo?.signalType"
      class="icon-info"
      :src="getIcon(station.generalInfo.signalType)"
      :alt="station.generalInfo.signalType"
      :title="$t('desc.signals-type') + $t(`signals.${station.generalInfo.signalType}`)"
    />

    <img
      v-if="station.generalInfo?.availability == 'nonPublic'"
      class="icon-info"
      :src="getIcon('lock')"
      alt="Non-public scenery"
      :title="$t('desc.non-public')"
    />

    <img
      v-if="station.generalInfo?.availability == 'unavailable'"
      class="icon-info"
      :src="getIcon('unavailable')"
      alt="Unavailable scenery"
      :title="$t('desc.unavailable')"
    />

    <img
      v-if="station.generalInfo?.availability == 'abandoned'"
      class="icon-info"
      :src="getIcon('abandoned')"
      alt="Abandoned scenery"
      :title="$t('desc.abandoned')"
    />

    <img
      v-if="station.generalInfo?.lines"
      class="icon-info"
      :src="getIcon('real')"
      alt="real scenery"
      :title="`${$t('desc.real')} ${station.generalInfo.lines}`"
    />

    <img
      v-if="!station.generalInfo"
      class="icon-info"
      :src="getImage('unknown.png')"
      alt="icon-unknown"
      :title="$t('desc.unknown')"
    />
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import imageMixin from '../../../mixins/imageMixin';
import stationInfoMixin from '../../../mixins/stationInfoMixin';
import styleMixin from '../../../mixins/styleMixin';
import Station from '../../../scripts/interfaces/Station';

export default defineComponent({
  mixins: [stationInfoMixin, styleMixin, imageMixin],
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../../styles/icons.scss';
.info-icons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  margin: 1em;
}
.icon-info {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 3em;
  margin: 0.25em;

  border: 2px solid #4e4e4e;
  border-radius: 0.5em;

  &.level {
    border-radius: 50%;
  }
}
</style>

