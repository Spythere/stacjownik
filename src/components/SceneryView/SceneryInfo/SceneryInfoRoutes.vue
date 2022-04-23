<template>
  <section class="info-routes" v-if="station.generalInfo">
    <div
      class="route-info"
      :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }"
      v-for="route in [...station.generalInfo.routes.oneWay, ...station.generalInfo.routes.twoWay].filter(
        (route) => route.name != '-'
      )"
      :key="route.name"
      :title="
        `Szlak ${route.name}: ${route.isInternal ? 'wewnętrzny' : 'zewnętrzny'}, ${
          route.tracks == 2 ? 'dwutorowy' : 'jednotorowy'
        }, ${route.catenary ? 'zelektryfikowany' : 'niezelektryfikowany'} z ${route.SBL ? 'SBL' : 'PBL'} ${
          route.TWB ? 'i blokadą dwukierunkową' : ''
        }`
      "
    >
      <span class="track-name">
        <b>{{ route.name }}</b>
      </span>

      <span class="track-specs">
        {{ route.tracks }}tor
        <img v-if="route.catenary" :src="icons.trackCatenary" alt="icon track catenary" />
        <img v-else :src="icons.trackNoCatenary" alt="icon track no catenary" />

        <img v-if="route.TWB" :src="icons.trackTWB" alt="icon track twb" />
        <img v-if="route.SBL" :src="icons.trackSBL" alt="icon track sbl" />
      </span>
    </div>
  </section>
</template>

<script lang="ts">
import Station from '@/scripts/interfaces/Station';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },

  data() {
    return {
      icons: {
        trackTWB: require('@/assets/icon-track-twb.svg'),
        trackSBL: require('@/assets/icon-track-sbl.svg'),
        trackCatenary: require('@/assets/icon-track-catenary.svg'),
        trackNoCatenary: require('@/assets/icon-track-nocatenary.svg'),
      },
    };
  },
});
</script>

<style lang="scss" scoped>
.info-routes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  padding: 1em 3em;
}

.route-info {
  margin: 0.45em 0.25em;
  font-size: 1.05em;
  cursor: help;

  span {
    height: 100%;
    background-color: #009dce;

    padding: 0.2em 0.25em;
  }

  &.no-catenary > span {
    background-color: #686868;
  }

  &.internal > .track-name {
    text-decoration: underline;
  }

  img {
    height: 1.2em;
    vertical-align: text-bottom;
  }
}
</style>
