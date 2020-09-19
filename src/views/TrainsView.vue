<template>
  <section class="trains-view">
    <div class="body-wrapper">
      <div class="options-wrapper">
        <TrainSorter :trainList="computedTrains" @changeSorter="changeSorter" />
        <TrainSearch
          @changeSearchedTrain="changeSearchedTrain"
          @changeSearchedDriver="changeSearchedDriver"
          :passedSearchedTrain="passedSearchedTrain"
        />
      </div>

      <TrainStats :trains="trains" />
      <TrainTable :computedTrains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import TrainSorter from "@/components/TrainsView/TrainSorter.vue";
import TrainSearch from "@/components/TrainsView/TrainSearch.vue";
import TrainTable from "@/components/TrainsView/TrainTable.vue";
import TrainStats from "@/components/TrainsView/TrainStats.vue";

import axios from "axios";

@Component({
  components: {
    TrainSorter,
    TrainTable,
    TrainStats,
    TrainSearch,
  },
})
export default class TrainsView extends Vue {
  @Getter("getTrainList") trains!: Train[];
  @Prop() readonly passedSearchedTrain!: string;

  sorterActive: { id: string; dir: number } = { id: "timetable", dir: 1 };
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
            break;

          case "distance":
            if (!a.timetableData || !b.timetableData) return 0;

            if (a.timetableData.routeDistance > b.timetableData.routeDistance) return this.sorterActive.dir;
            else return -this.sorterActive.dir;
            break;

          case "speed":
            if (a.speed > b.speed) return this.sorterActive.dir;
            else return -this.sorterActive.dir;
            break;

          case "timetable":
            if (a.trainNo > b.trainNo) return this.sorterActive.dir;
            else return -this.sorterActive.dir;
            break;

          case "length":
            if (a.length > b.length) return this.sorterActive.dir;
            else return -this.sorterActive.dir;
            break;

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

.body-wrapper {
  margin: 1rem auto;
  max-width: 1300px;

  padding: 0 0.5rem;

  font-size: calc(0.4rem + 0.4vw);
}

.options-wrapper {
  display: flex;
  flex-wrap: wrap;

  & > div {
    margin-right: 1rem;
  }
}

@include bigScreen() {
  .body-wrapper {
    font-size: 0.9rem;
  }
}

@include smallScreen {
  .body-wrapper {
    font-size: 0.8rem;
  }

  .options-wrapper {
    justify-content: center;
  }
}
</style>
