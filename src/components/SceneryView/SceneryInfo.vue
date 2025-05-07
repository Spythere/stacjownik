<template>
  <div class="scenery-info">
    <section>
      <SceneryInfoIcons :station="station" />
      <SceneryInfoGeneral :station="station" />
      <SceneryInfoRoutes v-if="station" :station="station" />
      <SceneryInfoAuthors :station="station" />

      <!-- Link to GeneraTOR app -->
      <section class="generator-app" v-if="onlineScenery">
        <a
          class="a-button btn--action btn--image"
          :href="`https://generator-td2.web.app/?sceneryId=${onlineScenery.name}|${onlineScenery.region}`"
          target="_blank"
        >
          <img src="/public/images/icon-gnr.svg" alt="GeneraTOR app icon" />
          {{ $t('scenery.gnr-link-content') }}
        </a>
      </section>

      <div style="margin: 1em 0; height: 2px; background-color: white"></div>

      <!-- info dispatcher -->
      <SceneryInfoDispatcher :onlineScenery="onlineScenery" />

      <div class="info-lists">
        <!-- user list -->
        <SceneryInfoUserList :onlineScenery="onlineScenery" :station="station" />

        <!-- spawn list -->
        <SceneryInfoSpawnList :onlineScenery="onlineScenery" />
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

import SceneryInfoDispatcher from './SceneryInfo/SceneryInfoDispatcher.vue';
import SceneryInfoIcons from './SceneryInfo/SceneryInfoIcons.vue';
import SceneryInfoUserList from './SceneryInfo/SceneryInfoUserList.vue';
import SceneryInfoSpawnList from './SceneryInfo/SceneryInfoSpawnList.vue';
import SceneryInfoRoutes from './SceneryInfo/SceneryInfoRoutes.vue';
import SceneryInfoGeneral from './SceneryInfo/SceneryInfoGeneral.vue';
import SceneryInfoAuthors from './SceneryInfo/SceneryInfoAuthors.vue';

import { ActiveScenery, Station } from '../../typings/common';

export default defineComponent({
  components: {
    SceneryInfoDispatcher,
    SceneryInfoGeneral,
    SceneryInfoIcons,
    SceneryInfoAuthors,
    SceneryInfoUserList,
    SceneryInfoSpawnList,
    SceneryInfoRoutes
  },
  props: {
    station: {
      type: Object as PropType<Station>
    },

    onlineScenery: {
      type: Object as PropType<ActiveScenery>
    }
  }
});
</script>

<style lang="scss">
@use '../../styles/responsive';
@use '../../styles/badge';

h3.section-header {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.2em;
}

.info-lists {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  margin-top: 1em;
}

.scenery-topic a {
  font-weight: bold;
}

.generator-app {
  margin-top: 2em;
}
</style>
