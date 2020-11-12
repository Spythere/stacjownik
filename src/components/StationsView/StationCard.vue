<template>
  <section class="card station-card">
    <div class="card-exit">
      <img
        class="schedule-icon"
        :src="require('@/assets/icon-clock.svg')"
        alt="schedule-icon"
        @click="() => (cardMode = cardMode == 0 ? 1 : 0)"
      />
      <img :src="require('@/assets/icon-exit.svg')" alt="exit-icon" @click="exit" />
    </div>

    <div class="card-content" :class="{ offline: !stationInfo.online }">
      <div class="main">
        <div class="main-content">
          <span class="main-level flex" v-if="stationInfo.reqLevel > -1">
            {{
            2 > parseInt(stationInfo.reqLevel) ? "L" : stationInfo.reqLevel
            }}
          </span>
          <span class="main-general">
            <div class="main-name">
              <a
                v-if="stationInfo.stationURL"
                :href="stationInfo.stationURL"
                target="_blank"
                rel="noopener noreferrer"
              >{{ stationInfo.stationName }}</a>

              <span v-else>{{ stationInfo.stationName }}</span>
            </div>
            <div class="main-hash">{{ stationInfo.stationHash }}</div>
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
          :style="
            calculateExpStyle(
              stationInfo.dispatcherExp,
              stationInfo.dispatcherIsSupporter
            )
          "
        >{{ stationInfo.online ? computedDispatcherExp : "" }}</div>
        <div class="dispatcher-info">
          <div class="dispatcher-name">
            <a
              :href="
                'https://td2.info.pl/profile/?u=' + stationInfo.dispatcherId
              "
              target="_blank"
              rel="noopener noreferrer"
            >{{ stationInfo.dispatcherName || "---" }}</a>
          </div>

          <div class="dispatcher-rate">
            <img :src="require(`@/assets/icon-like.svg`)" alt="like-icon" />
            <span>{{ stationInfo.dispatcherRate }}</span>
          </div>
        </div>
      </div>

      <div class="hours">
        <div class="hours-title title">STATUS</div>
        <span class="status" :class="statusClasses(stationInfo.occupiedTo)">
          {{
          stationInfo.occupiedTo
          }}
        </span>
      </div>

      <div class="spawns flex flex-column">
        <h3 class="spawns-title title">OTWARTE SPAWNY</h3>
        <div class="spawns-content">
          <span
            class="spawn"
            v-for="(spawn, i) in stationInfo.spawnString"
            :key="spawn + stationInfo.dispatcherName + i"
          >{{ spawn }}</span>

          <span class="spawn" v-if="!stationInfo.spawnString">BRAK</span>
        </div>
      </div>

      <div class="users flex flex-column">
        <h3 class="users-title title">GRACZE NA STACJI</h3>
        <div class="users-content">
          <div
            class="user-badge"
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
          </div>

          <span
            class="user borderless"
            v-if="
              !stationInfo.stationTrains ||
              stationInfo.stationTrains.length == 0
            "
          >BRAK</span>
        </div>
      </div>
    </div>

    <StationTimetable
      :class="{ show: cardMode == 1 }"
      :scheduledTrains="this.stationInfo.scheduledTrains"
      :stationName="stationInfo.stationName"
    />
  </section>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";

import styleMixin from "@/mixins/styleMixin";

import Station from "@/scripts/interfaces/Station";
import Train from "@/scripts/interfaces/Train";

import StationTimetable from "@/components/StationsView/StationTimetable.vue";

@Component({
  components: {
    StationTimetable
  }
})
export default class StationCard extends styleMixin {
  @Prop() stationInfo!: Station;
  @Prop() exit!: void;

  cardMode: number = 0;

  get computedDispatcherExp(): string {
    return this.stationInfo.dispatcherExp < 2
      ? "L"
      : `${this.stationInfo.dispatcherExp}`;
  }

  get computedStationTrains() {
    return this.stationInfo.stationTrains.map(stationTrain => {
      const scheduledData = this.stationInfo.scheduledTrains.find(scheduledTrain => scheduledTrain.trainNo === stationTrain.trainNo);

      return {
        ...stationTrain,
        stopStatus: scheduledData?.stopStatus || "no-timetable"
      }
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";
@import "../../styles/user_badge.scss";

.title {
  color: $accentCol;
  font-weight: 600;
  margin: 0.5em 0;
}

.card {
  padding: 2em;
  text-align: center;

  font-size: calc(0.5rem + 0.4vw);
  max-width: 800px;

  @include bigScreen {
    font-size: 1rem;
  }

  @include smallScreen {
    font-size: 0.8em;
    width: 100%;
  }

  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;

  &-exit {
    z-index: 3;
    display: flex;
    align-items: center;

    img {
      font-size: 1.6em;
      margin: 0.1em 0.1em;
    }

    .schedule-icon {
      font-size: 1.4em;
    }
  }

  &-content {
    position: relative;
    margin-top: 1rem;

    display: grid;
    grid-template-areas: "main main" "icons icons" "dispatcher hours" "users spawns";
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 200px;
    max-height: 600px;

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

    font-size: 3em;
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