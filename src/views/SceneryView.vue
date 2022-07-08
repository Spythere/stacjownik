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
          <button
            v-if="!timetableOnly"
            class="back-btn btn btn--image"
            :title="$t('scenery.return-btn')"
            @click="navigateTo('/')"
          >
            <img :src="icons.back" alt="Back to scenery" />
          </button>

          <!-- <button
            v-if="!timetableOnly && store.region.id == 'eu' && stationInfo"
            class="history-btn btn btn--image"
            @click="
              navigateTo('/journal/dispatchers', {
                sceneryName: stationInfo?.name,
              })
            "
          >
            <img :src="viewMode == 'history' ? icons.user : icons.history" alt="icon" />
          </button> -->
        </div>

        <SceneryHeader :station="stationInfo" />
        <SceneryInfo :station="stationInfo" :timetableOnly="timetableOnly" />
      </div>

      <div class="scenery-right">
        <SceneryTimetable :station="stationInfo" :timetableOnly="timetableOnly" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SceneryInfo from '@/components/SceneryView/SceneryInfo.vue';
import SceneryTimetable from '@/components/SceneryView/SceneryTimetable.vue';
import SceneryHeader from '@/components/SceneryView/SceneryHeader.vue';

import ActionButton from '@/components/Global/ActionButton.vue';

import { computed, defineComponent } from '@vue/runtime-core';
import { useRoute } from 'vue-router';

import { useStore } from '@/store/store';
import routerMixin from '@/mixins/routerMixin';

export default defineComponent({
  components: { SceneryInfo, SceneryTimetable, ActionButton, SceneryHeader },

  mixins: [routerMixin],

  data: () => ({
    icons: {
      history: require('@/assets/icon-history.svg'),
      user: require('@/assets/icon-user.svg'),
      back: require('@/assets/icon-back.svg'),
    },

    viewMode: 'info',

    onlineFrom: -1,
  }),

  activated() {},

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
    setCardViewMode(mode: string) {
      this.viewMode = mode;
    },
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
}

.scenery-wrapper {
  display: grid;
  grid-template-columns: 4fr 5fr;
  gap: 0 1em;

  position: relative;

  width: 100%;
  max-width: 1500px;

  background: #292929;
  padding: 1.5em;
  margin: 1rem 0;

  border-radius: 1.5em;

  text-align: center;
}

.scenery-left {
  height: 80vh;
  max-height: 1000px;
}

.scenery-actions {
  display: flex;
  justify-content: space-between;
}

button.btn {
  img {
    width: 2em;
  }
}

@include midScreen {
  .scenery-wrapper {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .scenery-left { 
    height: auto;
    margin-bottom: 2em;
  }
}
</style>
