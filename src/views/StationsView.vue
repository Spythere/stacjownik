<template>
  <div class="stations-view">
    <Loading v-if="connectionState == 0" message="Ładowanie scenerii..." />
    <Error v-if="connectionState == 1" />

    <div class="list flex" v-if="connectionState == 2">
      <transition name="card-anim">
        <StationCard
          v-if="focusedStationInfo"
          :stationInfo="focusedStationInfo"
          :dispatcherHistory="dispatcherHistory()"
          :exit="closeCard"
        />
      </transition>
      <!-- <div class="info" v-if="stations.length == 0">Ups! Brak stacji do wyświetlenia!</div> -->

      <section class="list-body">
        <Options />
        <Table :stations="stations" :setFocusedStation="setFocusedStation" />
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

import Table from "@/components/StationsView/Table.vue";
import StationCard from "@/components/ui/StationCard.vue";
import Options from "@/components/ui/Options.vue";
import Loading from "@/components/states/Loading.vue";
import Error from "@/components/states/Error.vue";

import db from "@/scripts/firebase/firebaseInit";

enum ConnState {
  Loading = 0,
  Error = 1,
  Connected = 2,
}

@Component({
  components: {
    StationCard,
    Options,
    Table,
    Loading,
    Error,
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

  async mounted() {
    // docs.forEach((doc) => {
    //   console.log(doc.data());
    // });
    // this.$store.watch(
    //   (state, getters) => getters.getConnectionState,
    //   (state: ConnState) => {
    //     this.connectionState = state;
    //     console.log("Najs");
    //   }
    // );
  }
}
</script>

<style lang="scss" scoped>
.stations-view {
  position: relative;
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

.list-body {
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
