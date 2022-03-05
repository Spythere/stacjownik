<template>
  <section class="info-stats" :class="!station.onlineInfo ? 'no-stats' : ''">
    <span class="likes">
      <img :src="icons.like" alt="icon-like" />
      <span>{{ station.onlineInfo?.dispatcherRate || '0' }}</span>
    </span>

    <span class="users">
      <img :src="icons.user" alt="icon-user" />
      <span>{{ station.onlineInfo?.currentUsers || '0' }}</span>
      /
      <span>{{ station.onlineInfo?.maxUsers || '0' }}</span>
    </span>

    <span class="spawns">
      <img :src="icons.spawn" alt="icon-spawn" />
      <span>{{ station.onlineInfo?.spawns.length || '0' }}</span>
    </span>

    <span class="schedules">
      <img :src="icons.timetable" alt="icon-timetable" />
      <span>
        <span style="color: #eee">{{ station.onlineInfo?.scheduledTrains?.length || '0' }}</span>
        /
        <span style="color: #bbb"
          >{{ station.onlineInfo?.scheduledTrains?.filter((train) => train.stopInfo.confirmed).length || '0' }}
        </span>
      </span>
    </span>
  </section>

  <section class="info-tracks" v-if="station.generalInfo">
    <div
      class="track-info"
      :class="{ 'no-catenary': !route.catenary, internal: route.isInternal }"
      v-for="route in [...station.generalInfo.routes.oneWay, ...station.generalInfo.routes.twoWay].filter(route => route.name != '-')"
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
        <img :src="require('@/assets/icon-track-catenary.svg')" alt="icon track catenary" v-if="route.catenary" />
        <img v-if="route.TWB" :src="require('@/assets/icon-track-twb.svg')" alt="icon track twb"/>
        <img v-if="route.SBL" :src="require('@/assets/icon-track-sbl.svg')" alt="icon track sbl"/>
      </span>
    </div>
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
      like: require('@/assets/icon-like.svg'),
      timetable: require('@/assets/icon-timetable.svg'),
      user: require('@/assets/icon-user.svg'),
      spawn: require('@/assets/icon-spawn.svg'),
    },
  }),
});
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';

.info-tracks {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  padding: 0 3em;
}

.track-info {
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

.train-specs {
}

.info-stats {
  padding: 1rem 0;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  font-size: 1.65em;

  &.no-stats {
    opacity: 0.5;
  }

  & > span {
    display: flex;
    align-items: center;

    margin: 0.3em;
  }

  .likes,
  .spawns {
    color: $accentCol;
  }

  span > img {
    width: 1.2em;
    margin-right: 0.5em;
  }
}
</style>
