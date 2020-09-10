<template>
  <div class="stations-view">
    <div class="stations-wrapper">
      <div class="stations-body">
        <div class="options">
          <div class="options-actions">
            <button
              class="action-btn"
              :class="{'open': filterCardOpen}"
              @click="() => toggleCardsState('filter')"
            >
              <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" />
              <p>FILTRY</p>
            </button>
          </div>
        </div>

        <StationTable
          :stations="computedStations"
          :sorterActive="sorterActive"
          :setFocusedStation="setFocusedStation"
          :changeSorter="changeSorter"
        />
      </div>
    </div>

    <transition name="card-anim">
      <StationCard v-if="focusedStationInfo" :stationInfo="focusedStationInfo" :exit="closeCard" />
    </transition>

    <transition name="card-anim">
      <FilterCard
        v-if="filterCardOpen"
        :exit="() => toggleCardsState('filter')"
        @changeFilterValue="changeFilterValue"
        @resetFilters="resetFilters"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import inputData from "@/data/options.json";

import StationTable from "@/components/StationsView/StationTable.vue";
import StationCard from "@/components/StationsView/StationCard.vue";
import FilterCard from "@/components/StationsView/FilterCard.vue";

const filterInitStates = {
  default: false,
  notDefault: false,
  nonPublic: false,
  SPK: false,
  SCS: false,
  ręczne: false,
  mechaniczne: false,
  współczesna: false,
  kształtowa: false,
  historyczna: false,
  mieszana: false,
  minLevel: 0,
  minOneWayCatenary: 0,
  minOneWay: 0,
  minTwoWayCatenary: 0,
  minTwoWay: 0,
  "no-1track": false,
  "no-2track": false,
  free: true,
  occupied: false,
  ending: false,
};

@Component({
  components: {
    StationCard,
    StationTable,
    FilterCard,
  },
})
export default class StationsView extends Vue {
  STORAGE_KEY: string = "options_saved";

  sorterActive: { index: number; dir: number } = { index: 0, dir: 1 };
  focusedStationName: string = "";
  filterCardOpen: boolean = false;
  filters = { ...filterInitStates };

  inputs = inputData;

  @Getter("getStationList") stationList!: Station[];

  toggleCardsState(name: string): void {
    if (name == "filter") {
      this.filterCardOpen = !this.filterCardOpen;
    }
  }

  changeSorter(index: number) {
    if (index > 5) return;

    if (index == this.sorterActive.index)
      this.sorterActive.dir = -1 * this.sorterActive.dir;
    else this.sorterActive.dir = 1;

    this.sorterActive.index = index;
  }

  changeFilterValue(filter: { name: string; value: number }) {
    this.filters[filter.name] = filter.value;
  }

  resetFilters() {
    this.filters = { ...filterInitStates };
  }


  get computedStations() {
    const dir: number = this.sorterActive.dir;
    // const scheduledTrainList = this.scheduledTrains;

    return this.stationList
      .filter((station) => {
        if (!station.reqLevel || station.reqLevel == "-1") return true;

        if (
          (station.nonPublic || !station.reqLevel) &&
          this.filters["nonPublic"]
        )
          return false;

        if (
          station.online &&
          station.occupiedTo == "KOŃCZY" &&
          this.filters["ending"]
        )
          return false;

        if (station.online && this.filters["occupied"]) return false;
        if (!station.online && this.filters["free"]) return false;

        if (station.default && this.filters["default"]) return false;
        if (!station.default && this.filters["notDefault"]) return false;

        if (parseInt(station.reqLevel) < this.filters["minLevel"]) return false;

        if (
          this.filters["no-1track"] &&
          (station.routes.oneWay.catenary != 0 ||
            station.routes.oneWay.noCatenary != 0)
        )
          return false;
        if (
          this.filters["no-2track"] &&
          (station.routes.twoWay.catenary != 0 ||
            station.routes.twoWay.noCatenary != 0)
        )
          return false;

        if (station.routes.oneWay.catenary < this.filters["minOneWayCatenary"])
          return false;
        if (station.routes.oneWay.noCatenary < this.filters["minOneWay"])
          return false;

        if (station.routes.twoWay.catenary < this.filters["minTwoWayCatenary"])
          return false;
        if (station.routes.twoWay.noCatenary < this.filters["minTwoWay"])
          return false;

        if (this.filters[station.controlType]) return false;
        if (this.filters[station.signalType]) return false;

        if (this.filters["SPK"] && (station.controlType === "SPK" || station.controlType.includes("+SPK")))
          return false;
        if (this.filters["SCS"] && (station.controlType === "SCS" || station.controlType.includes("+SCS")))
          return false;

        if (this.filters["SCS"] && this.filters["SPK"] && (station.controlType.includes("SPK") || station.controlType.includes("SCS")))
          return false;

        if (
          this.filters["mechaniczne"] &&
          station.controlType.includes("mechaniczne")
        )
          return false;

        if (this.filters["ręczne"] && station.controlType.includes("ręczne"))
          return false;

        return true;
      })
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
            if (a.dispatcherName.toLowerCase() > b.dispatcherName.toLowerCase()) return dir;
            if (a.dispatcherName.toLowerCase() < b.dispatcherName.toLowerCase()) return -dir;
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

        if (a.stationName.toLowerCase() >= b.stationName.toLowerCase()) return dir;
        return -dir;
      })
  }

  mounted() {
    const storage = window.localStorage;

    if (storage.getItem(this.STORAGE_KEY) !== "true") return;

    this.inputs.options.forEach(option => {
      const value = storage.getItem(option.name) === "true" ? true : false;


      this.changeFilterValue({ name: option.name, value: value ? 0 : 1 });
      option.value = value;
    })

    this.inputs.sliders.forEach(slider => {
      const value = parseInt(storage.getItem(slider.name) || "0");


      this.changeFilterValue({ name: slider.name, value });
      slider.value = value;
    })

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.keyCode == 27 && this.focusedStationName != "") {
        this.focusedStationName = "";
      }

    })
  }

  closeCard() {
    this.focusedStationName = "";
  }

  setFocusedStation(name: string) {
    if (this.focusedStationName == name) this.focusedStationName = "";
    else this.focusedStationName = name;
  }

  get focusedStationInfo() {
    return this.computedStations.find(
      (station) => station.stationName === this.focusedStationName
    );
  }
}
</script>

<style lang="scss" scoped>
.stations-view {
  padding: 1rem 0;
  min-height: 100%;

  font-size: calc(0.6rem + 0.9vw);

  position: relative;
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

.options {
  &-actions {
    display: flex;
  }
}

.action-btn {
  display: flex;
  align-items: center;

  background: #333;
  border: none;

  color: #e0e0e0;
  font-size: 0.65em;

  padding: 0.3em;

  outline: none;
  cursor: pointer;

  transition: all 0.3s;

  img {
    width: 1.3em;
    margin-right: 0.2em;
  }

  p {
    font-size: 1em;
    overflow: hidden;

    transition: max-width 0.35s ease-in-out;
  }

  &:hover {
    color: $accentCol;
    background: rgba(#e0e0e0, 0.4);
  }

  &.open {
    color: $accentCol;
  }
}

@include smallScreen {
  .options {
    display: flex;
    justify-content: center;
  }

  .action-btn {
    font-size: 0.75rem;
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
