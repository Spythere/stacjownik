<template>
  <div class="scenery-view">
    <div class="scenery-wrapper" ref="card-wrapper">
      <div class="scenery-left">
        <SceneryHeader
          :stationName="station"
          :station="stationInfo"
          :onlineScenery="onlineSceneryInfo"
        />

        <SceneryInfo :station="stationInfo" :onlineScenery="onlineSceneryInfo" />
      </div>

      <div class="scenery-right">
        <div class="info-actions">
          <button
            v-for="(viewMode, i) in viewModes"
            :key="i"
            class="btn btn--option"
            :class="{ checked: currentMode == viewMode.component.name }"
            @click="setViewMode(viewMode.component.name!)"
          >
            {{ $t(viewMode.id) }}
          </button>
        </div>

        <div
          v-if="
            apiStore.dataStatuses.sceneries == Status.Data.Loading ||
            apiStore.dataStatuses.connection == Status.Data.Loading
          "
        ></div>

        <keep-alive v-else>
          <component
            :is="currentViewComponent"
            :onlineScenery="onlineSceneryInfo"
            :station="stationInfo"
            :key="currentViewComponent.name"
          ></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '../store/mainStore';

import SceneryInfo from '../components/SceneryView/SceneryInfo.vue';
import SceneryHeader from '../components/SceneryView/SceneryHeader.vue';

import SceneryTimetable from '../components/SceneryView/SceneryTimetable.vue';
import SceneryTimetablesHistory from '../components/SceneryView/SceneryTimetablesHistory.vue';
import SceneryDispatchersHistory from '../components/SceneryView/SceneryDispatchersHistory.vue';

import { useApiStore } from '../store/apiStore';
import { Status } from '../typings/common';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  region: {
    type: String,
    required: false
  },

  station: {
    type: String,
    required: true
  }
});

const store = useMainStore();
const apiStore = useApiStore();

const viewModes = [
  {
    id: 'scenery.option-active-timetables',
    component: SceneryTimetable
  },
  {
    id: 'scenery.option-timetables-history',
    component: SceneryTimetablesHistory
  },
  {
    id: 'scenery.option-dispatchers-history',
    component: SceneryDispatchersHistory
  }
];

const currentMode = computed(() => {
  return route.query.view?.toString() ?? 'SceneryTimetable';
});

const currentViewComponent = computed(() => {
  return (
    viewModes.find((mode) => mode.component.name == currentMode.value)?.component ??
    SceneryTimetable
  );
});

const stationInfo = computed(() => {
  return store.stationList.find(
    (station) => station.name === props.station?.toString().replace(/_/g, ' ')
  );
});

const onlineSceneryInfo = computed(() => {
  return store.activeSceneryList.find(
    (scenery) =>
      scenery.name === props.station?.toString().replace(/_/g, ' ') &&
      scenery.region == store.region.id
  );
});

function setViewMode(componentName: string) {
  router.push({
    path: route.path,
    query: {
      ...route.query,
      view: componentName
    }
  });
}
</script>

<style lang="scss" scoped>
@use '../styles/responsive';

.scenery {
  &-view {
    display: flex;
    justify-content: center;
  }

  &-offline {
    align-self: center;
    text-align: center;
    padding: 2em 1em;

    color: var(--clr-warning);

    display: inline-block;

    font-size: 1.25em;

    button {
      margin: 1em auto;
    }
  }
}

.scenery-wrapper {
  display: grid;
  grid-template-columns: 4fr 6fr;
  gap: 0 1em;

  position: relative;

  max-width: var(--max-container-width);
  width: 100%;

  padding: 1rem 0;
  text-align: center;

  &[data-timetable-only='true'] {
    grid-template-columns: 1fr;
    max-width: 1000px;
  }
}

.scenery-left,
.scenery-right {
  position: relative;
  overflow: auto;

  background-color: #181818;
  border-radius: 0.5em;
  padding: 1em 0.5em;

  height: calc(100vh - 0.5em);
  min-height: 500px;
  max-height: 2000px;
}

.scenery-left {
  display: flex;
  flex-direction: column;
}

.scenery-right {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 1em;
}

.scenery-actions {
  display: flex;
}

.info-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75em;

  button {
    padding: 0.5em;
  }
}

.timetable-checkpoints {
  display: flex;
  justify-content: center;

  flex-wrap: wrap;
  font-size: 1.1em;
  margin: 0.75em 0;

  .checkpoint_item {
    &.current {
      font-weight: bold;
      color: var(--clr-primary);
    }

    &:not(:last-child)::after {
      margin: 0 0.5em;
      content: '•';
      color: white;
    }
  }
}

@include responsive.midScreen {
  .scenery-wrapper {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .scenery-left {
    border-radius: 1em;
    margin-bottom: 1em;
    height: auto;
  }

  .scenery-right {
    border-radius: 1em;
    height: 100vh;
  }
}

@include responsive.smallScreen {
  .scenery-left {
    max-height: 100vh;
  }

  .scenery-right {
    height: 100vh;
  }
}
</style>
