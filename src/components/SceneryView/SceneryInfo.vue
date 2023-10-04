<template>
  <div class="scenery-info">
    <section v-if="!timetableOnly">
      <div class="scenery-info-general" v-if="station.generalInfo">
        <SceneryInfoIcons :station="station" />

        <div class="scenery-general-list">
          <span>
            <b>{{ $t('availability.title') }}:</b>
            {{ $t(`availability.${station.generalInfo.availability}`) }}

            <span v-if="station.generalInfo.reqLevel > -1">
              -
              {{
                $t(
                  'scenery.req-level',
                  { lvl: station.generalInfo.reqLevel },
                  station.generalInfo.reqLevel
                )
              }}
            </span>
          </span>

          <span>
            &bull; <b>{{ $t('controls.title') }}:</b>
            {{ $t(`controls.${station.generalInfo.controlType}`) }}
          </span>

          <span>
            &bull; <b>{{ $t('signals.title') }}:</b>
            {{ $t(`signals.${station.generalInfo.signalType}`) }}
          </span>

          <span v-if="station.generalInfo.lines">
            &bull; <b>{{ $t('scenery.lines-title') }}:</b> {{ station.generalInfo.lines }}
          </span>
          <span v-if="station.generalInfo.project">
            &bull; <b>{{ $t('scenery.project-title') }}: </b>
            <a
              style="color: salmon; text-decoration: underline; font-weight: bold"
              :href="station.generalInfo.projectUrl"
              target="_blank"
            >
              {{ station.generalInfo.project }}
            </a>
          </span>
        </div>

        <SceneryInfoRoutes :station="station" />

        <div
          class="scenery-authors"
          v-if="station.generalInfo.authors && station.generalInfo.authors.length > 0"
        >
          <b>
            {{
              $t(
                'scenery.authors-title',
                { authors: station.generalInfo.authors.length },
                station.generalInfo.authors.length
              )
            }}:
          </b>
          {{ station.generalInfo.authors.join(', ') }}
        </div>
      </div>

      <div style="margin: 2em 0; height: 2px; background-color: white"></div>

      <!-- info dispatcher -->
      <SceneryInfoDispatcher :station="station" :onlineFrom="onlineFrom" />

      <div class="info-lists">
        <!-- user list -->
        <SceneryInfoUserList :station="station" />

        <!-- spawn list -->
        <SceneryInfoSpawnList :station="station" />
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
import Station from '../../scripts/interfaces/Station';

export default defineComponent({
  components: {
    SceneryInfoDispatcher,
    SceneryInfoIcons,
    SceneryInfoUserList,
    SceneryInfoSpawnList,
    SceneryInfoRoutes
  },
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    },

    timetableOnly: Boolean
  },

  data: () => ({
    onlineFrom: -1
  })
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

  font-size: 1.2em;

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

.scenery-info-general {
  margin-top: 1em;
}

.scenery-general-list {
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
