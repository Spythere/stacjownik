<template>
  <div class="scenery-info">
    <!-- info header -->
    <scenery-info-header :station="station" />

    <section v-if="!timetableOnly">
      <!-- info stats -->
      <scenery-info-stats :station="station" />
      <!-- info icons -->
      <scenery-info-icons :station="station" />

      <!-- info dispatcher -->
      <scenery-info-dispatcher :station="station" />
      
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
import { computed, defineComponent } from '@vue/runtime-core';

import SceneryInfoDispatcher from './SceneryInfo/SceneryInfoDispatcher.vue';
import SceneryInfoIcons from './SceneryInfo/SceneryInfoIcons.vue';
import SceneryInfoStats from './SceneryInfo/SceneryInfoStats.vue';
import SceneryInfoHeader from './SceneryInfo/SceneryInfoHeader.vue';
import SceneryInfoUserList from './SceneryInfo/SceneryInfoUserList.vue';
import SceneryInfoSpawnList from './SceneryInfo/SceneryInfoSpawnList.vue';

import Station from '@/scripts/interfaces/Station';

export default defineComponent({
  components: {
    SceneryInfoDispatcher,
    SceneryInfoIcons,
    SceneryInfoStats,
    SceneryInfoHeader,
    SceneryInfoUserList,
    SceneryInfoSpawnList,
  },
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },

    timetableOnly: Boolean,
  },
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
  display: flex;

  align-items: center;
  flex-direction: column;
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
