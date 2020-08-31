<template>
  <div class="stations-view">
    <Loading v-if="connectionState == 0" message="Ładowanie scenerii..." />
    <Error v-if="connectionState == 1" />

    <transition name="card-anim">
      <StationCard v-if="focusedStationInfo" :stationInfo="focusedStationInfo" :exit="closeCard" />
    </transition>

    <div class="stations-wrapper" v-if="connectionState == 2">
      <div class="stations-body">
        <Options />
        <StationTable
          :stations="computedStations"
          :sorterActive="sorterActive"
          :setFocusedStation="setFocusedStation"
          :changeSorter="changeSorter"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import inputData from "@/data/options.json";

import Loading from "@/components/App/Loading.vue";
import Error from "@/components/App/Error.vue";

import StationTable from "@/components/StationsView/StationTable.vue";
import StationCard from "@/components/StationsView/StationCard.vue";
import Options from "@/components/StationsView/Options.vue";

enum ConnState {
  Loading = 0,
  Error = 1,
  Connected = 2,
}

@Component({
  components: {
    StationCard,
    StationTable,
    Loading,
    Error,
    Options,
  },
})
export default class StationsView extends Vue {
  focusedStationName: string = "";
  inputs = { ...inputData };
  STORAGE_KEY: string = "options_saved";

  @Getter("getStationList") stations!: Station[];
  @Getter("getConnectionState") connectionState!: ConnState;

  @Getter("trainsDataList") trains!: Train[];
  @Getter("trainsDataState") trainsDataState!: number;

  @Action("setFilter") setFilter;

  sorterActive: { index: number; dir: number } = { index: 0, dir: 1 };

  changeSorter(index: number) {
    if (index > 5) return;

    if (index == this.sorterActive.index)
      this.sorterActive.dir = -1 * this.sorterActive.dir;
    else this.sorterActive.dir = 1;

    this.sorterActive.index = index;
  }

  get scheduledTrains() {
    const reducedList = this.stations.reduce((acc, station) => {
      if (!acc[station.stationName]) acc[station.stationName] = [];

      this.trains
        .filter((train) => !train.noTimetable)
        .forEach((train) => {
          const found = train.stopPoints!.find(
            (sp) =>
              (station.stationName
                .toLowerCase()
                .includes(sp.pointNameRAW.toLowerCase()) ||
                station.stationName
                  .toLowerCase()
                  .includes(sp.pointNameRAW.toLowerCase().split(",")[0]) ||
                (station.stationName
                  .toLowerCase()
                  .includes(sp.pointNameRAW.toLowerCase().split(" ")[0]) &&
                  station.stationName.toLowerCase().includes("lcs"))) &&
              !acc[station.stationName].find((t) => t.trainNo === train.trainNo)
          );

          if (!found) return acc;

          acc[station.stationName].push({
            trainNo: train.trainNo,
            driverName: train.driverName,
            category: train.category,
            ...found,
          });
        });

      return acc;
    }, {});

    return reducedList;
  }

  get computedStations() {
    const dir: number = this.sorterActive.dir;
    const scheduledTrainList = this.scheduledTrains;

    return this.stations
      .sort((a, b) => {
        switch (this.sorterActive.index) {
          case 1:
            if (parseInt(a.reqLevel) > parseInt(b.reqLevel)) return dir;
            if (parseInt(a.reqLevel) < parseInt(b.reqLevel)) return -dir;
            break;

          case 2:
            if (a.statusTimestamp > b.statusTimestamp) return dir;
            if (a.statusTimestamp < b.statusTimestamp) return -dir;
            break;

          case 3:
            if (a.dispatcherName > b.dispatcherName) return dir;
            if (a.dispatcherName < b.dispatcherName) return -dir;
            break;

          case 4:
            if (a.dispatcherExp > b.dispatcherExp) return dir;
            if (a.dispatcherExp < b.dispatcherExp) return -dir;
            break;

          case 5:
            if (a.currentUsers > b.currentUsers) return dir;
            if (a.currentUsers < b.currentUsers) return -dir;
            if (a.maxUsers > b.maxUsers) return dir;
            if (a.maxUsers < b.maxUsers) return -dir;
            break;

          default:
            break;
        }

        if (a.stationName >= b.stationName) return dir;
        return -dir;
      })
      .map((station) => ({
        ...station,
        scheduledTrains: scheduledTrainList[station.stationName],
      }));
  }

  mounted() {
    const storage = window.localStorage;

    if (storage.getItem(this.STORAGE_KEY) !== "true") return;

    this.inputs.options.forEach((input) => {
      if (storage.getItem(input.name) === "true") {
        this.setFilter({
          filterName: input.name,
          value: false,
        });

        input.value = true;
      } else if (storage.getItem(input.name) === "false") {
        this.setFilter({
          filterName: input.name,
          value: true,
        });

        input.value = false;
      }
    });

    this.inputs.sliders.forEach((slider) => {
      const value = parseInt(
        window.localStorage.getItem(slider.name) as string
      );

      this.setFilter({
        filterName: slider.name,
        value,
      });

      slider.value = value;
    });
  }

  closeCard() {
    this.focusedStationName = "";
  }

  setFocusedStation(name: string) {
    if (this.focusedStationName == name) this.focusedStationName = "";
    else this.focusedStationName = name;
  }

  get focusedStationInfo() {
    return this.stations.find(
      (station) => station.stationName === this.focusedStationName
    );
  }
}
</script>

<style lang="scss" scoped>
.stations-view {
  padding: 1rem 0;
  min-height: 100%;
}

@import "../styles/variables.scss";
@import "../styles/responsive.scss";

.card-anim {
  &-enter-active,
  &-leave-active {
    transition: all 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    transform: translate(-45%, -50%);
    opacity: 0;
  }
}

.stations-wrapper {
  display: flex;
  justify-content: center;
}

.stations-body {
  margin: 0 auto;
  overflow: auto;
}
</style>
