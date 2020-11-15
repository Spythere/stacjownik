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
</style>