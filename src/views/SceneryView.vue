<template>
  <div class="scenery-view">
    <div class="scenery-offline" v-if="!stationInfo && isComponentVisible && store.dataStatuses.sceneries == 2">
      <div>{{ $t('scenery.no-scenery') }}</div>

      <action-button>
        <router-link to="/">{{ $t('scenery.return-btn') }}</router-link>
      </action-button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo" ref="card-wrapper">
      <div class="scenery-left">
        <div class="scenery-actions">
          <button v-if="!timetableOnly" class="back-btn btn" :title="$t('scenery.return-btn')" @click="navigateTo('/')">
            <img :src="getIcon('back')" alt="Back to scenery" />
          </button>
        </div>

        <SceneryHeader :station="stationInfo" />
        <SceneryInfo :station="stationInfo" :timetableOnly="timetableOnly" />
      </div>

      <div class="scenery-right">
        <div class="info-actions">
          <button
            v-for="viewMode in viewModes"
            class="btn btn--option"
            @click="setViewMode(viewMode.component)"
            :data-checked="currentViewCompontent == viewMode.component"
          >
            {{ $t(viewMode.id) }}
          </button>
        </div>

        <keep-alive>
          <component :is="currentViewCompontent" :station="stationInfo" :key="currentViewCompontent"></component>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import routerMixin from '../mixins/routerMixin';
import { useStore } from '../store/store';
import SceneryInfo from '../components/SceneryView/SceneryInfo.vue';
import SceneryHeader from '../components/SceneryView/SceneryHeader.vue';
import SceneryTimetable from '../components/SceneryView/SceneryTimetable.vue';
import SceneryTimetablesHistory from '../components/SceneryView/SceneryTimetablesHistory.vue';
import SceneryDispatchersHistory from '../components/SceneryView/SceneryDispatchersHistory.vue';
import ActionButton from '../components/Global/ActionButton.vue';
import imageMixin from '../mixins/imageMixin';

enum SceneryViewMode {
  'TIMETABLES_ACTIVE',
  'TIMETABLES_HISTORY',
  'SCENERY_HISTORY',
}

export default defineComponent({
  components: {
    SceneryInfo,
    SceneryTimetable,
    ActionButton,
    SceneryHeader,
    SceneryTimetablesHistory,
    SceneryDispatchersHistory,
  },
  mixins: [routerMixin, imageMixin],
  data: () => ({
    viewModes: [
      {
        id: 'scenery.option-active-timetables',
        component: 'SceneryTimetable',
      },
      {
        id: 'scenery.option-timetables-history',
        component: 'SceneryTimetablesHistory',
      },
      {
        id: 'scenery.option-dispatchers-history',
        component: 'SceneryDispatchersHistory',
      },
    ],
    sceneryViewMode: SceneryViewMode,
    selectedCheckpoint: '',
    currentViewCompontent: 'SceneryTimetable',
    onlineFrom: -1,
  }),
  activated() {
    this.loadSelectedCheckpoint();
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const timetableOnly = computed(() => (route.query['timetable_only'] == '1' ? true : false));
    const isComponentVisible = computed(() => route.path === '/scenery');
    const stationInfo = computed(() => {
      return store.stationList.find((station) => station.name === route.query.station?.toString().replace(/_/g, ' '));
    });
    return {
      timetableOnly,
      isComponentVisible,
      stationInfo,
      store,
    };
  },
  methods: {
    setViewMode(componentName: string) {
      this.currentViewCompontent = componentName;
    },
    loadSelectedCheckpoint() {
      if (!this.stationInfo?.generalInfo?.checkpoints) return;
      if (this.stationInfo.generalInfo.checkpoints.length == 0) return;
      this.selectedCheckpoint = this.stationInfo.generalInfo.checkpoints[0].checkpointName;
    },
    selectCheckpoint(cp: { checkpointName: string }) {
      this.selectedCheckpoint = cp.checkpointName;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';
@import '../styles/variables.scss';

button.back-btn {
  img {
    width: 2em;
  }
}

.scenery {
  &-view {
    display: flex;
    justify-content: center;

    min-height: 100vh;
  }

  &-offline {
    align-self: center;
    text-align: center;
    padding: 2em 1em;

    color: $warningCol;

    display: inline-block;

    font-size: 1.5em;

    button {
      margin: 1em auto;
    }
  }
}

.scenery-wrapper {
  display: grid;
  grid-template-columns: 4fr 5fr;
  gap: 0 1em;

  position: relative;

  width: 100%;
  max-width: 1700px;

  margin: 1rem 0;

  text-align: center;
}

.scenery-left {
  position: relative;
  background-color: #181818;
  padding: 1em 0.5em;

  height: 95vh;
  min-height: 550px;
  max-height: 1000px;

  overflow: auto;

  display: flex;
  flex-direction: column;
}

.scenery-right {
  background: #181818;
  padding: 2em 0.5em;

  height: 95vh;
  min-height: 550px;
  max-height: 1000px;

  display: grid;
  grid-template-rows: auto 1fr;
  gap: 1em;
}

.scenery-actions {
  display: flex;
}

.info-actions {
  display: flex;
  justify-content: center;
  align-items: center;

  .btn {
    margin: 0.5em;
    padding: 0.5em;
    box-shadow: 0 0 10px 4px #242424;

    &[data-checked='true'] {
      color: var(--clr-primary);
      font-weight: bold;
    }
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
      color: $accentCol;
    }

    &:not(:last-child)::after {
      margin: 0 0.5em;
      content: '•';
      color: white;
    }
  }
}

@include midScreen {
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
    height: auto;
  }
}

@include smallScreen {
  .scenery-left {
    max-height: 100vh;
  }

  .scenery-right {
    height: 100vh;
  }
}
</style>
