<template>
  <div class="scenery-info">
    <section v-if="!timetableOnly">
      <!-- info stats -->
      <!-- <scenery-info-stats :station="station" /> -->

      <!-- info icons -->
      <scenery-info-icons :station="station" />

      <!-- info routes -->
      <scenery-info-routes :station="station" />

      <!-- info dispatcher -->
      <scenery-info-dispatcher :station="station" :onlineFrom="onlineFrom" />

      <div class="info-lists">
        <!-- user list -->
        <scenery-info-user-list :station="station" />

        <!-- spawn list -->
        <scenery-info-spawn-list :station="station" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

import SceneryInfoDispatcher from './SceneryInfo/SceneryInfoDispatcher.vue';
import SceneryInfoIcons from './SceneryInfo/SceneryInfoIcons.vue';
import SceneryInfoStats from './SceneryInfo/SceneryInfoStats.vue';
import SceneryInfoUserList from './SceneryInfo/SceneryInfoUserList.vue';
import SceneryInfoSpawnList from './SceneryInfo/SceneryInfoSpawnList.vue';
import SceneryInfoRoutes from './SceneryInfo/SceneryInfoRoutes.vue';

import Station from '@/scripts/interfaces/Station';

export default defineComponent({
  components: {
    SceneryInfoDispatcher,
    SceneryInfoIcons,
    SceneryInfoStats,
    SceneryInfoUserList,
    SceneryInfoSpawnList,
    SceneryInfoRoutes,
  },
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },

    timetableOnly: Boolean,
  },

  data: () => ({
    onlineFrom: -1,
  }),
});
</script>

<style lang="scss">
@import '../../styles/responsive.scss';

h3.section-header {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.5em;

  img {
    width: 1.1em;
    margin-left: 0.5em;
  }
}

.info-lists {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 550px));
  justify-content: center;
}

.badge {
  font-weight: 600;

  display: inline-block;
  padding: 0;

  background: #585858;

  margin: 0.25em;

  span {
    display: inline-block;
    padding: 0.2em 0.4em;
  }

  &-none {
    font-weight: 600;

    padding: 0.2em 0.4em;
    background: firebrick;

    text-align: center;

    @include smallScreen() {
      font-size: 1em;
    }
  }
}
</style>
