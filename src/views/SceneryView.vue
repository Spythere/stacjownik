<template>
  <div class="scenery-view">
    <div
      class="scenery-offline"
      v-if="!stationInfo && isDataLoaded && isComponentVisible"
    >
      {{ $t("scenery.no-scenery") }}

      <action-button>
        <router-link to="/">{{ $t("scenery.return-btn") }}</router-link>
      </action-button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo">
      <SceneryInfo :stationInfo="stationInfo" :timetableOnly="timetableOnly" />

      <SceneryTimetable
        :stationInfo="stationInfo"
        :timetableOnly="timetableOnly"
        :dataStatus="data.timetableDataStatus"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

import SceneryInfo from "@/components/SceneryView/SceneryInfo.vue";
import SceneryTimetable from "@/components/SceneryView/SceneryTimetable.vue";
import { StoreData } from "@/scripts/interfaces/StoreData";
import DataStatus from "@/scripts/enums/DataStatus";
import ActionButton from "@/components/Global/ActionButton.vue";

@Component({
  components: { SceneryInfo, SceneryTimetable, ActionButton },
})
export default class SceneryView extends Vue {
  @Getter("getAllData") data!: StoreData;

  timetableOnly: boolean = false;

  activated() {
    this.timetableOnly =
      this.$route.query["timetable_only"] == "1" ? true : false;
  }

  get isComponentVisible() {
    return this.$route.path === "/scenery";
  }

  get isDataLoaded() {
    return this.data.dataConnectionStatus == DataStatus.Loaded;
  }

  get stationInfo(): Station | undefined {
    if (!this.$route.query.station) return;

    return this.data.stationList.find(
      (station) =>
        station.stationName ===
        this.$route.query.station.toString().replaceAll("_", " ")
    );
  }
}
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

    font-size: 2em;

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