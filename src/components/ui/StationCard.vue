<template>
  <section class="card station-card">
    <div class="card-exit" @click="exit">
      <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
    </div>

    <div class="card-content">
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
          :style="calculateStyle(stationInfo.dispatcherExp)"
        >{{computedExp}}</div>
        <div class="dispatcher-info">
          <div class="dispatcher-name">
            <a
              :href="'https://td2.info.pl/profile/?u=' + stationInfo.dispatcherId"
              target="_blank"
              rel="noopener noreferrer"
            >{{stationInfo.dispatcherName}}</a>
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
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class StationCard extends Vue {
  @Prop() stationInfo;
  @Prop() exit!: void;

  calculateStyle(exp: number): string {
    const bgColor = exp < 2 ? "#26B0D9" : `hsl(${-exp * 5 + 100},  65%, 50%)`;
    const fontColor = exp > 15 ? "white" : "black";

    return `backgroundColor: ${bgColor}; color: ${fontColor}`;
  }

  statusClasses(status: string) {
    let className = "";

    switch (status) {
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
  }

  get computedExp(): string {
    return this.stationInfo.dispatcherExp < 2
      ? "L"
      : `${this.stationInfo.dispatcherExp}`;
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
    grid-template-areas: "main main" "icons icons" "dispatcher hours" "users spawns";
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 200px;

    gap: 1.5em;

    @include smallScreen() {
      grid-template-areas: "main main" "icons icons" "dispatcher dispatcher" "hours hours" "users spawns";
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