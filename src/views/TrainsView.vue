<template>
  <section class="trains-view">
    <Loading v-if="connectionState == 0" message="Liczenie pociągów..." />

    <div class="body-wrapper" v-else>
      <div class="options-wrapper">
        <TrainSorter :trainList="computedTrains" @changeSorter="changeSorter" />
        <div class="search train">
          <div class="search-title title">Szukaj składu</div>
          <div class="search-box">
            <input class="search-input" v-model="searchedTrain" />
            <img
              class="search-exit"
              :src="exitIcon"
              alt="exit-icon"
              @click="() => searchedTrain = ''"
            />
          </div>
        </div>

        <div class="search driver">
          <div class="search-title title">Szukaj maszynisty</div>
          <div class="search-box">
            <input class="search-input" v-model="searchedDriver" />
            <img
              class="search-exit"
              :src="exitIcon"
              alt="exit-icon"
              @click="() => searchedDriver = ''"
            />
          </div>
        </div>
      </div>

      <TrainStats :trains="trains" />

      <TrainTable :computedTrains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import Loading from "@/components/App/Loading.vue";

import TrainSorter from "@/components/TrainsView/TrainSorter.vue";
import TrainTable from "@/components/TrainsView/TrainTable.vue";
import TrainStats from "@/components/TrainsView/TrainStats.vue";

import axios from "axios";

@Component({
  components: {
    Loading,
    TrainSorter,
    TrainTable,
    TrainStats,
  },
})
export default class TrainsView extends Vue {
  exitIcon = require("@/assets/icon-exit.svg");

  @Getter("trainsDataList") trains!: Train[];

  @Getter("trainsDataState") connectionState;

  @Action("fetchTrainsData") fetchTrainsData;

  sorterActive: { id: string; dir: number } = { id: "timetable", dir: 1 };
  searchedTrain: string = "";
  searchedDriver: string = "";

  changeSorter(sorter: { id: string; dir: number }) {
    this.sorterActive = sorter;
  }

  get computedTrains() {
    return this.trains
      .filter(
        (train) =>
          !train.noTimetable &&
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
            if (a.routeDistance > b.routeDistance) return this.sorterActive.dir;
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
  position: relative;
  min-height: 100%;
}

.body-wrapper {
  margin: 1rem auto;
  max-width: 1250px;

  padding: 0 0.5rem;

  font-size: calc(0.4rem + 0.5vw);
}

.options-wrapper {
  display: flex;
  flex-wrap: wrap;

  & > div {
    margin-right: 1rem;
  }

  .search {
    &-box {
      position: relative;

      background: #333;
      border-radius: 0.5em;
      min-width: 150px;
    }

    &-input {
      border: none;

      padding: 0.5rem 1rem;
      margin: 0;

      font-size: 1em;

      min-width: 85%;
    }

    &-exit {
      position: absolute;
      cursor: pointer;

      top: 50%;
      right: 10px;
      transform: translateY(-50%);

      width: 1em;
    }
  }
}

@include bigScreen() {
  .body-wrapper {
    font-size: 1rem;
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
