<template>
  <div class="scenery-info">
    <div class="info-header">
      <div class="scenery-name">
        <a
          v-if="stationInfo.stationURL"
          :href="stationInfo.stationURL"
          target="_blank"
          rel="noopener noreferrer"
        >{{ stationInfo.stationName }}</a>

        <span v-else>{{ stationInfo.stationName }}</span>
      </div>
      <div class="scenery-hash">#{{ stationInfo.stationHash }}</div>
    </div>

    <section v-if="!timetableOnly">
      <div class="info-stats">
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
          <span>{{ stationInfo.spawns.length }}</span>
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

      <div class="info-brief">
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

      <div class="info-dispatcher">
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

      <div class="info-lists">
        <div class="user-list">
          <h3 class="user-header">
            GRACZE ONLINE
            <img :src="userIcon" alt="icon-user" />
          </h3>

          <div
            v-for="(train, i) in computedStationTrains"
            class="user"
            :class="train.stopStatus"
            :key="train.trainNo + i"
            @click="() => navigateToTrain(train.trainNo)"
          >
            <span class="user_train">{{ train.trainNo }}</span>
            <span class="user_name">{{ train.driverName }}</span>
          </div>

          <div
            class="user offline"
            v-if="!computedStationTrains || computedStationTrains.length == 0"
          >BRAK AKTYWNYCH GRACZY</div>
        </div>

        <div class="spawn-list">
          <h3 class="spawn-header">
            OTWARTE SPAWNY
            <img :src="spawnIcon" alt="icon-spawn" />
          </h3>

          <span
            class="spawn"
            v-for="(spawn, i) in stationInfo.spawns"
            :key="spawn.spawnName + stationInfo.dispatcherName + i"
          >
            <span class="spawn_name">{{ spawn.spawnName }}</span>
            <span class="spawn_length">{{ spawn.spawnLength }}m</span>
          </span>

          <span
            class="spawn none"
            v-if="!stationInfo.spawns || stationInfo.spawns.length == 0"
          >BRAK OTWARTYCH SPAWNÓW</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import styleMixin from "@/mixins/styleMixin";

@Component
export default class SceneryInfo extends styleMixin {
  @Prop() readonly stationInfo!: Station;
  @Prop() readonly timetableOnly!: boolean;

  likeIcon: string = require("@/assets/icon-like.svg");
  spawnIcon: string = require("@/assets/icon-spawn.svg");
  timetableIcon: string = require("@/assets/icon-timetable.svg");
  userIcon: string = require("@/assets/icon-user.svg");

  get computedStationTrains() {
    if (!this.stationInfo) return null;

    return this.stationInfo.stationTrains.map((stationTrain) => {
      const scheduledData = this.stationInfo?.scheduledTrains.find(
        (scheduledTrain) => scheduledTrain.trainNo === stationTrain.trainNo
      );

      return {
        ...stationTrain,
        stopStatus: scheduledData?.stopStatus || "no-timetable",
      };
    });
  }

  navigateToTrain(trainNo: number) {
    this.$router.push({
      name: "TrainsView",
      params: { passedSearchedTrain: trainNo.toString() },
    });
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
@import "../../styles/user_badge.scss";
@import "../../styles/variables.scss";

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

.info {
  &-header {
    padding: 1rem;

    & > .scenery-name {
      font-size: 3em;
      font-weight: bold;
      color: $accentCol;

      text-transform: uppercase;
    }

    & > .scenery-hash {
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

  &-lists {
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
}

.user,
.spawn {
  font-weight: 600;
  font-size: 0.9em;

  display: inline-block;
  padding: 0;

  background: #585858;

  margin: 0.25em;

  span {
    display: inline-block;
    padding: 0.2em 0.4em;
  }

  @include smallScreen() {
    font-size: 1em;
  }
}

.user {
  cursor: pointer;

  &_train {
    color: black;
    background-color: $no-timetable;

    transition: background-color 200ms;
    -ms-transition: background-color 200ms;
    -webkit-transition: background-color 200ms;
  }

  &.no-timetable {
    pointer-events: none;

    & > .user_train {
      background-color: $no-timetable;
    }
  }

  &.departed > &_train {
    background-color: $departed;
  }

  &.stopped > &_train {
    background-color: $stopped;
  }

  &.online > &_train {
    background-color: $online;
  }

  &.terminated > &_train {
    background-color: $terminated;
  }

  &.disconnected > &_train {
    background-color: $disconnected;
  }

  &.offline {
    background: firebrick;
    pointer-events: none;
  }
}

.spawn {
  &_length {
    background: $accentCol;
    color: black;
  }
}

.spawn.none,
.user.offline {
  font-weight: 600;

  padding: 0.2em 0.4em;
  background: firebrick;

  text-align: center;

  @include smallScreen() {
    font-size: 1em;
  }
}
</style>