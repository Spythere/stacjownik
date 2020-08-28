<template>
  <div class="stations-view">
    <Loading v-if="connectionState == 0" message="Ładowanie scenerii..." />
    <Error v-if="connectionState == 1" />

    <transition name="card-anim">
      <StationCard v-if="focusedStationInfo" :stationInfo="focusedStationInfo" :exit="closeCard" />
    </transition>
    <!-- <div class="info" v-if="stations.length == 0">Ups! Brak stacji do wyświetlenia!</div> -->

    <div class="stations-wrapper" v-if="connectionState == 2">
      <div class="stations-body">
        <Options />
        <StationTable :stations="stations" :setFocusedStation="setFocusedStation" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

import Loading from "@/components/App/Loading.vue";
import Error from "@/components/App/Error.vue";

import StationTable from "@/components/StationsView/StationTable.vue";
import StationCard from "@/components/StationsView/StationCard.vue";
import Options from "@/components/StationsView/Options.vue";

import inputData from "@/data/options.json";

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

  @Action("setFilter") setFilter;

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
  overflow: auto;
}
</style>
