<template>
  <div class="stations_view">
    <DonationModal :modalHidden="modalHidden" @toggleModal="toggleModal" />

    <div class="stations_wrapper">
      <div class="stations_body">
        <div class="body_bar">
          <div class="bar_actions">
            <button
              class="action-btn"
              :class="{ open: filterCardOpen }"
              @click="() => toggleCardsState('filter')"
            >
              <img
                :src="require('@/assets/icon-filter2.svg')"
                alt="icon-filter"
              />
              <p>FILTRY</p>
            </button>

            <button class="action-btn" @click="toggleModal">
              <img :src="dolarIcon" alt="icon-dolar" />

              <p>WESPRZYJ</p>
            </button>
          </div>

          <div class="bar_indicators">
            <transition name="indicator-anim">
              <span
                class="indicator_scenery-data"
                v-if="data.dataConnectionStatus < 2"
                :class="dataStatusClass"
              >
                <img :src="trainIcon" alt="icon-train" />
              </span>
            </transition>

            <transition name="indicator-anim">
              <span
                class="indicator_timetable-data"
                v-if="data.timetableDataStatus < 2"
                :class="timetableDataStatusClass"
              >
                <img :src="timetableIcon" alt="icon-timetable" />
              </span>
            </transition>
          </div>
        </div>

        <div class="body_table">
          <StationTable
            :stations="computedStations"
            :sorterActive="filterManager.getSorter()"
            :setFocusedStation="setFocusedStation"
            :changeSorter="changeSorter"
          />
        </div>
      </div>
    </div>

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

import StorageManager from "@/scripts/storageManager";
import StationFilterManager from "@/scripts/stationFilterManager";

import inputData from "@/data/options.json";

import StationTable from "@/components/StationsView/StationTable.vue";
import FilterCard from "@/components/StationsView/FilterCard.vue";

import DonationModal from "@/components/Global/DonationModal.vue";

@Component({
  components: {
    StationTable,
    FilterCard,
    DonationModal,
  },
})
export default class StationsView extends Vue {
  STORAGE_KEY: string = "options_saved";
  STORAGE_MODAL: string = "modal";

  trainIcon: string = require("@/assets/icon-train.svg");
  timetableIcon: string = require("@/assets/icon-timetable.svg");
  dolarIcon: string = require("@/assets/icon-dolar.svg");

  filterManager: StationFilterManager = new StationFilterManager();

  focusedStationName: string = "";
  filterCardOpen: boolean = false;
  modalHidden: boolean = true;

  inputs = inputData;

  @Getter("getStationList") stationList!: Station[];
  @Getter("getAllData") data;

  get dataStatusClass() {
    if (this.data.dataConnectionStatus == 0) return "loading";
    if (this.data.dataConnectionStatus == 1) return "error";

    return "success";
  }

  get timetableDataStatusClass() {
    if (this.data.timetableDataStatus == 0) return "loading";
    if (this.data.timetableDataStatus == 1) return "error";

    return "success";
  }

  mounted() {
    this.initializeOptionsStorage();
    // this.initializeModalStorage();

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.keyCode == 27 && this.focusedStationName != "") {
        this.focusedStationName = "";
      }
    });
  }

  initializeOptionsStorage() {
    if (!StorageManager.isRegistered(this.STORAGE_KEY)) return;

    this.inputs.options.forEach((option) => {
      const value = StorageManager.getBooleanValue(option.name);

      this.changeFilterValue({ name: option.name, value: value ? 0 : 1 });
      option.value = value;
    });

    this.inputs.sliders.forEach((slider) => {
      const value = StorageManager.getNumericValue(slider.name);

      this.changeFilterValue({ name: slider.name, value });
      slider.value = value;
    });
  }

  initializeModalStorage() {
    if (StorageManager.isRegistered(`${this.STORAGE_MODAL}_hidden`))
      this.modalHidden = StorageManager.getBooleanValue(
        `${this.STORAGE_MODAL}_hidden`
      );
  }

  toggleModal() {
    this.modalHidden = !this.modalHidden;

    StorageManager.setBooleanValue(
      `${this.STORAGE_MODAL}_hidden`,
      this.modalHidden
    );
  }

  toggleCardsState(name: string): void {
    if (name == "filter") {
      this.filterCardOpen = !this.filterCardOpen;
    }
  }

  changeSorter(index: number) {
    this.filterManager.changeSorter(index);
  }

  changeFilterValue(filter: { name: string; value: number }) {
    this.filterManager.changeFilterValue(filter);
  }

  resetFilters() {
    this.filterManager.resetFilters();
  }

  get computedStations() {
    return this.filterManager.getFilteredStationList(this.stationList);
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

.indicator-anim {
  &-enter-active,
  &-leave-active {
    transition: all 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
}

.stations_view {
  position: relative;

  font-size: 0.9em;

  padding: 1rem 0;
  min-height: 100%;
}

.stations_wrapper {
  display: flex;
  justify-content: center;
}

.stations_body {
  margin: 0 auto;
  overflow: auto;

  & > .body_bar {
    display: flex;
    justify-content: space-between;
  }
}

.bar_actions {
  display: flex;

  @include smallScreen() {
    justify-content: center;
  }

  width: 100%;

  font-size: 1.25em;

  button {
    margin-right: 0.5em;
  }
}

.bar_indicators {
  display: flex;
  align-items: flex-end;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 2.5em;
    height: 2.5em;
    margin-left: 0.5em;

    // background-color: #e68e00;
    border-radius: 1em 1em 0 0;

    &.loading {
      background-color: $accentCol;
    }

    &.error {
      background-color: $errorCol;
    }

    &.success {
      background-color: $secondaryCol;
    }

    & > img {
      width: 1.7em;
      animation: blinkAnim 2s ease-in-out infinite forwards;
    }
  }
}

.action-btn {
  display: flex;
  align-items: center;

  background: #333;
  border: none;

  color: #e0e0e0;
  font-size: 1em;

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

@keyframes blinkAnim {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
