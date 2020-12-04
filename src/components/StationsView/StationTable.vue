<template>
  <section class="station_table">
    <div class="table_wrapper">
      <table>
        <thead>
          <tr>
            <th v-for="(head, i) in headTitles" :key="i" @click="() => changeSorter(i)">
              <span class="header_wrapper">
                <div class="header_item">
                  <div v-if="head[0].includes('.svg')">
                    <img :src="head[0]" alt="test" :title="head[1]" />
                  </div>

                  <div v-else>
                    <div>{{ head[0] }}</div>
                    <div v-if="head.length > 1">{{ head[1] }}</div>
                  </div>
                </div>

                <img
                  class="sort-icon"
                  v-if="sorterActive.index == i"
                  :src="sorterActive.dir == 1 ? ascIcon : descIcon"
                  alt
                />
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            class="station"
            v-for="(station, i) in stations"
            :key="i + station.stationHash"
            @click="setScenery(station.stationHash)"
          >
            <td
              class="station_name"
              :class="{
              'default-station': station.default,
              online: station.online,
              'station-unavailable': station.unavailable,
            }"
            >{{ station.stationName }}</td>

            <td class="station_level">
              <span
                v-if="station.reqLevel"
                :style="calculateExpStyle(station.reqLevel)"
              >{{ station.reqLevel && station.reqLevel > -1 ? parseInt(station.reqLevel) >= 2 ? station.reqLevel : "L" : "?" }}</span>

              <span v-else>?</span>
            </td>

            <td class="station_status">
              <span
                class="status"
                :class="statusClasses(station.occupiedTo)"
              >{{ station.occupiedTo}}</span>
            </td>

            <td class="station_dispatcher-name">{{ station.online ? station.dispatcherName : "" }}</td>

            <td class="station_dispatcher-exp">
              <span
                v-if="station.online"
                :style="calculateExpStyle(station.dispatcherExp)"
              >{{ 2 > station.dispatcherExp ? "L" : station.dispatcherExp }}</span>
            </td>

            <td class="station_tracks twoway">
              <span
                v-if="station.routes && station.routes.twoWay.catenary > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków dwutorowych: ${station.routes.twoWay.catenary}`"
              >{{ station.routes.twoWay.catenary }}</span>

              <span
                v-if="station.routes && station.routes.twoWay.noCatenary > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków dwutorowych: ${station.routes.twoWay.noCatenary}`"
              >{{ station.routes.twoWay.noCatenary }}</span>

              <span class="separator"></span>

              <span
                v-if="station.routes && station.routes.oneWay.catenary > 0"
                class="track catenary"
                :title="`Liczba zelektryfikowanych szlaków jednotorowych: ${station.routes.oneWay.catenary}`"
              >{{ station.routes.oneWay.catenary }}</span>

              <span
                v-if="station.routes && station.routes.oneWay.noCatenary > 0"
                class="track no-catenary"
                :title="`Liczba niezelektryfikowanych szlaków jednotorowych: ${station.routes.oneWay.noCatenary}`"
              >{{ station.routes.oneWay.noCatenary }}</span>
            </td>

            <td class="station_info">
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

            <td class="station_users">
              <span>
                <span class="highlight">{{ station.currentUsers }}</span>
                /
                <span>{{ station.maxUsers }}</span>
              </span>
            </td>

            <td class="station_spawns">
              <span class="highlight">{{ station.spawns.length }}</span>
            </td>

            <td class="station_schedules">
              <span class="highlight">{{station.scheduledTrains.length}} &nbsp;</span>
              /
              <span
                style="color: #bbb"
              >{{ station.scheduledTrains.filter(train => train.stopInfo.confirmed).length }}</span>
            </td>
            <!-- 
            <td class="station_stats">
              <div class="stats_wrapper"></div>
            </td>-->
          </tr>
        </tbody>
      </table>
    </div>

    <div class="no-stations" v-if="stations.length == 0">Ups! Brak stacji do wyświetlenia!</div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import Station from "@/scripts/interfaces/Station";

import styleMixin from "@/mixins/styleMixin";

import Options from "@/components/StationsView/Options.vue";

@Component({
  components: { Options },
})
export default class StationTable extends styleMixin {
  @Prop() readonly stations!: Station[];
  @Prop() readonly sorterActive!: number;

  @Prop() readonly setFocusedStation!: () => void;
  @Prop() readonly changeSorter!: () => void;

  likeIcon: string = require("@/assets/icon-like.svg");
  spawnIcon: string = require("@/assets/icon-spawn.svg");
  timetableIcon: string = require("@/assets/icon-timetable.svg");
  userIcon: string = require("@/assets/icon-user.svg");
  trainIcon: string = require("@/assets/icon-train.svg");

  ascIcon: string = require("@/assets/icon-arrow-asc.svg");
  descIcon: string = require("@/assets/icon-arrow-desc.svg");

  headTitles: string[][] = [
    ["Stacja"],
    ["Min. poziom", "dyżurnego"],
    ["Status"],
    ["Dyżurny"],
    ["Poziom", "dyżurnego"],
    ["Szlaki", "2tor | 1tor"],
    ["Informacje", "ogólne"],
    [this.userIcon, "Mechanicy online"],
    [this.spawnIcon, "Otwarte spawny"],
    [this.timetableIcon, "Aktywne RJ"],
  ];

  setScenery(sceneryHash: string) {
    const station = this.stations.find(
      (station) => station.stationHash === sceneryHash
    );

    if (!station) return;

    if (!station.online) {
      location.href = station.stationURL;
      return;
    }

    this.$router.push({ name: "SceneryView", query: { hash: sceneryHash } });
  }
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

.highlight {
  color: gold;
}

section.station_table {
  overflow: auto;
  overflow-y: hidden;
  font-size: calc(0.55rem + 0.35vw);
  font-weight: 500;

  @include smallScreen() {
    font-size: 0.6rem;
  }
}

.table_wrapper {
  overflow: auto;
}

table {
  white-space: nowrap;
  border-collapse: collapse;

  thead th {
    position: sticky;
    top: 0;

    min-width: 85px;

    padding: 0.3rem;
    background-color: $primaryCol;

    cursor: pointer;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    span {
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 1.5em;
        vertical-align: middle;
      }
    }
  }
}

tr.station {
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
    text-align: center;

    cursor: pointer;

    @include smallScreen() {
      margin: 0;
      padding: 0.1rem 0.5rem;
    }
  }
}

td.station {
  &_level,
  &_dispatcher-exp {
    span {
      display: block;

      width: 2em;
      height: 2em;
      line-height: 2em;
      margin: 0 auto;
    }
  }

  &_level {
    span {
      background-color: #888;
      border-radius: 50%;
    }
  }

  &_info,
  &_tracks {
    img {
      width: 2.2em;
      margin: 0 0.2em;
      vertical-align: middle;
    }
  }

  &_tracks {
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

.station-unavailable {
  color: #ff1e1e;
  font-weight: bold;
}
</style>