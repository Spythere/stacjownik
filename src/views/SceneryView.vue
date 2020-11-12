<template>
  <div class="scenery-view">
    <div
      class="scenery-offline"
      v-if="!stationInfo && dataStatus == 2 && currentPath === '/scenery'"
    >
      Ups! Nie znaleziono danej stacji bądź jest ona offline!
      <button class="button">
        <a href="https://stacjownik-td2.web.app">Wróć na stronę główną</a>
      </button>
    </div>
    <div class="scenery-wrapper" v-if="stationInfo">
      <div class="scenery-header">
        <div class="station-name">{{ stationInfo.stationName }}</div>
        <div class="station-hash">#{{ stationInfo.stationHash }}</div>
      </div>

      <section v-if="!timetableOnly">
        <div class="scenery-stats">
          <span class="likes">
            <img :src="likeIcon" alt="icon-like" />
            <span>{{ stationInfo.dispatcherRate }}</span>
          </span>
          <span class="users">
            <img :src="userIcon" alt="icon-user" />
            <span>{{ stationInfo.currentUsers }}</span>
            /
            <span>{{ stationInfo.maxUsers }}</span>
          </span>
          <span class="spawns">
            <img :src="spawnIcon" alt="icon-spawn" />
            <span>{{ stationInfo.spawnString.length }}</span>
          </span>
          <span class="schedules">
            <img :src="timetableIcon" alt="icon-timetable" />
            <span v-if="stationInfo.scheduledTrains">
              <span style="color: #eee">{{stationInfo.scheduledTrains.length}}</span>
              /
              <span
                style="color: #bbb"
              >{{ stationInfo.scheduledTrains.filter(train => train.stopInfo.confirmed).length }}</span>
            </span>
          </span>
        </div>

        <div class="scenery-brief">
          <img
            v-if="stationInfo.controlType"
            :src="require(`@/assets/icon-${stationInfo.controlType}.svg`)"
            :alt="stationInfo.controlType"
            :title="'Sterowanie ' + stationInfo.controlType"
          />

          <img
            v-if="stationInfo.signalType"
            :src="require(`@/assets/icon-${stationInfo.signalType}.svg`)"
            :alt="stationInfo.signalType"
            :title="'Sygnalizacja ' + stationInfo.signalType"
          />

          <img
            v-if="stationInfo.SBL && stationInfo.SBL !== ''"
            :src="require(`@/assets/icon-SBL.svg`)"
            alt="SBL"
            title="Sceneria posiada SBL na przynajmniej jednym ze szlaków"
          />

          <img
            v-if="stationInfo.default"
            :src="require(`@/assets/icon-td2.svg`)"
            alt="default-pack"
            title="Sceneria domyślnie dostępna w grze"
          />

          <img
            v-if="stationInfo.nonPublic || !stationInfo.reqLevel"
            :src="require(`@/assets/icon-lock.svg`)"
            alt="non-public"
            title="Sceneria niepubliczna"
          />

          <img
            v-if="stationInfo.unavailable"
            :src="require(`@/assets/icon-unavailable.svg`)"
            alt="icon-unavailable"
            title="Sceneria niedostępna"
          />
        </div>

        <div class="scenery-dispatcher">
          <div>
            <span
              class="level"
              :style="calculateExpStyle(stationInfo.dispatcherExp, stationInfo.dispatcherIsSupporter)"
            >{{ stationInfo.dispatcherExp > 1 ? stationInfo.dispatcherExp : "L"}}</span>

            <span class="name">{{ stationInfo.dispatcherName }}</span>
          </div>

          <span
            class="status"
            :class="statusClasses(stationInfo.occupiedTo)"
          >{{ stationInfo.occupiedTo }}</span>
        </div>

        <div class="scenery-info">
          <div class="user-list">
            <h3 class="user-header">
              GRACZE ONLINE
              <img :src="userIcon" alt="icon-user" />
            </h3>
            <ul>
              <li
                class="user user-badge"
                :class="train.stopStatus"
                v-for="train in computedStationTrains"
                :key="train.trainNo + train.driverName"
              >
                <router-link
                  :to="{
                    name: 'TrainsView',
                    params: { passedSearchedTrain: train.trainNo.toString() },
                  }"
                >
                  <span>{{ train.trainNo }}</span>
                  |
                  <span>{{ train.driverName }}</span>
                </router-link>
              </li>
            </ul>

            <span
              class="user offline"
              v-if="
                  !stationInfo.stationTrains ||
                  stationInfo.stationTrains.length == 0
                "
            >BRAK</span>
          </div>
          <div class="spawn-list">
            <h3 class="spawn-header">
              OTWARTE SPAWNY
              <img :src="spawnIcon" alt="icon-spawn" />
            </h3>

            <div>
              <span
                class="spawn"
                v-for="(spawn, i) in stationInfo.spawnString"
                :key="spawn + stationInfo.dispatcherName + i"
              >{{ spawn }}</span>
            </div>
            <span class="spawn" v-if="!stationInfo.spawnString">BRAK</span>
          </div>
        </div>
      </section>

      <div class="scenery-timetables">
        <h3 class="timetable-header">
          <span>AKTYWNE ROZKŁADY JAZDY</span>
          <a v-if="!timetableOnly" :href="currentURL + '&timetable_only=1'" target="_blank">
            <img :src="viewIcon" alt="icon-view" title="Wyodrębnij rozkłady jazdy" />
          </a>
        </h3>

        <span class="timetable-item loading" v-if="timetableDataStatus == 0">Ładowanie...</span>

        <span
          class="timetable-item empty"
          v-else-if="computedScheduledTrains.length == 0"
        >Brak aktywnych rozkładów!</span>

        <div class="timetable-item" v-for="(scheduledTrain, i) in computedScheduledTrains" :key="i">
          <span class="timetable-general">
            <span class="general-info">
              <router-link
                :to="{
                  name: 'TrainsView',
                  params: {
                    passedSearchedTrain: scheduledTrain.trainNo.toString(),
                  },
                }"
              >
                <span>
                  <strong>{{ scheduledTrain.category }}</strong>
                  {{ scheduledTrain.trainNo }}
                </span>
              </router-link>|
              <span>
                <a
                  :href="
                    'https://td2.info.pl/profile/?u=' + scheduledTrain.driverId
                  "
                  target="_blank"
                >{{ scheduledTrain.driverName }}</a>
              </span>

              <div class="info-route">
                <strong>{{ scheduledTrain.beginsAt }} - {{ scheduledTrain.terminatesAt }}</strong>
              </div>
            </span>

            <span class="general-status">
              <span :class="scheduledTrain.stopStatus">{{scheduledTrain.stopLabel}}</span>
            </span>
          </span>

          <span class="timetable-schedule">
            <span class="schedule-arrival">
              <span class="arrival-time begins" v-if="scheduledTrain.stopInfo.beginsHere">
                ROZPOCZYNA
                <div>BIEG</div>
              </span>
              <span class="arrival-time" v-else>
                {{ scheduledTrain.stopInfo.arrivalTimeString }} ({{
                scheduledTrain.stopInfo.arrivalDelay
                }})
              </span>
            </span>

            <span class="schedule-stop">
              <span class="stop-time" v-if="scheduledTrain.stopInfo.stopTime">
                {{ scheduledTrain.stopInfo.stopTime }}
                {{ scheduledTrain.stopInfo.stopType }}
              </span>
              <span class="stop-arrow arrow"></span>
            </span>
            <span class="schedule-departure">
              <span
                class="departure-time terminates"
                v-if="scheduledTrain.stopInfo.terminatesHere"
              >KOŃCZY BIEG</span>
              <span class="departure-time" v-else>
                {{ scheduledTrain.stopInfo.departureTimeString }} ({{
                scheduledTrain.stopInfo.departureDelay
                }})
              </span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";

