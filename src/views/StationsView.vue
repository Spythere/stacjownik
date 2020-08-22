<template>
  <div class="stations-view">
    <Loading v-if="connectionState == 0" message="Ładowanie scenerii..." />
    <Error v-if="connectionState == 1" />

    <transition name="card-anim">
      <StationCard
        v-if="focusedStationInfo"
        :stationInfo="focusedStationInfo"
        :dispatcherHistory="dispatcherHistory()"
        :exit="closeCard"
      />
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
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

import Loading from "@/components/App/Loading.vue";
import Error from "@/components/App/Error.vue";

import StationTable from "@/components/StationsView/StationTable.vue";
import StationCard from "@/components/StationsView/StationCard.vue";
import Options from "@/components/StationsView/Options.vue";

import db from "@/scripts/firebase/firebaseInit";

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

  @Getter("getStations") stations!: Station[];
  @Getter("getConnectionState") connectionState!: ConnState;

  closeCard() {
    this.focusedStationName = "";
  }

  setFocusedStation(name: string) {
    if (this.focusedStationName == name) this.focusedStationName = "";
    else this.focusedStationName = name;
  }

  get dispatcherHistory() {
    return async () => {
      let history: any[] = [];

      if (this.focusedStationName != "") {
        const historyRef = await db
          .collection("history")
          .doc(this.focusedStationName)
          .collection("dispatcherHistory")
          .get();

        history = historyRef.docs.map((doc) => doc.data());
      }

      return history;
    };
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
