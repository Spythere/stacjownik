<template>
  <section class="info-routes" v-if="station.generalInfo">
    <div class="routes one-way" v-if="station.generalInfo.routes.oneWay.length > 0">
      <b>{{ $t('scenery.one-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in station.generalInfo.routes.oneWay"
          :key="route.name"
          @click="setActiveShowLength(route.name)"
        >
          <span :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }">
            {{ route.name }}</span
          >
          <span v-if="route.speed" class="speed">
            {{ activeShowLength.includes(route.name) ? route.length + 'm' : route.speed }}
          </span>
          <span v-if="route.SBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>

    <div class="routes two-way" v-if="station.generalInfo.routes.twoWay.length > 0">
      <b>{{ $t('scenery.two-way-routes') }}</b>

      <ul class="routes-list">
        <li
          v-for="route in station.generalInfo.routes.twoWay"
          :key="route.name"
          @click="setActiveShowLength(route.name)"
        >
          <span :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }">{{
            route.name
          }}</span>
          <span v-if="route.speed" class="speed">
            {{ activeShowLength.includes(route.name) ? route.length + 'm' : route.speed }}
          </span>
          <span v-if="route.SBL" class="sbl">SBL</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import Station from '../../../scripts/interfaces/Station';

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