import { Getter } from "vuex-class";

import styleMixin from "@/mixins/styleMixin";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import StationTimetable from "@/components/StationsView/StationTimetable.vue";


@Component
export default class SceneryView extends styleMixin {
  @Getter('getStationList') storeStationList!: Station[];
  @Getter('getTimetableDataStatus') timetableDataStatus!: number;
  @Getter('getDataStatus') dataStatus!: number;

  likeIcon: string = require('@/assets/icon-like.svg');
  spawnIcon: string = require("@/assets/icon-spawn.svg")
  timetableIcon: string = require("@/assets/icon-timetable.svg")
  userIcon: string = require("@/assets/icon-user.svg")

  viewIcon: string = require("@/assets/icon-view.svg");

  timetableOnly: boolean = false;

  activated() {
    this.timetableOnly = this.$route.query['timetable_only'] == "1" ? true : false;
  }

  get currentPath() {
    return this.$route.path;
  }

  get dataLoaded() {
    return this.storeStationList ? true : false;
  }

  get currentURL() {
    return `${location.origin}/scenery?hash=${this.stationInfo?.stationHash}`;
  }

  get stationInfo(): Station | null {
    if (!this.$route.query.hash || !this.storeStationList) return null;

    return this.storeStationList.find(station => station.stationHash === this.$route.query.hash.toString()) || null;
  }

  get computedDispatcherExp(): string {
    if (!this.stationInfo) return "";


    return this.stationInfo.dispatcherExp < 2
      ? "L"
      : `${this.stationInfo.dispatcherExp}`;
  }

  get computedStationTrains() {
    if (!this.stationInfo) return null;

    return this.stationInfo.stationTrains.map(stationTrain => {
      const scheduledData = this.stationInfo?.scheduledTrains.find(scheduledTrain => scheduledTrain.trainNo === stationTrain.trainNo);

      return {
        ...stationTrain,
        stopStatus: scheduledData?.stopStatus || "no-timetable"
      }
    })
  }

