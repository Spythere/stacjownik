<template>
  <div class="list">
    <Card :stationInfo="focusedStationInfo" :closeCard="closeCard" />

    <!-- <div class="info">Ups! Brak stacji do wyświetlenia!</div> -->

    <div class="table-wrapper">
      <table class="table" v-if="stations.length > 0">
        <thead>
          <tr>
            <th>Stacja</th>
            <th>Dyżurny</th>
            <th>Poziom</th>
            <th>Maszyniści</th>
            <th>Zajęta do</th>
            <th>
              Informacje
              <div>ogólne</div>
            </th>
            <th>
              Szlaki
              <div>2-torowe</div>
            </th>
            <th>
              Szlaki
              <div>1-torowe</div>
            </th>
          </tr>
        </thead>

        <tr
          class="table-item"
          v-for="(station, i) in computedStations"
          :key="i + station.stationHash"
          @click="() => { setFocusedStation(station.stationName) }"
        >
          <td
            class="station-name"
            :class="station.default && 'default-station'"
          >{{station.stationName}} {{ station.reqLevel ? "| " + (parseInt(station.reqLevel) >= 2 ? station.reqLevel : "L") : "" }}</td>

          <td class="disptacher-name">{{station.dispatcherName}}</td>
          <td class="dispatcher-exp">
            <span :style="calculateStyle(station.dispatcherExp)">{{station.dispatcherExp}}</span>
          </td>
          <td class="users">{{station.currentUsers}}/{{station.maxUsers}}</td>
          <td class="hours">
            <span class="hour" :class="occupationClasses(station.occupiedTo)">{{station.occupiedTo}}</span>
          </td>
          <td class="info">
            <img
              v-if="station.controlType"
              :src="require(`@/assets/icon-${station.controlType}.svg`)"
              :alt="station.controlType"
              :title="'Sterowanie ' + station.controlType"
            />

            <img
              v-if="station.signalType"
              :src="require(`@/assets/icon-${station.signalType}.svg`)"
              :alt="station.signalType"
              :title="'Sygnalizacja ' + station.signalType"
            />

            <img
              v-if="station.SBL && station.SBL !== ''"
              :src="require(`@/assets/icon-SBL.svg`)"
              alt="SBL"
              title="Sceneria posiada SBL na przynajmniej jednym ze szlaków"
            />

            <img
              v-if="!station.reqLevel || station.nonPublic"
              :src="require(`@/assets/icon-lock.svg`)"
              alt="non-public"
              title="Sceneria niepubliczna"
            />
          </td>

          <td class="tracks twoway">
            <span
              v-if="station.routes && station.routes.twoWay.catenary > 0"
              class="track catenary"
              :title="'Liczba zelektryfikowanych szlaków dwutorowych: ' + station.routes.twoWay.catenary"
            >{{station.routes.twoWay.catenary}}</span>

            <span
              v-if="station.routes && station.routes.twoWay.noCatenary > 0"
              class="track no-catenary"
              :title="'Liczba niezelektryfikowanych szlaków dwutorowych: ' + station.routes.twoWay.noCatenary"
            >{{station.routes.twoWay.noCatenary}}</span>
          </td>

          <td class="tracks oneway">
            <span
              v-if="station.routes && station.routes.oneWay.catenary > 0"
              class="track catenary"
              :title="'Liczba zelektryfikowanych szlaków jednotorowych: ' + station.routes.oneWay.catenary"
            >{{station.routes.oneWay.catenary}}</span>

            <span
              v-if="station.routes && station.routes.oneWay.noCatenary > 0"
              class="track no-catenary"
              :title="'Liczba niezelektryfikowanych szlaków jednotorowych: ' + station.routes.oneWay.noCatenary"
            >{{station.routes.oneWay.noCatenary}}</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import Card from "@/components/ui/Card.vue";

export default Vue.extend({
  name: "List",
  components: {
    Card
  },
  data: () => ({
    focusedStationName: ""
  }),
  computed: {
    ...mapGetters({ stations: "getStations" }),
    computedStations() {
      return this.stations.sort((a: any, b: any) =>
        a.stationName < b.stationName ? -1 : 1
      );
    },
    focusedStationInfo() {
      return this.stations.find(
        (station: any) => station.stationName === this.focusedStationName
      );
    }
  },
  methods: {
    calculateStyle: (exp: string | number) => {
      const bgColor =
        exp === "L" ? "#26B0D9" : `hsl(${-exp * 5 + 100},  65%, 50%)`;
      const fontColor = exp > 15 ? "white" : "black";

      return `backgroundColor: ${bgColor}; color: ${fontColor}`;
    },

    occupationClasses: (occupiedTo: string) => {
      let className = "";

      switch (occupiedTo) {
        case "KOŃCZY":
          className = "ending";
          break;
        case "NIEZALOGOWANY":
          className = "not-signed";
          break;
        case "BEZ LIMITU":
          className = "no-limit";
          break;
        case "NIEDOSTĘPNY":
          className = "unavailable";
          break;
        case "Z/W":
          className = "brb";
          break;
        case "BRAK MIEJSCA":
          className = "no-space";
          break;
        default:
          break;
      }

      return className;
    },

    setFocusedStation(name: string) {
      this.focusedStationName = name;
    },

    closeCard() {
      this.focusedStationName = "";
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.hour {
  padding: 0.4em;
  border-radius: 1rem;
  font-weight: 500;

  &.ending {
    background-color: $accentCol;
    color: black;
    font-size: 0.9em;
  }

  &.no-limit {
    // background-color: #57ae00;
    font-size: 0.85em;
  }

  &.not-signed {
    background-color: $accent2Col;
    font-size: 0.8em;
  }

  &.unavailable {
    background-color: $accent2Col;
    font-size: 0.9em;
  }

  &.brb {
    background-color: $accentCol;
    color: black;
    font-size: 0.95em;
  }

  &.no-space {
    background-color: #222;
    color: white;
    font-size: 0.85em;
  }
}

.list {
  display: flex;
  justify-content: center;
}

.default-station {
  color: $secondaryCol;
}

.table {
  &-wrapper {
    overflow: auto;
  }

  display: block;
  white-space: nowrap;
  border-collapse: collapse;

  font-size: calc(0.6rem + 0.4vw);

  @include smallScreen() {
    font-size: 0.65rem;
  }

  thead th {
    padding: 0.2rem;
    background-color: #444;
  }

  tr {
    background-color: #5c5b5b;

    &:nth-child(even) {
      background-color: rgb(102, 101, 101);
      color: white;

      a {
        color: white;
      }
    }

    &:hover,
    &:focus {
      background-color: #818181;
      // transform: scale(1.2);
    }

    & > td {
      padding: 0.3rem 1rem;
      margin: 0 3rem;
      text-align: center;
      vertical-align: middle;

      cursor: pointer;

      @include smallScreen() {
        margin: 0;
        padding: 0.1rem 0.5rem;
      }
    }

    .dispatcher-exp {
      & > span {
        display: block;
        width: 2em;
        height: 2em;
        line-height: 2em;
        margin: 0 auto;
      }
    }

    .info,
    .tracks {
      img {
        width: 2.2em;
        margin: 0 0.2em;
        vertical-align: middle;
      }
    }

    .no-catenary {
      background-color: #939393;
    }

    .catenary {
      background-color: #009dce;
    }

    .track {
      margin: 0 0.3rem;
      padding: 0.5em;
    }
  }
}
</style>