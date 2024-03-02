<template>
  <section class="info-routes" v-if="station.generalInfo">
    <div class="routes one-way" v-if="filteredOneWayRoutes.length > 0">
      <b>{{ $t('scenery.one-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in filteredOneWayRoutes"
          :key="route.routeName"
          @click="setActiveShowLength(route.routeName)"
        >
          <span :class="{ 'no-catenary': !route.isElectric, internal: route.isInternal }">
            {{ route.routeName }}</span
          >
          <span v-if="route.routeSpeed" class="speed">
            {{
              activeShowLength.includes(route.routeName)
                ? route.routeLength + 'm'
                : route.routeSpeed
            }}
          </span>
          <span v-if="route.isRouteSBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>

    <div class="routes two-way" v-if="filteredTwoWayRoutes.length > 0">
      <b>{{ $t('scenery.two-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in filteredTwoWayRoutes"
          :key="route.routeName"
          @click="setActiveShowLength(route.routeName)"
        >
          <span :class="{ 'no-catenary': !route.isElectric, internal: route.isInternal }">{{
            route.routeName
          }}</span>
          <span v-if="route.routeSpeed" class="speed">
            {{
              activeShowLength.includes(route.routeName)
                ? route.routeLength + 'm'
                : route.routeSpeed
            }}
          </span>
          <span v-if="route.isRouteSBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import Station from '../../../scripts/interfaces/Station';
import { StationRoutesInfo } from '../../../store/typings';

const routeFilter = (route: StationRoutesInfo) => !route.hidden;

export default defineComponent({
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    }
  },

  methods: {
    setActiveShowLength(name: string) {
      if (this.activeShowLength.includes(name))
        this.activeShowLength.splice(this.activeShowLength.indexOf(name), 1);
      else this.activeShowLength.push(name);
    }
  },

  data() {
    return {
      activeShowLength: [] as string[]
    };
  },

  computed: {
    filteredOneWayRoutes() {
      return this.station.generalInfo?.routes.single.filter(routeFilter) || [];
    },

    filteredTwoWayRoutes() {
      return this.station.generalInfo?.routes.double.filter(routeFilter) || [];
    }
  }
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
  justify-content: center;
  flex-wrap: wrap;

  li {
    margin: 0.5em 0.25em;
    cursor: pointer;

    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    span {
      padding: 0.2em 0.25em;
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
