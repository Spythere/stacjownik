<template>
  <div class="scenery-view">
    <div class="scenery-offline" v-if="!stationInfo && isComponentVisible">
      <div>{{ $t('scenery.no-scenery') }}</div>

      <action-button>
        <router-link to="/">{{ $t('scenery.return-btn') }}</router-link>
      </action-button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo" ref="card-wrapper">
      <button
        v-if="!timetableOnly"
        class="back-btn btn btn--image"
        :title="$t('scenery.return-btn')"
        @click="navigateTo('/')"
      >
        <img :src="icons.back" alt="Back to scenery" />
      </button>

      <button
        v-if="!timetableOnly && currentRegion.id == 'eu' && stationInfo"
        class="history-btn btn btn--image"
        @click="
          navigateTo('/journal', {
            view: 'dispatchers',
            sceneryName: stationInfo?.name,
          })
        "
      >
        <img :src="viewMode == 'history' ? icons.user : icons.history" alt="icon" />
      </button>

      <SceneryHeader :station="stationInfo" />

      <SceneryInfo :station="stationInfo" :timetableOnly="timetableOnly" />
      <SceneryTimetable :station="stationInfo" :timetableOnly="timetableOnly" />
    </div>
  </div>
</template>

<script lang="ts">
import { StoreData } from '@/scripts/interfaces/StoreData';

import SceneryInfo from '@/components/SceneryView/SceneryInfo.vue';
import SceneryTimetable from '@/components/SceneryView/SceneryTimetable.vue';
import SceneryHistory from '@/components/SceneryView/SceneryHistory.vue';
import SceneryHeader from '@/components/SceneryView/SceneryHeader.vue';

import ActionButton from '@/components/Global/ActionButton.vue';

import { computed, ComputedRef, defineComponent, provide, reactive } from '@vue/runtime-core';
import { useRoute } from 'vue-router';

import axios from 'axios';
import { URLs } from '@/scripts/utils/apiURLs';
import Station from '@/scripts/interfaces/Station';
import { useStore } from '@/store/store';

export default defineComponent({
  components: { SceneryInfo, SceneryTimetable, SceneryHistory, ActionButton, SceneryHeader },

  data: () => ({
    icons: {
      history: require('@/assets/icon-history.svg'),
      user: require('@/assets/icon-user.svg'),
      back: require('@/assets/icon-back.svg'),
    },

    viewMode: 'info',

    stationInfo: {} as Station | undefined,
    onlineFrom: -1,
  }),

  setup() {
    const route = useRoute();
    const store = useStore();

    const savedSceneryHistory = reactive({});

    const timetableOnly = computed(() => (route.query['timetable_only'] == '1' ? true : false));

    const isComponentVisible = computed(() => route.path === '/scenery');

    const stationInfo = computed(() => {
      return store.stationList.find((station) => station.name === route.query.station?.toString().replace(/_/g, ' '));
    });

    provide('savedSceneryHistory', savedSceneryHistory);

    // const onlineFrom = computed(async () => {
    //   return await (await axios.get(`${URLs.stacjownikAPI}?name=${route.query.station}&historyCount=0`)).data;
    // });

    return {
      currentRegion: store.region,
      timetableOnly,
      isComponentVisible,
      stationInfo,
    };
  },

  methods: {
    setCardViewMode(mode: string) {
      this.viewMode = mode;
    },

    navigateTo(path: string, query?: {}) {
      this.$router.push({
        path,
        query,
      });
    },
  },

  async activated() {
    if (this.currentRegion.id != 'eu' && this.viewMode == 'history') this.viewMode = 'info';

    const onlineFrom = await (
      await axios.get(`${URLs.stacjownikAPI}/api/getSceneryHistory?name=${this.$route.query.station}&historyCount=0`)
    ).data;
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';
@import '../styles/variables.scss';

$sceneryBgCol: #333;

.scenery-view-anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out 100ms;
  }
}

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
    max-width: 1200px;

    @include midScreen {
      width: 100%;
    }

    background: #292929;
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
