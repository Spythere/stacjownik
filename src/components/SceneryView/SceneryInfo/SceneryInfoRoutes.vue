<template>
  <section class="info-routes" v-if="station.generalInfo">
    <div class="routes one-way" v-if="oneWayRoutes.length > 0">
      <button
        class="routes-btn"
        @click="showInternalSingle = !showInternalSingle"
        data-tooltip-type="BaseTooltip"
        :data-tooltip-content="`${showInternalSingle ? $t('scenery.btn-hide-internal-routes') : $t('scenery.btn-show-internal-routes')}`"
      >
        <b>{{ $t('scenery.one-way-routes') }}</b>
        <i class="fa-solid" :class="`${showInternalSingle ? 'fa-eye' : 'fa-eye-slash'}`"></i>
      </button>

      <ul class="routes-list">
        <li v-for="route in oneWayRoutes" :key="route.routeName">
          <span :class="{ 'no-catenary': !route.isElectric, internal: route.isInternal }">
            {{ route.routeName }}</span
          >
          <span v-if="route.routeSpeed" class="speed">
            {{ route.routeSpeed }}
          </span>
          <span v-if="route.routeLength" class="length">
            {{ (route.routeLength / 1000).toFixed(1) + 'km' }}
          </span>
          <span v-if="route.isRouteSBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>

    <div class="routes two-way" v-if="twoWayRoutes.length > 0">
      <button
        class="routes-btn"
        @click="showInternalDouble = !showInternalDouble"
        data-tooltip-type="BaseTooltip"
        :data-tooltip-content="`${showInternalDouble ? $t('scenery.btn-hide-internal-routes') : $t('scenery.btn-show-internal-routes')}`"
      >
        <b>{{ $t('scenery.two-way-routes') }}</b>
        <i class="fa-solid" :class="`${showInternalDouble ? 'fa-eye' : 'fa-eye-slash'}`"></i>
      </button>

      <ul class="routes-list">
        <li v-for="route in twoWayRoutes" :key="route.routeName">
          <span :class="{ 'no-catenary': !route.isElectric, internal: route.isInternal }">
            {{ route.routeName }}
          </span>
          <span v-if="route.routeSpeed" class="speed">{{ route.routeSpeed }}</span>
          <span v-if="route.routeLength" class="length">
            {{ (route.routeLength / 1000).toFixed(1) + 'km' }}
          </span>
          <span v-if="route.isRouteSBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Station } from '../../../typings/common';

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    }
  },

  data() {
    return {
      showInternalSingle: false,
      showInternalDouble: false
    };
  },

  computed: {
    oneWayRoutes() {
      return (
        this.station.generalInfo?.routes.single
          .filter((r) => !r.isInternal || r.isInternal == this.showInternalSingle)
          .sort((r1, r2) => r1.routeName.localeCompare(r2.routeName)) ?? []
      );
    },

    twoWayRoutes() {
      return (
        this.station.generalInfo?.routes.double
          .filter((r) => !r.isInternal || r.isInternal == this.showInternalDouble)
          .sort((r1, r2) => r1.routeName.localeCompare(r2.routeName)) ?? []
      );
    }
  }
});
</script>

<style lang="scss" scoped>
.info-routes {
  display: flex;
  justify-content: center;
  flex-direction: column;

  margin: 1em 0;
}

.routes {
  padding: 0.25em;
}

.routes > button.routes-btn {
  margin: 0 auto;
  display: inline-block;

  i {
    margin-left: 0.5em;
    width: 1.25em;
    height: 1.25em;
  }
}

ul.routes-list {
  margin: 0.45em 0.25em;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  li {
    margin: 0.5em 0.25em;
    cursor: pointer;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    span {
      padding: 0.2em;
      background-color: #007599;
      font-weight: bold;

      &.no-catenary {
        background-color: #686868;
      }

      &.internal {
        text-decoration: underline;
      }

      &.speed {
        background-color: #404040;
        color: #cfcfcf;
      }

      &.length {
        background-color: #303030;
        color: #cfcfcf;
      }
      &.sbl {
        color: var(--clr-primary);
        background-color: #404040;
      }

      &:last-child {
        border-radius: 0 0.5em 0.5em 0;
      }

      &:first-child {
        border-radius: 0.5em 0 0 0.5em;
      }

      &:only-child {
        border-radius: 0.5em;
      }
    }
  }
}
</style>
