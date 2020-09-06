<template>
  <section class="card station-card">
    <div class="card-exit">
      <img
        class="schedule-icon"
        :src="require('@/assets/icon-clock.svg')"
        alt="schedule-icon"
        @click="() => cardMode = cardMode == 0 ? 1 : 0"
      />
      <img :src="require('@/assets/icon-exit.svg')" alt="exit-icon" @click="exit" />
    </div>

    <div class="card-content" :class="{'offline': !stationInfo.online}">
      <div class="main">
        <div class="main-content">
          <span
            class="main-level flex"
            v-if="stationInfo.reqLevel > -1"
          >{{ 2 > parseInt(stationInfo.reqLevel) ? "L" : stationInfo.reqLevel}}</span>
          <span class="main-general">
            <div class="main-name">
              <a
                v-if="stationInfo.stationURL"
                :href="stationInfo.stationURL"
                target="_blank"
                rel="noopener noreferrer"
              >{{stationInfo.stationName}}</a>

              <span v-else>{{stationInfo.stationName}}</span>
            </div>
            <div class="main-hash">{{stationInfo.stationHash}}</div>
          </span>
        </div>
      </div>

      <div class="icons">
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

      <div class="dispatcher">
        <div
          class="dispatcher-level flex"
          :style="calculateExpStyle(stationInfo.dispatcherExp)"
        >{{stationInfo.online ? computedExp : ""}}</div>
        <div class="dispatcher-info">
          <div class="dispatcher-name">
            <a
              :href="'https://td2.info.pl/profile/?u=' + stationInfo.dispatcherId"
              target="_blank"
              rel="noopener noreferrer"
            >{{stationInfo.dispatcherName || "---"}}</a>
          </div>

          <div class="dispatcher-rate">
            <img :src="require(`@/assets/icon-like.svg`)" alt="like-icon" />
            <span>{{stationInfo.dispatcherRate}}</span>
          </div>
        </div>
      </div>

      <div class="hours">
        <div class="hours-title title">STATUS</div>
        <span
          class="status"
          :class="statusClasses(stationInfo.occupiedTo)"
        >{{stationInfo.occupiedTo}}</span>
      </div>

      <div class="spawns flex flex-column">
        <h3 class="spawns-title title">OTWARTE SPAWNY</h3>
        <div class="spawns-content">
          <span
            class="spawn"
            v-for="(spawn, i) in stationInfo.spawnString"
            :key="spawn + stationInfo.dispatcherName + i"
          >{{spawn}}</span>

          <span class="spawn" v-if="!stationInfo.spawnString">BRAK</span>
        </div>
      </div>

      <div class="users flex flex-column">
        <h3 class="users-title title">GRACZE NA STACJI</h3>
        <div class="users-content">
          <div
            class="user"
            v-for="train in stationInfo.trains"
            :key="train.trainNo + train.driverName"
          >
            <a
              :href="'https://rj.td2.info.pl/train#' + train.trainNo + ';eu'"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{train.trainNo}}</span>
              |
              <span>{{train.driverName}}</span>
            </a>
          </div>

          <span
            class="user borderless"
            v-if="!stationInfo.trains || stationInfo.trains.length == 0"
          >BRAK</span>
        </div>
      </div>
    </div>

    <div class="card-timetables" id="card-timetables" :class="{show: cardMode == 1}">
      <div class="timetables-wrapper">
        <div class="timetables-title title">
          <div style="font-size: 1.5em;">{{stationInfo.stationName.toUpperCase()}}</div>
          <div style="font-size: 0.7em;">AKTYWNE ROZKŁADY JAZDY</div>
        </div>

        <div class="timetables-content">
          <div class="timetable" v-for="(timetable, i) in computedScheduledTrains" :key="i">
            <span class="timetable-general">
              <span class="general-info">
                <router-link
                  :to="{ name: 'TrainsView', params: { passedSearchedTrain: timetable.trainNo.toString()}}"
                >
                  <span>
                    {{timetable.category}}
                    {{timetable.trainNo}}
                  </span>
                </router-link>|
                <span>
                  <a
                    :href="'https://td2.info.pl/profile/?u=' + timetable.driverId"
                    target="_blank"
                  >{{ timetable.driverName }}</a>
                </span>
              </span>

              <span class="general-confirmed">
                <span
                  style="color: gold"
                  v-if="timetable.stopped || (timetable.beginsHere && !timetable.confirmed)"
                >Na stacji</span>
                <span style="color: #aaa" v-else-if="!timetable.confirmed">W drodze</span>
                <span
                  style="color: red"
                  v-else-if="(timetable.terminatesHere && timetable.confirmed)"
                >Skończył bieg</span>
                <span style="color: lime" v-else>Odprawiony</span>
              </span>
            </span>

            <span class="timetable-schedule">
              <span class="schedule-arrival">
                <span class="arrival-time begins" v-if="timetable.beginsHere">ROZPOCZYNA BIEG</span>
                <span
                  class="arrival-time"
                  v-else
                >{{timestampToTime(timetable.arrivalTime)}} ({{timetable.arrivalDelay}})</span>
              </span>

              <span class="schedule-stop">
                <span
                  class="stop-time"
                  v-if="timetable.stopTime"
                >{{timetable.stopTime}} {{timetable.stopType}}</span>
                <span class="stop-arrow arrow"></span>
              </span>
              <span class="schedule-departure">
                <span class="departure-time terminates" v-if="timetable.terminatesHere">KOŃCZY BIEG</span>
                <span
                  class="departure-time"
                  v-else
                >{{timestampToTime(timetable.departureTime)}} ({{timetable.departureDelay}})</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import styleMixin from "@/mixins/styleMixin";

