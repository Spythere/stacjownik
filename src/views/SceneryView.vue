<template>
  <div class="scenery-view">
    <div class="scenery-offline" v-if="!stationInfo && isDataLoaded && isComponentVisible">
      <div>{{ $t('scenery.no-scenery') }}</div>

      <action-button>
        <router-link to="/">{{ $t('scenery.return-btn') }}</router-link>
      </action-button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo" ref="card-wrapper">
      <button v-if="!timetableOnly" class="back-btn btn btn--image" :title="$t('scenery.return-btn')" @click="navigateTo('/')">
        <img :src="icons.back" alt="Back to scenery" />
      </button>

      <button
        v-if="!timetableOnly"
        class="history-btn btn btn--image"
        @click="setCardViewMode(viewMode == 'history' ? 'info' : 'history')"
        :title="viewMode == 'history' ? $t('scenery.info-btn') : $t('scenery.history-btn')"
      >
        <img :src="viewMode == 'history' ? icons.user : icons.history" alt="icon" />
      </button>

      <SceneryHeader :station="stationInfo" />

      <div v-if="viewMode == 'info'">
        <SceneryInfo :station="stationInfo" :timetableOnly="timetableOnly" />
        <SceneryTimetable :station="stationInfo" :timetableOnly="timetableOnly" />
      </div>

      <div v-else-if="viewMode == 'history'">
        <SceneryHistory :name="stationInfo.name" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { StoreData } from '@/scripts/interfaces/StoreData';
import { DataStatus } from '@/scripts/enums/DataStatus';

import SceneryInfo from '@/components/SceneryView/SceneryInfo.vue';
import SceneryTimetable from '@/components/SceneryView/SceneryTimetable.vue';
import SceneryHistory from '@/components/SceneryView/SceneryHistory.vue';
import SceneryHeader from '@/components/SceneryView/SceneryHeader.vue';

import ActionButton from '@/components/Global/ActionButton.vue';

import { computed, ComputedRef, defineComponent } from '@vue/runtime-core';
import { useStore } from '@/store';
import { GETTERS } from '@/constants/storeConstants';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: { SceneryInfo, SceneryTimetable, SceneryHistory, ActionButton, SceneryHeader },

  data: () => ({
    icons: {
      history: require('@/assets/icon-history.svg'),
      user: require('@/assets/icon-user.svg'),
      back: require('@/assets/icon-back.svg'),
    },

    cardHeight: 0,

    viewMode: 'info',
  }),

  setup() {
    const route = useRoute();
    const store = useStore();

    const data: ComputedRef<StoreData> = computed(() => store.getters[GETTERS.allData]);

    const timetableOnly = computed(() => (route.query['timetable_only'] == '1' ? true : false));

    const isComponentVisible = computed(() => route.path === '/scenery');

    const isDataLoaded = computed(() => data.value.dataConnectionStatus === DataStatus.Loaded);

    const stationInfo = computed(() =>
      data.value.stationList.find((station) => station.name === route.query.station?.toString().replace(/_/g, ' '))
    );

    return {
      data,
      timetableOnly,
      isComponentVisible,
      isDataLoaded,
      stationInfo,
    };
  },

  methods: {
    setCardViewMode(mode: string) {
      this.viewMode = mode;
    },

    navigateTo(path: string) {
      this.$router.push(path);
    }
  },

  mounted() {
    this.cardHeight = (this.$refs['card-wrapper'] as HTMLElement).getBoundingClientRect().height;
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';
@import '../styles/variables.scss';

$sceneryBgCol: #333;

.scenery {
  &-view {
    min-height: 100%;

    display: flex;
    justify-content: center;
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

  &-wrapper {
    position: relative;

    width: 75%;
    max-width: 950px;


    @include midScreen {
      width: 95%;
    }

    background: $sceneryBgCol;
    padding: 1em;
    margin: 1rem 0;

    border-radius: 1.5em;

    text-align: center;
  }
}

button.btn {
  position: absolute;
  padding: 0.25em;

  top: 0.5em;
  img {
    width: 2em;
  }
}

button.history-btn {
  right: 0.5em;
}

button.back-btn {
  left: 0.5em;
}
</style>
