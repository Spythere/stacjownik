<template>
  <div class="scenery-view">
    <div
      class="scenery-offline"
      v-if="!stationInfo && dataStatus == 2 && currentPath === '/scenery'"
    >
      Ups! Nie znaleziono danej stacji bądź jest ona offline!
      <button class="button">
        <router-link to="/">Wróć na stronę główną</router-link>
      </button>
    </div>

    <div class="scenery-wrapper" v-if="stationInfo">
      <SceneryInfo :stationInfo="stationInfo" :timetableOnly="timetableOnly" />

      <SceneryTimetable
        :stationInfo="stationInfo"
        :timetableOnly="timetableOnly"
        :dataStatus="timetableDataStatus"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import SceneryInfo from "@/components/SceneryView/SceneryInfo.vue";
import SceneryTimetable from "@/components/SceneryView/SceneryTimetable.vue";

@Component({
  components: { SceneryInfo, SceneryTimetable },
})
export default class SceneryView extends Vue {
  @Getter("getStationList") storeStationList!: Station[];
  @Getter("getTimetableDataStatus") timetableDataStatus!: number;
  @Getter("getDataStatus") dataStatus!: number;

  timetableOnly: boolean = false;

  activated() {
    this.timetableOnly =
      this.$route.query["timetable_only"] == "1" ? true : false;
  }

  get currentPath() {
    return this.$route.path;
  }

  // get dataLoaded() {
  //   return this.storeStationList ? true : false;
  // }

  get stationInfo(): Station | null {
    if (!this.$route.query.hash || !this.storeStationList) return null;

    const info =
      this.storeStationList.find(
        (station) => station.stationHash === this.$route.query.hash.toString()
      ) || null;

    return info;
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/responsive.scss";
@import "../styles/variables.scss";

h3 {
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

.scenery {
  &-view {
    min-height: 100%;

    display: flex;
    justify-content: center;

    font-size: calc(0.5rem + 0.65vw);

    @include bigScreen() {
      font-size: 1.25rem;
      align-items: flex-start;
    }

    @include smallScreen {
      font-size: calc(0.5rem + 1vw);
    }
  }

  &-offline {
    align-self: center;
    font-size: 2em;
    text-align: center;
    padding: 0 1em;

    color: $warningCol;

    display: inline-block;

    .button {
      margin: 1rem auto;
      font-size: 0.85em;
    }
  }

  &-wrapper {
    // background: #555;
    max-width: 950px;
    width: 75%;

    @include smallScreen {
      width: 95%;
    }

    // max-height: 100vh;
    // overflow: auto;

    background: #333;
    padding: 1em;
    margin: 1rem 0;

    border-radius: 1.5em;

    text-align: center;
  }
}
</style>