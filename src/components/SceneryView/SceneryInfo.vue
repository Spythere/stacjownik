<template>
  <div class="scenery-info">
    <section v-if="!timetableOnly">
      <div class="info-general" v-if="station.generalInfo">
        <scenery-info-icons :station="station" />

        <div class="general-list">
          <span>
            <b>{{ $t('availability.title') }}:</b> {{ $t(`availability.${station.generalInfo.availability}`) }}

            <span v-if="station.generalInfo.reqLevel > -1">
              - {{ $tc('scenery.req-level', station.generalInfo.reqLevel, { lvl: station.generalInfo.reqLevel }) }}
            </span>
          </span>

          <span>
            &bull; <b>{{ $t('controls.title') }}:</b> {{ $t(`controls.${station.generalInfo.controlType}`) }}
          </span>

          <span>
            &bull; <b>{{ $t('signals.title') }}:</b> {{ $t(`signals.${station.generalInfo.signalType}`) }}
          </span>

          <span v-if="station.generalInfo.lines">
            &bull; <b>{{ $t('scenery.lines-title') }}:</b> {{ station.generalInfo.lines }}
          </span>
          <span v-if="station.generalInfo.project">
            &bull; <b>{{ $t('scenery.project-title') }}: </b>
            <b style="color: salmon">{{ station.generalInfo.project }}</b>
          </span>
        </div>

        <scenery-info-routes :station="station" />

        <div class="scenery-authors" v-if="station.generalInfo.authors && station.generalInfo.authors.length > 0">
          <b> {{ $tc('scenery.authors-title', station.generalInfo.authors.length) }}: </b>
          {{ station.generalInfo.authors.join(', ') }}
        </div>

        <br />
        <div class="scenery-topic" v-if="station.generalInfo.url">
          <a :href="station.generalInfo.url" target="_blank">
            &gt; {{ $t('scenery.forum-topic', { name: station.name }) }} &lt;
          </a>
        </div>
      </div>

      <div style="margin: 2em 0; height: 2px; background-color: white" />

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
@import '../../styles/badge.scss';

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
  flex-wrap: wrap;
  justify-content: space-around;

  margin-top: 1em;
}

.info-general {
  margin-top: 1em;
  font-size: 1.1em;
}

.general-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  span {
    margin: 0 0.15em;
  }
}

.scenery-topic a {
  font-weight: bold;
}
</style>
