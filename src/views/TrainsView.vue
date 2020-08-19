<template>
  <section class="trains-view">
    <Loading v-if="!listLoaded" message="Liczenie pociągów..." />

    <div class="body-wrapper" v-else>
      <div class="options-wrapper">
        <TrainSorter :trainList="computedTrains" @changeSorter="changeSorter" />
        <div class="search train">
          <div class="search-title title">Szukaj składu</div>
          <input class="search-input" v-model="searchedTrain" />
        </div>

        <div class="search driver">
          <div class="search-title title">Szukaj maszynisty</div>
          <input class="search-input" v-model="searchedDriver" />
        </div>
      </div>

      <TrainTable :computedTrains="computedTrains" />
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import Loading from "@/components/states/Loading.vue";
import TrainSorter from "@/components/TrainsView/TrainSorter.vue";
import TrainTable from "@/components/TrainsView/TrainTable.vue";

import axios from "axios";

@Component({
  components: {
    Loading,
    TrainSorter,
    TrainTable,
  },
})
export default class TrainsView extends Vue {
  @Getter("getAllStations") stations!: Station[];

  sorterActive: { id: string; dir: number } = { id: "timetable", dir: 1 };
  onlineTrainsList: Train[] = [];
  listLoaded: boolean = false;

  searchedTrain: string = "";
  searchedDriver: string = "";

  changeSorter(sorter: { id: string; dir: number }) {
    this.sorterActive = sorter;
  }

  async getTrainData() {
    const response = await axios.get(
      "https://api.td2.info.pl:9640/?method=getTrainsOnline"
    );

    let onlineTrainsData: {
      driverId: number;
      driverName: string;
      trainNo: number;
      station: { stationName: string };
      dataMass: number;
      dataLength: number;
      dataSpeed: number;
      dataDistance: number;
      dataSignal: string;
      dataCon: string;
      dataSceneryConnection: string;
      isOnline: boolean;
    }[] = response.data.message;

    this.onlineTrainsList = await Promise.all(
      onlineTrainsData
        .filter((train) => train.isOnline)
        .map(async (train) => {
          const timetableData = await this.getTimetableData(train.trainNo);

          let locoType = train.dataCon.split(";")
            ? train.dataCon.split(";")[0]
            : train.dataCon;

          const locoURL = `https://rj.td2.info.pl/dist/img/thumbnails/${
            locoType.includes("EN") ? locoType + "rb" : locoType
          }.png`;

          return {
            driverId: train.driverId,
            driverName: train.driverName,
            trainNo: train.trainNo,
            currentStationName: train.station.stationName,
            mass: train.dataMass,
            length: train.dataLength,
            speed: train.dataSpeed,
            distance: train.dataDistance,
            signal: train.dataSignal,
            connectedTrack: train.dataSceneryConnection,
            locoURL,
            locoType,
            noTimetable: timetableData == null,
            route: timetableData && timetableData.route,
            timetableId: timetableData && timetableData.timetableId,
            category: timetableData && timetableData.trainCategoryCode,
            routeDistance: (timetableData && timetableData.routeDistance) || 0,
            sceneries:
              timetableData &&
              (await this.mapSceneries(timetableData.sceneries)),
            TWR: timetableData && timetableData.twr,
            SKR: timetableData && timetableData.skr,
          };
        })
    );

    this.listLoaded = true;
  }

  async getTimetableData(trainNo: number) {
    const responseDataMessage: {
      stopPoints: { pointDistance: number }[] | [];
      trainInfo: {
        timetableId: number;
        trainCategoryCode: string;
        route: string;
        twr: boolean;
        skr: boolean;
        sceneries: string[];
      } | null;
    } = (
      await axios.get(
        `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`
      )
    ).data.message;

    let result: {
      timetableId: number;
      trainCategoryCode: string;
      route: string;
      twr: boolean;
      skr: boolean;
      sceneries: string[];
      routeDistance: number;
    } | null = null;

    if (responseDataMessage.trainInfo) {
      const routeDistance: number =
        responseDataMessage.stopPoints[
          responseDataMessage.stopPoints.length - 1
        ].pointDistance;

      result = {
        ...responseDataMessage.trainInfo,
        routeDistance,
      };
    }

    return result;
  }

  mapSceneries(sceneries: string[]): string {
    let text = "";

    for (let i = sceneries.length - 1; i >= 0; i--) {
      const station = this.stations.find(
        (station) => station.stationHash == sceneries[i]
      );

      if (!station) continue;
      if (i == sceneries.length - 1 || i == 0) continue;

      text += `${station.stationName}${i > 1 ? ", " : ""}`;
    }

    return text;
  }

  get computedTrains() {
    const computed = this.onlineTrainsList.filter(
      (train) =>
        !train.noTimetable &&
        (this.searchedTrain.length > 0
          ? train.trainNo.toString().includes(this.searchedTrain)
          : true) &&
        (this.searchedDriver.length > 0
          ? train.driverName.includes(this.searchedDriver)
          : true)
    );

    computed.sort((a, b) => {
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

    return computed;
  }

  mounted() {
    this.getTrainData();

    setInterval(this.getTrainData, 5000);
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
    &-input {
      background: #333;
      border: none;
      border-radius: 0.5em;

      padding: 0.5rem 1rem;
      margin: 0;

      font-size: 1em;

      min-width: 150px;
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