import Station from "@/scripts/interfaces/Station";

@Component
export default class StationCard extends styleMixin {
  @Prop() stationInfo!: Station;
  @Prop() exit!: void;

  history: any[] = [];
  cardMode: number = 0;

  get computedExp(): string {

    return this.stationInfo.dispatcherExp < 2
      ? "L"
      : `${this.stationInfo.dispatcherExp}`;
  }

  get computedScheduledTrains() {
    return this.stationInfo.scheduledTrains.sort((a, b) => {
      if (a.arrivalTime > b.arrivalTime) return 1;
      else if ((a.arrivalTime < b.arrivalTime)) return -1;

      return a.departureTime > b.departureTime ? 1 : -1;
    })
  }

  timestampToTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
</script>

<style lang="scss">
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";
.title {
  color: $accentCol;
  font-weight: 600;
  margin: 0.5em 0;
}

.station-card {
  scroll-behavior: smooth;

  font-size: calc(0.55rem + 0.3vw);

  @include bigScreen {
    font-size: 1.1rem;
  }
}

.card {
  padding: 2em;
  text-align: center;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &-exit {
    z-index: 3;

    img {
      margin: 0.1em 0.3em;
      font-size: 1.6em;
    }
  }

  &-content {
    position: relative;
    margin-top: 1rem;

    display: grid;
    grid-template-areas: "main main" "icons icons" "dispatcher hours" "users spawns" "history history";
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 200px;
    max-height: 500px;

    transform: translateY(0%);

    gap: 1.5em;

    &.offline {
      .users,
      .spawns,
      .dispatcher {
        filter: grayscale(1);
        opacity: 0.5;
      }
    }

    @include smallScreen() {
      grid-template-areas: "main main" "icons icons" "dispatcher dispatcher" "hours hours" "users users" "spawns spawns";
    }
  }
}

.main {
  grid-area: main;
  text-align: center;

  &-content {
    display: flex;
    justify-content: center;
    align-items: center;

    @include smallScreen() {
      flex-direction: column;
    }
  }

  &-level {
    background: $accentCol;
    color: black;

    font-size: 2.5em;
    font-weight: 600;

    border-radius: 50%;
    width: 1.7em;
    height: 1.7em;
    margin: 0.3em 0.5em;
  }

  &-hash {
    color: #9d9d9d;
  }

  &-name {
    color: $accentCol;
    font-weight: 600;
    font-size: 2.3em;
    text-transform: uppercase;
  }
}

.icons {
  grid-area: icons;

  display: flex;
  justify-content: center;

  img {
    max-width: 3em;
    margin: 0 0.4em;
  }
}

.dispatcher {
  grid-area: dispatcher;

  display: flex;
  justify-content: center;

  &-level {
    font-size: 2.5em;
    font-weight: bold;
    margin-right: 0.3em;

    max-width: 2em;

    background: forestgreen;
  }

  &-info {
    display: flex;
    justify-content: space-between;
    flex-direction: column;

    padding: 0.5em;
  }

  &-name {
    font-size: 1.35em;
    font-weight: bold;
    padding-bottom: 0.5em;
  }

  &-rate {
    display: flex;
    font-size: 1.3em;

    span {
      margin: 0 0.3em;
      color: $accentCol;
    }

    img {
      width: 1.2em;
    }
  }
}

.hours {
  grid-area: hours;

  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;

  .status {
    font-size: 1.1em;
  }
}

.users {
  grid-area: users;

  &-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > .user {
      padding: 0.3rem;
      margin: 0.3rem;
      border: 1px solid white;
      border-radius: 0.4em;

      &.borderless {
        border: none;
        margin: 0;
        padding: 0;
      }
    }
  }
}

.spawns {
  grid-area: spawns;

  overflow: hidden;

  &-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > .spawn {
      padding: 0.3em 0.4em;
      margin: 0.3em;
      background: #585858;

      text-align: center;
    }
  }
}

.card-timetables {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  overflow: hidden;

  transform: translateY(-100%);
  -webikit-transform: translateY(-100%);

  &.show {
    transform: translateY(0);
    -webkit-transform: translateY(0);
  }

  transition: transform 150ms ease-out;

  background: #333;
}

.timetables {
  &-content {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  &-title {
    padding-top: 2rem;
    padding-bottom: 0.3rem;
    font-size: 1.6em;
  }

  &-wrapper {
    height: 100%;

    display: flex;
    flex-direction: column;
  }
}

.timetable {
  margin: 1em auto;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 0 1rem;

  padding: 0 2rem;

  @include smallScreen() {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &-general {
    padding: 0.3rem 0.5rem;
    border: 1px solid white;

    display: flex;
    justify-content: space-between;

    @include smallScreen() {
      width: 95%;
    }
  }

  &-schedule {
    @include smallScreen() {
      width: 80%;
      margin: 0.7em 0;
    }

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    font-size: 1.2em;
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