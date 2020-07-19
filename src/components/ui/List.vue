<template>
  <div class="list flex">
    <transition name="card-anim">
      <StationCard v-if="focusedStationInfo" :stationInfo="focusedStationInfo" :exit="closeCard" />
    </transition>
    <!-- <div class="info" v-if="stations.length == 0">Ups! Brak stacji do wyświetlenia!</div> -->

    <div class="table-wrapper" v-if="stations.length > 0">
      <table class="table">
        <thead class="table-head">
          <tr>
            <th v-for="(head, i) in headTitles" :key="i" @click="() => changeSorter(i)">
              <span>
                <div>
                  <div>{{head[0]}}</div>
                  <div v-if="head.length > 1">{{head[1]}}</div>
                </div>

                <img
                  class="icon"
                  v-if="sorterActive.index == i"
                  :src="sorterActive.type == 1 ? icons.ascSVG : icons.descSVG"
                  alt
                />
              </span>
            </th>
          </tr>
        </thead>

        <transition-group tag="tbody" class="table-body" name="table-anim">
          <tr
            class="table-item"
            v-for="(station, i) in computedStations"
            :key="i + station.stationHash"
            @click="() => { if(station.online) setFocusedStation(station.stationName) }"
          >
            <td
              class="item-station-name"
              :class="{'default-station': station.default, 'online': station.online}"
            >{{station.stationName}}</td>

            <td class="item-station-level">
              <span
                v-if="station.reqLevel"
                :style="calculateStyle(station.reqLevel)"
              >{{ (station.reqLevel && station.reqLevel > -1) ? (parseInt(station.reqLevel) >= 2 ? station.reqLevel : "L") : "?" }}</span>

              <span v-else>?</span>
            </td>

            <td class="item-station-status">
              <span
                class="status"
                :class="occupationClasses(station.occupiedTo)"
              >{{station.occupiedTo}}</span>
            </td>

            <td class="item-dispatcher-name">{{station.online ? station.dispatcherName : ""}}</td>
            <td class="item-dispatcher-exp">
              <span
                v-if="station.online"
                :style="calculateStyle(station.dispatcherExp)"
              >{{station.dispatcherExp < 2 ? 'L' : station.dispatcherExp}}</span>
            </td>
            <td
              class="item-users"
            >{{station.online ? (station.currentUsers + "/" + station.maxUsers) : ""}}</td>
            <td class="item-info">
              <img
                class="icon-info"
                v-if="station.controlType"
                :src="require(`@/assets/icon-${station.controlType}.svg`)"
                :alt="station.controlType"
                :title="'Sterowanie ' + station.controlType"
              />

              <img
                class="icon-info"
                v-if="station.signalType"
                :src="require(`@/assets/icon-${station.signalType}.svg`)"
                :alt="station.signalType"
                :title="'Sygnalizacja ' + station.signalType"
              />

              <img
                class="icon-info"
                v-if="station.SBL && station.SBL !== ''"
                :src="require(`@/assets/icon-SBL.svg`)"
                alt="SBL"
                title="Sceneria posiada SBL na przynajmniej jednym ze szlaków"
              />

              <img
                class="icon-info"
                v-if="!station.reqLevel || station.nonPublic"
                :src="require(`@/assets/icon-lock.svg`)"
                alt="non-public"
                title="Sceneria niepubliczna"
              />
            </td>

            <td class="item-tracks twoway">
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

            <td class="item-tracks oneway">
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

import styleMixin from "@/mixins/styleMixin";

import StationCard from "@/components/ui/StationCard.vue";

const ascSVG = require("@/assets/icon-arrow-asc.svg");
const descSVG = require("@/assets/icon-arrow-desc.svg");

export default Vue.extend({
  name: "List",
  components: {
    StationCard
  },
  data: () => ({
    focusedStationName: "",
    icons: {
      ascSVG,
      descSVG
    },
    sorterActive: { index: 0, type: 1 },
    headTitles: [
      ["Stacja"],
      ["Wymagany poz.", "dyżurnego"],
      ["Status"],
      ["Dyżurny"],
      ["Poziom", "dyżurnego"],
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
        if (a.stationName >= b.stationName) return type;
        if (a.stationName < b.stationName) return -type;
      };

      switch (this.sorterActive.index) {
        case 0:
        default:
          sortFun = sortByName;
          break;

        case 1:
          sortFun = (a, b) => {
            if (parseInt(a.reqLevel) > parseInt(b.reqLevel)) return type;
            if (parseInt(a.reqLevel) < parseInt(b.reqLevel)) return -type;

            return sortByName(a, b);
          };
          break;

        case 2:
          sortFun = (a, b) => {
            if (a.statusTimestamp > b.statusTimestamp) return type;
            if (a.statusTimestamp < b.statusTimestamp) return -type;

            if (a.occupiedTo > b.occupiedTo) return type;
            if (a.occupiedTo < b.occupiedTo) return -type;

            return sortByName(a, b);
          };
          break;

        case 3:
          sortFun = (a, b) => {
            if (a.dispatcherName > b.dispatcherName) return type;
            if (a.dispatcherName < b.dispatcherName) return -type;

            return sortByName(a, b);
          };
          break;

        case 4:
          sortFun = (a, b) => {
            if (a.dispatcherExp > b.dispatcherExp) return type;
            if (a.dispatcherExp < b.dispatcherExp) return -type;

            return sortByName(a, b);
          };
          break;

        case 5:
          sortFun = (a, b) => {
            if (a.currentUsers > b.currentUsers) return type;
            if (a.currentUsers < b.currentUsers) return -type;

            return sortByName(a, b);
          };
          break;

        case 6:
          sortFun = (a, b) => {
            if (a.currentUsers > b.currentUsers) return type;
            if (a.currentUsers < b.currentUsers) return -type;

            if (a.maxUsers > b.maxUsers) return type;
            if (a.maxUsers < b.maxUsers) return -type;
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
      if (index > 5) return;

      if (index == this.sorterActive.index)
        this.sorterActive.type = this.sorterActive.type == 1 ? -1 : 1;
      else this.sorterActive.type = 1;

      this.sorterActive.index = index;
    },
    calculateStyle(exp: string | number): string {
      const bgColor =
        exp > -1
          ? exp < 2
            ? "#26B0D9"
            : `hsl(${-exp * 5 + 100},  65%, 50%)`
          : "#888";

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
      if (this.focusedStationName == name) this.focusedStationName = "";
      else this.focusedStationName = name;
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

.table {
  &-wrapper {
    overflow: auto;
  }

  display: block;
  white-space: nowrap;
  border-collapse: collapse;

  font-size: calc(0.7rem + 0.3vw);

  @include smallScreen() {
    font-size: 0.75rem;
  }

  &-head th {
    padding: 0.3rem;
    background-color: #444;
    min-width: 120px;

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

  &-item {
    background-color: #5c5b5b;

    &:nth-child(even) {
      background-color: rgb(102, 101, 101);
      color: white;
    }

    &:hover,
    &:focus {
      background-color: #818181;
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
  }

  .item {
    &-station-level,
    &-dispatcher-exp {
      span {
        display: block;

        width: 2em;
        height: 2em;
        line-height: 2em;
        margin: 0 auto;
      }
    }

    &-station-level {
      span {
        background-color: #888;
        border-radius: 50%;
      }
    }

    &-info,
    &-tracks {
      img {
        width: 2.2em;
        margin: 0 0.2em;
        vertical-align: middle;
      }
    }

    &-tracks {
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
}
</style>