  get computedScheduledTrains() {
    return this.stationInfo?.scheduledTrains.sort((a, b) => {
      if (a.stopInfo.arrivalTimestamp > b.stopInfo.arrivalTimestamp) return 1;
      else if ((a.stopInfo.arrivalTimestamp < b.stopInfo.arrivalTimestamp)) return -1;

      return a.stopInfo.departureTimestamp > b.stopInfo.departureTimestamp ? 1 : -1;
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/responsive.scss";
@import "../styles/variables.scss";
@import "../styles/user_badge.scss";

h3 {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.2em;

  img {
    width: 1.1em;
    margin-left: 0.5em;
  }
}

.scenery {
  &-offline {
    align-self: center;
    font-size: 2em;
    text-align: center;

    color: $warningCol;

    button {
      margin: 1em auto;
    }
  }

  &-view {
    min-height: 100%;

    display: flex;
    justify-content: center;
    align-items: flex-start;

    font-size: calc(0.5rem + 0.65vw);

    @include bigScreen() {
      font-size: 1.25rem;
    }

    @include smallScreen {
      font-size: calc(0.5rem + 1vw);
    }
  }

  &-wrapper {
    // background: #555;
    max-width: 950px;
    width: 75%;

    @include smallScreen {
      width: 95%;
    }

    // max-height: 100vh;
    // overflow: auto;

    background: #333;
    padding: 1em;
    margin: 1rem 0;

    border-radius: 1.5em;

    text-align: center;
  }

  &-header {
    padding: 1rem;

    & > .station-name {
      font-size: 3em;
      font-weight: bold;
      color: $accentCol;

      text-transform: uppercase;
    }

    & > .station-hash {
      font-size: 1em;
      line-height: 0.8em;
      color: #aaa;
    }
  }

  &-stats {
    font-size: 1.3em;
    padding: 1rem 0;

    display: flex;
    justify-content: center;

    & > span {
      display: flex;
      align-items: center;

      margin: 0 0.6em;
    }

    .likes,
    .spawns {
      color: $accentCol;
    }

    span > img {
      width: 1.2em;
      margin-right: 0.5em;
    }
  }

  &-brief {
    padding: 1rem 0;

    img {
      width: 2.5em;
      margin: 0 0.5rem;
    }
  }

  &-dispatcher {
    display: flex;
    align-items: center;
    justify-content: center;

    .level {
      display: inline-block;
      margin-right: 0.3em;
      background: firebrick;

      border-radius: 0.1em;

      width: 1.5em;
      height: 1.5em;
      line-height: 1.5em;
      font-size: 2em;
      font-weight: bold;
    }

    .name {
      font-size: 1.6em;
      margin-right: 1em;
    }

    .status {
      font-size: 1em;
      border-radius: 1em;
    }
  }

  &-info {
    display: flex;

    align-items: center;
    flex-direction: column;

    & > .user-list {
      ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }

  &-timetables {
    margin: 1em 0;
  }
}

.user {
  font-size: 0.85em;

  @include smallScreen() {
    font-size: 1em;
  }
}

.spawn,
.user.offline {
  padding: 0.3em 0.4em;
  background: #585858;

  margin-right: 0.5rem;
  margin-top: 0.5rem;

  font-size: 0.8em;
  text-align: center;

  @include smallScreen() {
    font-size: 1em;
  }
}

.timetable {
  &-header {
    a {
      display: flex;
    }

    img {
      cursor: pointer;
    }
  }

  &-item {
    margin: 1em auto;
    font-size: 0.8em;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));

    padding: 0 0.5rem;

    background: #555;

    @include smallScreen() {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &.loading,
    &.empty {
      padding: 1rem;
      font-size: 1em;
    }

    &.empty {
      color: $accentCol;
    }
  }

  &-general {
    padding: 0.5rem 0.3rem;
    border-radius: 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    text-align: left;

    overflow: hidden;

    @include smallScreen() {
      width: 95%;
      font-size: 1.3em;
    }
  }

  &-schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    font-size: 1.2em;

    @include smallScreen() {
      width: 100%;
      margin: 0.7em 0;
      font-size: 1.8em;
    }
  }
}

.arrow {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 2px;
  margin-left: 50px;

  position: relative;

  transform: rotate(-45deg);

  &::before {
    content: "";
    position: absolute;
    display: block;
    width: 55px;
    height: 3px;
    top: 4px;
    left: 4px;

    transform: translate(-100%, -1px) rotate(45deg);
    transform-origin: right bottom;

    background: white;
  }
}

.general-info {
  span {
    color: $accentCol;
  }

  .info-route {
    margin-top: 0.5em;
  }
}

.general-status {
  span.arriving {
    color: #aaa;
  }

  span.departed {
    color: lime;
    font-weight: bold;
  }

  span.stopped {
    color: #ffa600;
    font-weight: bold;
  }

  span.online {
    color: gold;
  }

  span.terminated {
    color: red;
    font-weight: bold;
  }
}

.schedule {
  &-arrival,
  &-stop,
  &-departure {
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0 0.3rem;
  }

  &-stop {
    display: flex;
    flex-direction: column;

    .stop-time {
      font-size: 0.7em;
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.75em;
}
</style>