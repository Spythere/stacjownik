<template>
  <div class="train-table">
    <div class="no-trains" v-if="computedTrains.length == 0">Ups! Brak pociągów do wyświetlenia :/</div>

    <ul class="list">
      <li class="item" v-for="(train, i) in computedTrains" :key="i">
        <span class="info">
          <div class="info-top">
            <div class="info-category">
              <span>
                <strong>{{ train.timetableData.category }}</strong>
                {{ train.trainNo }} |
              </span>
              <span style=" color: gold;">{{ train.timetableData.routeDistance }} km</span>
            </div>

            <div class="info-warnings">
              <span class="warning twr" v-if="train.timetableData.TWR">TWR</span>
              <span class="warning skr" v-if="train.timetableData.SKR">SKR</span>
            </div>

            <div class="info-route">
              <a :href="'https://rj.td2.info.pl/train#' + train.trainNo + ';eu'" target="_blank">
                <strong>
                  {{
                  train.timetableData.route.replace("|", " - ")
                  }}
                </strong>
              </a>
            </div>

            <div class="info-stations">
              <span v-if="train.timetableData.followingStops.length > 2">
                Przez:
                <span v-html="generateStopList(train.timetableData.followingStops)"></span>
              </span>
            </div>
          </div>

          <div class="info-bottom">
            <span
              class="info-online"
              :class="{'online': train.online}"
            >{{train.online ? "ONLINE" : "OFFLINE"}}</span>
          </div>
        </span>

        <span class="driver">
          <span class="driver-name">
            <a
              :href="'https://td2.info.pl/profile/?u=' + train.driverId"
              target="_blank"
            >{{ train.driverName }}</a>
            <span style="color: #bbb; margin-left: 1em;">
              {{
              train.locoType
              }}
            </span>
          </span>
          <span class="driver-loco">
            <img :src="train.locoURL" @error="onImageError" />
          </span>
        </span>

        <span class="stats">
          <div class="stats-general">
            <span class="stat mass">
              <img :src="massIcon" alt="icon-mass" />
              {{ train.mass / 1000 }}t
            </span>

            <span class="stat speed">
              <img :src="speedIcon" alt="icon-speed" />
              {{ train.speed }} km/h
            </span>

            <span class="stat length">
              <img :src="lengthIcon" alt="icon-length" />
              {{ train.length }}m
            </span>
          </div>

          <div class="stats-position">
            <span class="stat station">
              <div class="stat-icon">
                <img :src="sceneryIcon" alt="icon-scenery" />
              </div>
              {{ train.currentStationName || "---" }}
            </span>
            <span class="stat track">
              <div class="stat-icon">
                <img :src="routeIcon" alt="icon-scenery" />
              </div>
              {{ train.connectedTrack || "---" }}
            </span>
            <span class="stat signal">
              <div class="stat-icon">
                <img :src="signalIcon" alt="icon-scenery" />
              </div>
              {{ train.signal || "---" }}
            </span>
            <span class="stat distance">
              <div class="stat-icon">
                <img :src="distanceIcon" alt="icon-scenery" />
              </div>
              {{ train.distance || "0" }}m
            </span>
          </div>
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

const unknownTrainImage = require("@/assets/unknown.png");

import Train from "@/scripts/interfaces/Train";
import Station from "@/scripts/interfaces/Station";

@Component
export default class TrainTable extends Vue {
  @Prop() readonly computedTrains!: Train[];

  speedIcon: string = require("@/assets/icon-speed.svg");
  massIcon: string = require("@/assets/icon-mass.svg");
  lengthIcon: string = require("@/assets/icon-length.svg");

  distanceIcon: string = require("@/assets/icon-distance.svg");
  sceneryIcon: string = require("@/assets/icon-scenery.svg");
  signalIcon: string = require("@/assets/icon-signal.svg");
  routeIcon: string = require("@/assets/icon-route.svg");

  onImageError(e: Event) {
    (e.target as HTMLImageElement).src = unknownTrainImage;
  }

  generateStopList(stops: any): string | undefined {
    if (!stops) return "";
    return stops.reduce((acc, stop, i) => {

      if (stop.stopType.includes("ph")) acc.push(`<strong>${stop.stopName}</strong>`);
      else if (i > 0 && i < stops.length - 1) acc.push(`<span style='color: #ccc;'>${stop.stopName}</span>`);
      // if (stop.stopType == "podg.") acc.push(`<span style='color: #ccc;'>${stop.stopName}</span>`);

      return acc;
    }, []).join(" * ");
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";

.train-table {
  font-size: calc(0.4rem + 0.5vw);
}

.no-trains {
  text-align: center;
  font-size: 1.5em;

  padding: 1rem;
  margin: 1rem 0;

  background: #333;
}

.list {
  overflow: auto;

  @include smallScreen() {
    width: 100%;
  }
}

.item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));

  background-color: #444;
  padding: 1rem;

  margin-bottom: 1em;

  &:nth-child(even) {
    background-color: #666;
  }

  @include smallScreen() {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, minmax(100px, 1fr));

    font-size: 0.8rem;
    gap: 0.4em 0;
    // grid-template-columns: repeat(3, 1fr);
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &-category {
    flex-grow: 2;
    font-size: 1.05em;
  }

  &-route {
    width: 100%;
    font-size: 1.2em;
  }

  &-stations {
    margin-top: 0.35em;
    font-size: 0.75em;
  }

  &-online {
    background-color: #ce0000;

    padding: 0.2em 0.7em;
    font-size: 0.85em;

    border-radius: 1em;

    &.online {
      background-color: #009700;
    }
  }
}

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  &-exp {
    font-size: 1.4em;
    padding: 0.3em 0.6em;

    border-radius: 0.4em;

    background-color: red;
  }

  &-name {
    margin: 0 0.3em;
  }

  &-loco {
    width: 100%;
    text-align: center;
  }

  &-loco img {
    width: 13em;
    max-width: 190px;
  }
}

.stats {
  &-general {
    display: flex;
    margin-bottom: 1.5em;

    & > .stat {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100%;
    }

    img {
      margin: 0 0.3em;
      width: 2em;
    }
  }

  &-position {
    display: flex;

    margin-top: 1em;
    text-align: center;

    font-size: 0.9em;

    p {
      color: #00cff3;
    }

    & > .stat {
      width: 100%;

      img {
        width: 2em;
      }
    }
  }
}

.warning {
  border-radius: 1em;
  padding: 0.1em 1.2em;
  margin: 0 0.2em;

  color: black;
  font-weight: bold;
  font-size: 0.85em;

  &.twr {
    background-color: #ffc700;
  }

  &.skr {
    background-color: #ff4646;
  }
}

@include bigScreen() {
  .item {
    font-size: 1rem;
  }
}

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>