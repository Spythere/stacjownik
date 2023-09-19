<template>
  <section class="info-stats" :class="!station.onlineInfo ? 'no-stats' : ''">
    <span class="likes">
      <img :src="getIcon('like')" alt="icon-like" />
      <span>{{ station.onlineInfo?.dispatcherRate || '0' }}</span>
    </span>

    <span class="users">
      <img :src="getIcon('user')" alt="icon-user" />
      <span>{{ station.onlineInfo?.currentUsers || '0' }}</span>
      /
      <span>{{ station.onlineInfo?.maxUsers || '0' }}</span>
    </span>

    <span class="spawns">
      <img :src="getIcon('spawn')" alt="icon-spawn" />
      <span>{{ station.onlineInfo?.spawns.length || '0' }}</span>
    </span>

    <span class="schedules">
      <img :src="getIcon('timetable')" alt="icon-timetable" />
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
import imageMixin from '../../../mixins/imageMixin';
import Station from '../../../scripts/interfaces/Station';

export default defineComponent({
  mixins: [imageMixin],
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },
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
