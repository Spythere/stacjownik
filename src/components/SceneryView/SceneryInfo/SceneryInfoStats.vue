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
