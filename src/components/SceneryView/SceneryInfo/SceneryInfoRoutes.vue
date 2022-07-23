<template>
  <section class="info-routes" v-if="station.generalInfo">
    <div class="routes one-way" v-if="station.generalInfo.routes.oneWay.length > 0">
      <b>{{ $t('scenery.one-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in station.generalInfo.routes.oneWay"
          :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }"
        >
          {{ route.name }}
          <b v-if="route.SBL">SBL</b>
        </li>
      </ul>
    </div>

    <div class="routes two-way" v-if="station.generalInfo.routes.twoWay.length > 0">
      <b>{{ $t('scenery.two-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in station.generalInfo.routes.twoWay"
          :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }"
        >
          {{ route.name }} <b v-if="route.SBL">SBL</b>
        </li>
      </ul>
    </div>

    <!-- <div
      class="route-info"
      :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }"
      v-for="route in [...station.generalInfo.routes.oneWay, ...station.generalInfo.routes.twoWay].filter(
        (route) => route.name != '-'
      )"
      :key="route.name"
      :title="`Szlak ${route.name}: ${route.isInternal ? 'wewnętrzny' : 'zewnętrzny'}, ${
        route.tracks == 2 ? 'dwutorowy' : 'jednotorowy'
      }, ${route.catenary ? 'zelektryfikowany' : 'niezelektryfikowany'} z ${route.SBL ? 'SBL' : 'PBL'} ${
        route.TWB ? 'i blokadą dwukierunkową' : ''
      }`"
    > -->
    <!-- <span class="track-name">
        <b>{{ route.name }}</b>
      </span> -->
    <!--
      <span class="track-specs">
        {{ route.tracks }}tor
        <img v-if="route.catenary" :src="icons.trackCatenary" alt="icon track catenary" />
        <img v-else :src="icons.trackNoCatenary" alt="icon track no catenary" />

        <img v-if="route.TWB" :src="icons.trackTWB" alt="icon track twb" />
        <img v-if="route.SBL" :src="icons.trackSBL" alt="icon track sbl" />
      </span> -->
    <!-- </div> -->
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Station from '../../../scripts/interfaces/Station';

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
.info-routes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  margin: 1em 0;
}

.routes {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  padding: 0.25em;
}

ul.routes-list {
  margin: 0.45em 0.25em;
  display: flex;

  li {
    background-color: #007599;

    padding: 0.2em 0.25em;
    margin-left: 0.25em;

    &.no-catenary {
      background-color: #686868;
    }

    &.internal {
      text-decoration: underline;
    }

    b {
      color: var(--clr-primary);
    }
  }
}
</style>
