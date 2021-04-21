<template>
  <section class="trains-view">
    <div class="wrapper">
      <!-- <TrainSorter :trainList="computedTrains" @changeSorter="changeSorter" />
        <TrainSearch
          @changeSearchedTrain="changeSearchedTrain"
          @changeSearchedDriver="changeSearchedDriver"
          :passedSearchedTrain="passedSearchedTrain"
          :focusedTrain="focusedTrain"
        /> -->

      <div class="options-bar">
        <div class="stats">
          <action-button @click.native="toggleStats">
            <img :src="statsIcon" :alt="$t('trains.stats')" />
            {{ $t("trains.stats") }}
          </action-button>
          <TrainStats :trains="trains" :trainStatsOpen="trainStatsOpen" />
        </div>

        <TrainOptions
          :queryTrain="queryTrain"
          :focusedTrain="focusedTrain"
          @change-sorter="changeSorter"
          @changeSearchedTrain="changeSearchedTrain"
          @changeSearchedDriver="changeSearchedDriver"
        />
      </div>

      <TrainTable
        :computedTrains="computedTrains"
        @changeFocusedTrain="changeFocusedTrain"
      />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Train from "@/scripts/interfaces/Train";

import TrainTable from "@/components/TrainsView/TrainTable.vue";
import TrainStats from "@/components/TrainsView/TrainStats.vue";
import TrainOptions from "@/components/TrainsView/TrainOptions.vue";
import ActionButton from "@/components/Global/ActionButton.vue";

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

  // Passed in route as query parameters
  @Prop() readonly queryTrain!: string;

  statsIcon = require("@/assets/icon-stats.svg");

  sorterActive: { id: string; dir: number } = { id: "distance", dir: -1 };

  trainStatsOpen: boolean = false;

  searchedTrain: string = "";
  searchedDriver: string = "";
  focusedTrain: string = "";

  toggleStats() {
    this.trainStatsOpen = !this.trainStatsOpen;
  }

  changeSearchedTrain(trainNo: string) {
    this.searchedTrain = trainNo;

    console.log("train", trainNo);
  }

  changeSearchedDriver(name: string) {
    this.searchedDriver = name;
  }

  changeFocusedTrain(trainNo: string) {
    this.focusedTrain = this.focusedTrain === trainNo ? "" : trainNo;
  }

  changeSorter(sorter: { id: string; dir: number }) {
    this.sorterActive = sorter;
  }

  // @Watch("queryTrain")
  // onQueryTrainChanged(train: string) {
  //   // this.searchedTrain = train;
  //   this.changeSearchedTrain(train);
  //   console.log(train);
  // }

  get computedTrains() {
    return this.trains
      .filter(
        (train) =>
          train.timetableData &&
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
            else return -this.sorterActive.dir;

          case "distance":
            if (!a.timetableData || !b.timetableData) return 0;

            if (a.timetableData.routeDistance > b.timetableData.routeDistance)
              return this.sorterActive.dir;
            else return -this.sorterActive.dir;

          case "speed":
            if (a.speed > b.speed) return this.sorterActive.dir;
            else return -this.sorterActive.dir;

          case "timetable":
            if (a.trainNo > b.trainNo) return this.sorterActive.dir;
            else return -this.sorterActive.dir;

          case "length":
            if (a.length > b.length) return this.sorterActive.dir;
            else return -this.sorterActive.dir;

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

.options-bar button {
  margin-bottom: 0.5em;
}

@include smallScreen {
  .options-bar {
    font-size: 1.25em;

    button {
      margin: 0 auto;
    }
  }
}
</style>
