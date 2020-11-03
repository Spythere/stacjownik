<template>
  <section class="station-table">
    <div class="table-wrapper">
      <table class="table">
        <thead class="table-head">
          <tr>
            <th
              v-for="(head, i) in headTitles"
              :key="i"
              @click="() => changeSorter(i)"
            >
              <span>
                <div>
                  <div>{{ head[0] }}</div>
                  <div v-if="head.length > 1">{{ head[1] }}</div>
                </div>

                <img
                  class="sort-icon"
                  v-if="sorterActive.index == i"
                  :src="sorterActive.dir == 1 ? icons.ascSVG : icons.descSVG"
                  alt
                />
              </span>
            </th>
          </tr>
        </thead>

        <tr
          class="table-item"
          v-for="(station, i) in stations"
          :key="i + station.stationHash"
          @click="
            () => {
              setFocusedStation(station.stationName);
            }
          "
        >
          <td
            class="item-station-name"
            :class="{
              'default-station': station.default,
              online: station.online,
              'station-unavailable': station.unavailable,
            }"
          >
            {{ station.stationName }}
          </td>

          <td class="item-station-level">
            <span
              v-if="station.reqLevel"
              :style="calculateExpStyle(station.reqLevel)"
              >{{
                station.reqLevel && station.reqLevel > -1
                  ? parseInt(station.reqLevel) >= 2
                    ? station.reqLevel
                    : "L"
                  : "?"
              }}</span
            >

            <span v-else>?</span>
          </td>

          <td class="item-station-status">
            <span class="status" :class="statusClasses(station.occupiedTo)">{{
              station.occupiedTo
            }}</span>
          </td>

          <td class="item-dispatcher-name">
            {{ station.online ? station.dispatcherName : "" }}
          </td>
          <td class="item-dispatcher-exp">
            <span
              v-if="station.online"
              :style="calculateExpStyle(station.dispatcherExp)"
              >{{
                2 > station.dispatcherExp ? "L" : station.dispatcherExp
              }}</span
            >
          </td>
          <td class="item-users">
            {{
              station.online
                ? station.currentUsers + "/" + station.maxUsers
                : ""
            }}
          </td>
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
              :title="
                'Liczba zelektryfikowanych szlaków dwutorowych: ' +
                station.routes.twoWay.catenary
              "
              >{{ station.routes.twoWay.catenary }}</span
            >

            <span
              v-if="station.routes && station.routes.twoWay.noCatenary > 0"
              class="track no-catenary"
              :title="
                'Liczba niezelektryfikowanych szlaków dwutorowych: ' +
                station.routes.twoWay.noCatenary
              "
              >{{ station.routes.twoWay.noCatenary }}</span
            >

            <span class="separator"></span>

            <span
              v-if="station.routes && station.routes.oneWay.catenary > 0"
              class="track catenary"
              :title="
                'Liczba zelektryfikowanych szlaków jednotorowych: ' +
                station.routes.oneWay.catenary
              "
              >{{ station.routes.oneWay.catenary }}</span
            >

            <span
              v-if="station.routes && station.routes.oneWay.noCatenary > 0"
              class="track no-catenary"
              :title="
                'Liczba niezelektryfikowanych szlaków jednotorowych: ' +
                station.routes.oneWay.noCatenary
              "
              >{{ station.routes.oneWay.noCatenary }}</span
            >
          </td>

          <td class="active-timetables">
            <transition name="change-anim" mode="out-in">
              <span :key="station.scheduledTrains.length">
                <span v-if="station.scheduledTrains">
                  <span style="color: #eee">{{
                    station.scheduledTrains.length
                  }}</span>
                  /
                  <span style="color: #bbb">{{
                    station.scheduledTrains.filter(
                      (train) => train.stopInfo.confirmed
                    ).length
                  }}</span>
                </span>

                <span v-else>...</span>
              </span>
            </transition>
          </td>
        </tr>
      </table>
    </div>
    <div class="no-stations" v-if="stations.length == 0">
      Ups! Brak stacji do wyświetlenia!
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import Station from "@/scripts/interfaces/Station";

import styleMixin from "@/mixins/styleMixin";

import Options from "@/components/StationsView/Options.vue";

const ascSVG = require("@/assets/icon-arrow-asc.svg");
const descSVG = require("@/assets/icon-arrow-desc.svg");

@Component({
  components: { Options },
})
export default class StationTable extends styleMixin {
  @Prop() readonly stations!: Station[];
  @Prop() readonly sorterActive!: number;

  @Prop() readonly setFocusedStation!: () => void;
  @Prop() readonly changeSorter!: () => void;

  icons: { ascSVG; descSVG } = { ascSVG, descSVG };

  headTitles: string[][] = [
    ["Stacja"],
    ["Min. poziom", "dyżurnego"],
    ["Status"],
    ["Dyżurny"],
    ["Poziom", "dyżurnego"],
    ["Maszyniści"],
    ["Informacje", "ogólne"],
    ["Szlaki", "2tor | 1tor"],
    ["Aktywne RJ"],
  ];
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
@import "../../styles/variables.scss";

$rowCol: #4b4b4b;

.change-anim {
  &-enter-active,
  &-leave-active {
    transition: opacity 100ms ease-in;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
  }
}

.station-table {
  font-size: calc(0.5rem + 0.35vw);
  overflow: auto;
  overflow-y: hidden;
}

.separator {
  border-left: 3px solid #b3b3b3;
}

.no-stations {
  text-align: center;
  font-size: 1.5em;

  padding: 1rem;
  margin: 1rem 0;

  background: #333;
}

.table {
  &-wrapper {
    overflow: auto;
  }

  white-space: nowrap;
  border-collapse: collapse;

  @include smallScreen() {
    font-size: 0.6rem;
  }

  thead th {
    position: sticky;
    top: 0;
  }

  &-head th {
    padding: 0.3rem;
    background-color: $primaryCol;
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
    background-color: $rowCol;

    &:nth-child(even) {
      background-color: lighten($rowCol, 5);
      color: white;
    }

    &:hover,
    &:focus {
      background-color: lighten($rowCol, 20);
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

.station-unavailable {
  color: #ff1e1e;
  font-weight: bold;
}
</style>