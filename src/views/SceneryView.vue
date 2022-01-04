<template>
  <div class="scenery-view">
    <div
      class="scenery-offline"
      v-if="!stationInfo && isDataLoaded && isComponentVisible"
    >
      <div>{{ $t("scenery.no-scenery") }}</div>

      <action-button>
        <router-link to="/">{{ $t("scenery.return-btn") }}</router-link>
      </action-button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo">
      <SceneryInfo :station="stationInfo" :timetableOnly="timetableOnly" />

      <SceneryTimetable
        :station="stationInfo"
        :timetableOnly="timetableOnly"
      />

      <!-- <SceneryHistory :name="stationInfo.name" /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { StoreData } from "@/scripts/interfaces/StoreData";
import { DataStatus } from "@/scripts/enums/DataStatus";

import SceneryInfo from "@/components/SceneryView/SceneryInfo.vue";
import SceneryTimetable from "@/components/SceneryView/SceneryTimetable.vue";
import SceneryHistory from "@/components/SceneryView/SceneryHistory.vue"

import ActionButton from "@/components/Global/ActionButton.vue";

import { computed, ComputedRef, defineComponent } from "@vue/runtime-core";
import { useStore } from "@/store";
import { GETTERS } from "@/constants/storeConstants";
import { useRoute } from "vue-router";

export default defineComponent({
  components: { SceneryInfo, SceneryTimetable, SceneryHistory, ActionButton },

  setup() {
    const route = useRoute();
    const store = useStore();

    const data: ComputedRef<StoreData> = computed(
      () => store.getters[GETTERS.allData]
    );

    const timetableOnly = computed(() =>
      route.query["timetable_only"] == "1" ? true : false
    );

    const isComponentVisible = computed(() => route.path === "/scenery");

    const isDataLoaded = computed(
      () => data.value.dataConnectionStatus === DataStatus.Loaded
    );

    const stationInfo = computed(() =>
      data.value.stationList.find(
        (station) =>
          station.name ===
          route.query.station?.toString().replace(/_/g, " ")
      )
    );

    return {
      data,
      timetableOnly,
      isComponentVisible,
      isDataLoaded,
      stationInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../styles/responsive.scss";
@import "../styles/variables.scss";

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
</style>