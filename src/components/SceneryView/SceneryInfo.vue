<template>
  <div class="scenery-info">
    <section>
      <div class="info-station-data" v-if="apiStore.dataStatuses.sceneries == Status.Data.Loaded">
        <SceneryInfoIcons :station="station" />
        <SceneryInfoGeneral :station="station" />
        <SceneryInfoRoutes v-if="station" :station="station" />
        <SceneryInfoAuthors :station="station" />
      </div>

      <div class="info-station-loading" v-else>
        <Loading />
      </div>

      <div class="info-divider"></div>

      <SceneryInfoDispatcher :onlineScenery="onlineScenery" />

      <div class="info-online-lists">
        <SceneryInfoUserList :onlineScenery="onlineScenery" :station="station" />
        <SceneryInfoSpawnList :onlineScenery="onlineScenery" />
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { ActiveScenery, Station, Status } from '../../typings/common';

import SceneryInfoDispatcher from './SceneryInfo/SceneryInfoDispatcher.vue';
import SceneryInfoIcons from './SceneryInfo/SceneryInfoIcons.vue';
import SceneryInfoUserList from './SceneryInfo/SceneryInfoUserList.vue';
import SceneryInfoSpawnList from './SceneryInfo/SceneryInfoSpawnList.vue';
import SceneryInfoRoutes from './SceneryInfo/SceneryInfoRoutes.vue';
import SceneryInfoGeneral from './SceneryInfo/SceneryInfoGeneral.vue';
import SceneryInfoAuthors from './SceneryInfo/SceneryInfoAuthors.vue';
import { useApiStore } from '../../store/apiStore';
import Loading from '../Global/Loading.vue';

const apiStore = useApiStore();

defineProps({
  station: {
    type: Object as PropType<Station>
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.info-station-loading {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 300px;
}

.info-online-lists {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  margin-top: 1em;
}

.info-divider {
  margin: 1em 0;
  height: 3px;
  background-color: #5b5b5b;
}

.scenery-topic a {
  font-weight: bold;
}
</style>
