<template>
  <div class="card">
    <div class="card-exit" @click="closeCard">
      <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
    </div>

    <div class="card-upper">
      <div class="station-name">
        <a
          v-if="stationInfo.stationURL"
          :href="stationInfo.stationURL"
          target="_blank"
          rel="noopener noreferrer"
        >{{stationInfo.stationName}}</a>
        <span v-else>{{stationInfo.stationName}}</span>
      </div>

      <div class="station-hash">{{stationInfo.stationHash}}</div>

      <div class="station-icons">
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

        <span
          v-if="stationInfo.reqLevel"
          :title="'Wymagany poziom dyżurnego: ' +  stationInfo.reqLevel"
        >{{(parseInt(stationInfo.reqLevel) < 2) ? "L" : stationInfo.reqLevel}}</span>
      </div>

      <div class="station-info"></div>
    </div>

    <div class="card-content">
      <div class="dispatcher">
        <div class="dispatcher-exp">{{stationInfo.dispatcherExp}}</div>
        <div class="dispatcher-name">
          <a
            :href="'https://td2.info.pl/profile/?u=' + stationInfo.dispatcherId"
            target="_blank"
            rel="noopener noreferrer"
          >{{stationInfo.dispatcherName}}</a>
        </div>
      </div>

      <div class="rating">
        <div class="rating-content">
          <img :src="require(`@/assets/icon-like.svg`)" alt="like-icon" />
          {{stationInfo.dispatcherRate}}
        </div>
      </div>

      <div class="occupation">
        <div class="occupation-title text--title">SCENERIA ZAJĘTA DO</div>
        <div class="occupation-content text--content">{{stationInfo.occupiedTo}}</div>
      </div>

      <div class="spawns">
        <div class="spawns-title text--title">OTWARTE SPAWNY</div>
        <div class="spawns-content text--content">
          <span
            class="spawn"
            v-for="(spawn, i) in stationInfo.spawnString"
            :key="spawn + stationInfo.dispatcherName + i"
          >{{spawn}}</span>

          <span class="spawn" v-if="!stationInfo.spawnString">BRAK</span>
        </div>
      </div>

      <div class="users">
        <div class="users-title text--title">GRACZE NA STACJI</div>
        <div class="users-content text--content">
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
  </div>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "Card",
  props: ["stationInfo", "closeCard"],
});
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.text {
  &--title {
    color: #fdc62f;
    font-size: 1em;
  }

  &--content {
    font-size: 0.8em;
  }
}

.station {
  &-name {
    color: #2f2f2f;
    font-size: 2.2em;
    font-weight: 600;

    a {
      color: black;

      &:hover,
      &:focus {
        color: #ffbb00;
      }
    }
  }

  &-hash {
    color: #e7e7e7;
    font-size: 0.7em;
  }

  &-icons {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem;

    img,
    span {
      margin: 0 0.5em;
      width: 2.5em;
      height: 2.5em;
    }

    span {
      background-color: #898989;

      display: flex;
      justify-content: center;
      align-items: center;

      font-weight: bold;

      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
    }
  }
}

.dispatcher {
  grid-area: dispatcher;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  @include smallScreen() {
    flex-direction: column;
  }

  &-exp {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 2em;
    height: 2em;

    font-size: 1.3em;
    border: 2px solid #ffbb00;
    border-radius: 50%;
  }

  &-name {
    font-size: 1.4em;
    font-weight: 600;

    margin-left: 0.6rem;

    @include smallScreen() {
      margin-left: 0;
      margin-top: 0.2em;
    }
  }
}

.rating {
  grid-area: rating;
  color: #00e000;

  &-content {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  font-size: 1.2em;

  img {
    margin-right: 0.5rem;
    width: 1.1em;
  }
}

.occupation {
  grid-area: hours;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &-content {
    color: white;

    font-size: 1.2em;
  }
}

.users {
  grid-area: users;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > .user {
      padding: 0.3rem;
      margin: 0.3rem;
      border: 1px solid white;

      &.borderless {
        border: none;
      }
    }
  }
}

.spawns {
  grid-area: spawns;

  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  overflow: hidden;

  &-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    & > .spawn {
      padding: 0.3rem;
    }
  }
}

.region {
  grid-area: reg;
}
</style>