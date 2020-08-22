<template>
  <section class="card station-card">
    <div class="card-exit" @click="exit">
      <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
    </div>

    <div class="card-history">
      <div class="history-title title">DZIENNIK STACJI</div>

      <ul class="history-list">
        <div
          class="history-info"
        >Wersja eksperymentalna! Dziennik aktualizuje się automatycznie co godzinę.</div>
        <li class="history-log" v-for="(log, i) in computedHistory" :key="i">
          <div class="log-time">
            <div class="from">
              <span>
                {{ new Date(log.occupiedFrom).toLocaleDateString('pl-PL', {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                }) }}
              </span>
              <span>
                {{ new Date(log.occupiedFrom).toLocaleTimeString('pl-PL', {
                hour: "2-digit",
                minute: "2-digit"
                }) }}
              </span>
            </div>

            <div class="to">
              <span>
                {{ new Date(log.occupiedTo).toLocaleDateString('pl-PL', {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                }) }}
              </span>
              <span>
                {{ new Date(log.occupiedTo).toLocaleTimeString('pl-PL', {
                hour: "2-digit",
                minute: "2-digit"
                }) }}
              </span>
            </div>
          </div>

          <div class="log-dispatcher">{{log.dispatcher}}</div>
        </li>
      </ul>
    </div>

    <div class="card-content" :class="{'offline': !stationInfo.online}">
      <div class="main">
        <div class="main-content">
          <span
            class="main-level flex"
            v-if="stationInfo.reqLevel > -1"
          >{{parseInt(stationInfo.reqLevel) < 2 ? "L" : stationInfo.reqLevel}}</span>
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
  </section>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import styleMixin from "@/mixins/styleMixin";

import db from "@/scripts/firebase/firebaseInit";

@Component
export default class StationCard extends styleMixin {
  @Prop() stationInfo;
  @Prop() dispatcherHistory;
  @Prop() exit!: void;

  history: any[] = [];

  get computedExp(): string {
    return this.stationInfo.dispatcherExp < 2
      ? "L"
      : `${this.stationInfo.dispatcherExp}`;
  }

  toLocaleDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  get computedHistory() {
    return this.history.sort((a, b) => {
      if (a.occupiedFrom < b.occupiedFrom) return 1;
      else return -1;
    });
  }

  async loadHistory() {
    const historyRef = await db
      .collection("history")
      .doc(this.stationInfo.stationName)
      .collection("dispatcherHistory")
      .get();

    this.history = historyRef.docs
      .filter((doc) => doc.data().occupiedTo != 0)
      .map((doc) => {
        const occupiedFrom = doc.data().occupiedFrom;
        const occupiedTo = doc.data().occupiedTo;

        const sameDay =
          new Date(occupiedFrom).getDate() == new Date(occupiedTo).getDate();

        return {
          occupiedFrom,
          occupiedTo,
          dispatcher:
            doc.data().currentDispatcherName || doc.data().dispatcherName,
          sameDay,
        };
      });
  }

  @Watch("stationInfo")
  async onStationChange(val: any, oldVal: any) {
    this.loadHistory();
  }

  created() {
    this.loadHistory();
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

.card {
  padding: 2em;
  text-align: center;

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &-content {
    display: grid;
    grid-template-areas: "main main" "icons icons" "dispatcher hours" "users spawns" "history history";
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 200px;

    gap: 1.5em;

    margin-bottom: 2.5rem;

    &.offline {
      .users,
      .spawns,
      .dispatcher {
        filter: grayscale(1);
        opacity: 0.5;
      }
    }

    @include smallScreen() {
      grid-template-areas: "main main" "icons icons" "dispatcher dispatcher" "hours hours" "users spawns";
    }
  }
}

.card-history {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  // height: 10%;
  min-height: 0;
  max-height: 90%;
  min-width: 100%;

  padding: 0.4rem;
  // border-radius: 1em 1em 0 0;

  z-index: 5;

  background: rgba($color: #000000, $alpha: 0.9);

  font-size: 1em;

  transition: min-height 150ms ease-in, min-width 150ms ease-in,
    font-size 150ms ease-in;

  &:hover {
    min-height: 90%;

    & > .history-list {
      opacity: 1;
      max-height: 350px;
    }

    & > .history-title {
      font-size: 2em;
    }
  }
}

.history {
  &-title {
    transition: font-size 150ms ease-in;
  }

  &-info {
    font-size: 1em;
    color: #999;

    transition: all 150ms ease-in;
  }

  &-list {
    max-height: 0;
    opacity: 0;
    transition: opacity 150ms;

    font-size: 1em;

    transition: max-height 150ms ease-in-out;

    overflow: auto;
  }

  &-log {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0.5em;
    margin: 1em;

    background: #333;

    &:nth-child(odd) {
      background: rgb(92, 92, 92);
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
</style>