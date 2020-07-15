<template>
  <div class="list flex">
    <Card :stationInfo="focusedStationInfo" :closeCard="closeCard" />

    <!-- <div class="info" v-if="stations.length == 0">Ups! Brak stacji do wyświetlenia!</div> -->

    <div class="table-wrapper" v-if="stations.length > 0">
      <table class="table">
        <thead>
          <tr>
            <th v-for="(head, i) in headTitles" :key="i" @click="() => changeSorter(i)">
              <span>
                <div>
                  <div>{{head[0]}}</div>
                  <div v-if="head.length > 1">{{head[1]}}</div>
                </div>

                <Icon
                  :name="`arrow-${sorterActive.type == 1 ? 'asc' : 'desc'}`"
                  v-if="sorterActive.index == i"
                />
              </span>
            </th>
          </tr>
        </thead>

        <transition-group tag="tbody" name="table-anim">
          <tr
            class="table-item"
            v-for="(station, i) in computedStations"
            :key="i + station.stationHash"
            @click="() => { if(station.online) setFocusedStation(station.stationName) }"
          >
            <td
              class="station-name"
              :class="{'default-station': station.default, 'online': station.online}"
            >{{station.stationName}} {{ station.reqLevel ? "| " + (parseInt(station.reqLevel) >= 2 ? station.reqLevel : "L") : "" }}</td>
            <td class="hours">
              <span
                class="hour"
                :class="occupationClasses(station.occupiedTo)"
              >{{station.occupiedTo}}</span>
            </td>

            <td class="disptacher-name">{{station.online ? station.dispatcherName : ""}}</td>
            <td class="dispatcher-exp">
              <span
                v-if="station.online"
                :style="calculateStyle(station.dispatcherExp)"
              >{{station.dispatcherExp < 2 ? 'L' : station.dispatcherExp}}</span>
            </td>
            <td
              class="users"
            >{{station.online ? (station.currentUsers + "/" + station.maxUsers) : ""}}</td>
            <td class="info">
              <!-- <img
                v-if="station.default"
                :src="require(`@/assets/icon-td2.svg`)"
                alt="default"
                title="Sceneria domyślnie dostępna w grze"
              />-->

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
        </transition-group>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters } from "vuex";

import Card from "@/components/ui/Card.vue";
import Icon from "@/components/ui/Icon.vue";

export default Vue.extend({
  name: "List",
  components: {
    Card,
    Icon
  },
  data: () => ({
    focusedStationName: "",
    sorterActive: { index: 0, type: 1 },
    headTitles: [
      ["Stacja"],
      ["Status"],
      ["Dyżurny"],
      ["Poziom"],
      ["Maszyniści"],
      ["Informacje", "ogólne"],
      ["Szlaki", "dwutorowe"],
      ["Szlaki", "jednotorowe"]
    ]
  }),
  computed: {
    ...mapGetters({ stations: "getStations" }),
    computedStations() {
      let sortFun;
      const type: number = this.sorterActive.type;

      const sortByName = (a, b) => {
        if (a.stationName > b.stationName) return type;
        if (a.stationName < b.stationName) return -type;
      };

      switch (this.sorterActive.index) {
        case 0:
        default:
          sortFun = sortByName;
          break;

        case 1:
          sortFun = (a, b) => {
            if (a.occupiedTo > b.occupiedTo) return type;
            if (a.occupiedTo < b.occupiedTo) return -type;

            sortByName(a, b);

            return 0;
          };
          break;

        case 2:
          sortFun = (a, b) => {
            if (a.dispatcherName > b.dispatcherName) return type;
            if (a.dispatcherName < b.dispatcherName) return -type;

            sortByName(a, b);

            return 0;
          };
          break;

        case 3:
          sortFun = (a, b) => {
            if (a.dispatcherExp > b.dispatcherExp) return type;
            if (a.dispatcherExp < b.dispatcherExp) return -type;

            // TO DO: naprawić bugujące się sortowanie

            // sortByName(a, b);

            return 0;
          };
          break;

        case 4:
          sortFun = (a, b) => {
            if (a.currentUsers > b.currentUsers) return type;
            if (a.currentUsers < b.currentUsers) return -type;

            sortByName(a, b);

            return 0;
          };
          break;

        case 5:
          sortFun = (a, b) => {
            if (a.currentUsers > b.currentUsers) return type;
            if (a.currentUsers < b.currentUsers) return -type;

            if (a.maxUsers > b.maxUsers) return type;
            if (a.maxUsers < b.maxUsers) return -type;

            return 0;
          };
          break;
      }

      return this.stations.sort(sortFun);
    },
    focusedStationInfo() {
      return this.stations.find(
        (station: any) => station.stationName === this.focusedStationName
      );
    }
  },
  methods: {
    changeSorter(index: number) {
      if (index >= 5) return;

      if (index == this.sorterActive.index)
        this.sorterActive.type = this.sorterActive.type == 1 ? -1 : 1;
      else this.sorterActive.type = 1;

      this.sorterActive.index = index;
    },
    calculateStyle: (exp: string | number) => {
      const bgColor = exp < 2 ? "#26B0D9" : `hsl(${-exp * 5 + 100},  65%, 50%)`;
      const fontColor = exp > 15 ? "white" : "black";

      return `backgroundColor: ${bgColor}; color: ${fontColor}`;
    },

    occupationClasses: (occupiedTo: string) => {
      let className = "";

      switch (occupiedTo) {
        case "WOLNA":
          className = "free";
          break;
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
  font-weight: bold;

  background-color: #00be19;

  &.free {
    background-color: #8a8a8a;
    font-size: 0.95em;
  }

  &.ending {
    background-color: $accentCol;
    color: black;
    font-size: 0.9em;
  }

  &.no-limit {
    background-color: #0077ae;
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

.default-station {
  font-weight: bold;
  color: $accentCol;
}

.table {
  &-wrapper {
    overflow: auto;
  }

  display: block;
  white-space: nowrap;
  border-collapse: collapse;

  font-size: calc(0.6rem + 0.35vw);

  @include smallScreen() {
    font-size: 0.75rem;
  }

  th {
    padding: 0.3rem;
    background-color: #444;
    min-width: 150px;

    cursor: pointer;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    span {
      display: flex;
      align-items: center;
      justify-content: center;

      & > img {
        width: 1.5em;
      }
    }
  }

  tr {
    background-color: #5c5b5b;

    &:nth-child(even) {
      background-color: rgb(102, 101, 101);
      color: white;
    }

    &:hover,
    &:focus {
      background-color: #818181;
    }

    td {
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