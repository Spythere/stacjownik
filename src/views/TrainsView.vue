<template>
  <section class="trains-view">
    <div class="wrapper">
      <div class="options-bar">
        <TrainStats :trains="trains" :trainStatsOpen="trainStatsOpen" />

        <TrainOptions
          :queryTrain="queryTrain"
          @change-sorter="changeSorter"
          @changeSearchedTrain="changeSearchedTrain"
          @changeSearchedDriver="changeSearchedDriver"
        />
      </div>

      <TrainTable
        :computedTrains="computedTrains"
        :timetableDataStatus="timetableDataStatus"
      />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Train from "@/scripts/interfaces/Train";

import TrainTable from "@/components/TrainsView/TrainTable.vue";
import TrainStats from "@/components/TrainsView/TrainStats.vue";
import TrainOptions from "@/components/TrainsView/TrainOptions.vue";
import ActionButton from "@/components/Global/ActionButton.vue";
import { DataStatus } from "@/scripts/enums/DataStatus";

@Component({
  components: {
    TrainTable,
    TrainStats,
    TrainOptions,
    ActionButton,
  },
})
export default class TrainsView extends Vue {
  @Getter("getTrainList") trains!: Train[];
  @Getter("getTimetableDataStatus") timetableDataStatus!: DataStatus;

  // Passed in route as query parameters
  @Prop() readonly queryTrain!: string;

  statsIcon = require("@/assets/icon-stats.svg");

  sorterActive: { id: string; dir: number } = { id: "distance", dir: -1 };

  trainStatsOpen: boolean = false;

  searchedTrain: string = "";
  searchedDriver: string = "";

  changeSearchedTrain(trainNo: string) {
    this.searchedTrain = trainNo;
  }

  changeSearchedDriver(name: string) {
    this.searchedDriver = name;
  }

  changeSorter(sorter: { id: string; dir: number }) {
    this.sorterActive = sorter;
  }

  get computedTrains() {
    return this.timetableDataStatus != DataStatus.Loaded
      ? []
      : this.trains
          .filter(
            (train) =>
              train.online &&
              (this.searchedTrain.length > 0
                ? train.trainNo.toString().includes(this.searchedTrain)
                : true) &&
              (this.searchedDriver.length > 0
                ? train.driverName
                    .toLowerCase()
                    .includes(this.searchedDriver.toLowerCase())
                : true)
          )
          .sort((a, b) => {
            switch (this.sorterActive.id) {
              case "mass":
                if (a.mass > b.mass) return this.sorterActive.dir;
                return -this.sorterActive.dir;

              case "distance":
                if (
                  (a.timetableData?.routeDistance || -1) >
                  (b.timetableData?.routeDistance || -1)
                )
                  return this.sorterActive.dir;

                return -this.sorterActive.dir;

              case "speed":
                if (a.speed > b.speed) return this.sorterActive.dir;
                return -this.sorterActive.dir;

              case "timetable":
                if (a.trainNo > b.trainNo) return this.sorterActive.dir;
                return -this.sorterActive.dir;

              case "length":
                if (a.length > b.length) return this.sorterActive.dir;
                return -this.sorterActive.dir;

              default:
                break;
            }

            return 0;
          });
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/responsive.scss";

.trains-view {
  min-height: 100%;
  position: relative;
}

.wrapper {
  margin: 1rem auto;
  max-width: 1300px;

  padding: 0 0.5em;
}

@include smallScreen {
  .options-bar {
    font-size: 1.25em;
  }
}
</style>
