<template>
  <div class="stations-view">
    <DonationModal :modalHidden="modalHidden" @toggleModal="toggleModal" />

    <div class="wrapper">
      <div class="body">
        <div class="options-bar">
          <action-button @click.native="() => toggleCardsState('filter')">
            <img
              class="button_icon"
              :src="require('@/assets/icon-filter2.svg')"
              alt="icon-filter"
            />
            <p>{{ $t("options.filters") }}</p>
          </action-button>
        </div>
        <!-- 
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
          </div> -->

        <StationTable
          :stations="computedStations"
          :sorterActive="filterManager.getSorter()"
          :setFocusedStation="setFocusedStation"
          :changeSorter="changeSorter"
        />
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

import StorageManager from "@/scripts/managers/storageManager";
import StationFilterManager from "@/scripts/managers/stationFilterManager";

import inputData from "@/data/options.json";

import StationTable from "@/components/StationsView/StationTable.vue";
import FilterCard from "@/components/StationsView/FilterCard.vue";
import DonationModal from "@/components/Global/DonationModal.vue";
import ActionButton from "@/components/Global/ActionButton.vue";
import { StoreData } from "@/scripts/interfaces/StoreData";
import { DataStatus } from "@/scripts/enums/DataStatus";

@Component({
  components: {
    StationTable,
    FilterCard,
    DonationModal,
    ActionButton,
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
  @Getter("getAllData") data!: StoreData;

  get dataStatusClass() {
    if (this.data.dataConnectionStatus == DataStatus.Loading) return "loading";
    if (this.data.dataConnectionStatus == DataStatus.Error) return "error";

    return "success";
  }

  get timetableDataStatusClass() {
    if (this.data.timetableDataStatus == DataStatus.Loading) return "loading";
    if (this.data.timetableDataStatus == DataStatus.Error) return "error";

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
    this.focusedStationName = this.focusedStationName == name ? "" : name;
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
    transition: all $animDuration $animType;
  }

  &-enter,
  &-leave-to {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0;
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

.stations-view {
  position: relative;

  padding: 1em 0;
  min-height: 100%;
}

.wrapper {
  display: flex;
  justify-content: center;
  padding: 0 0.5em;
}

.body {
  margin: 0 auto;
  overflow: auto;
}

.options-bar {
  display: flex;
  margin-bottom: 0.5em;
}

// .bar_indicators {
//   border: 1px solid red;

//   & > span {
//     margin-left: 0.5em;
//     padding: 0.5em 0.5em;

//     // background-color: #e68e00;
//     border-radius: 1em 1em 0 0;

//     &.loading {
//       background-color: $accentCol;
//     }

//     &.error {
//       background-color: $errorCol;
//     }

//     &.success {
//       background-color: $secondaryCol;
//     }

//     & > img {
//       width: 1.7em;
//       animation: blinkAnim 2s ease-in-out infinite forwards;
//     }
//   }
// }

@include smallScreen {
  .options-bar {
    font-size: 1.2em;
  }
}
</style>
