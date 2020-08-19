<template>
  <div class="train-table">
    <div class="no-trains" v-if="computedTrains.length == 0">Ups! Brak pociągów do wyświetlenia :/</div>

    <ul class="list">
      <li class="item" v-for="train in computedTrains" :key="train.timetableId">
        <a :href="'https://rj.td2.info.pl/train#' + train.trainNo + ';eu'" target="_blank">
          <span class="info">
            <div class="info-category">
              <span>
                <strong>{{ train.category }}</strong>
                {{ train.trainNo }} |
              </span>
              <span style=" color: gold;">{{ train.routeDistance }} km</span>
            </div>

            <div class="info-warnings">
              <span class="warning twr" v-if="train.TWR">TWR</span>
              <span class="warning skr" v-if="train.SKR">SKR</span>
            </div>

            <div class="info-route">
              <strong>
                {{
                train.route && train.route.replace("|", " - ")
                }}
              </strong>
            </div>

            <div class="info-stations">
              <i v-if="train.sceneries.length > 0">Przez: {{ train.sceneries }}</i>
            </div>
          </span>
        </a>

        <span class="driver">
          <span class="driver-name">
            {{ train.driverName }}
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
            <span class="mass">
              <img :src="massIcon" alt="icon-mass" />
              {{ train.mass / 1000 }}t
            </span>

            <span class="speed">
              <img :src="speedIcon" alt="icon-speed" />
              {{ train.speed }} km/h
            </span>

            <span class="length">
              <img :src="lengthIcon" alt="icon-length" />
              {{ train.length }}m
            </span>
          </div>

          <div class="stats-position">
            <span class="station">
              <p>
                <strong>SCENERIA</strong>
              </p>
              {{ train.currentStationName }}
            </span>
            <span class="track">
              <p>
                <strong>SZLAK</strong>
              </p>
              {{ train.connectedTrack || "---" }}
            </span>
            <span class="signal">
              <p>
                <strong>SEMAFOR</strong>
              </p>
              {{ train.signal || "---" }}
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

@Component
export default class TrainTable extends Vue {
  @Prop() readonly computedTrains!: Train[];

  speedIcon: string = require("@/assets/icon-speed.svg");
  massIcon: string = require("@/assets/icon-mass.svg");
  lengthIcon: string = require("@/assets/icon-length.svg");

  onImageError(e: Event) {
    (e.target as HTMLImageElement).src = unknownTrainImage;
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

  margin: 1rem 0;

  &:nth-child(even) {
    background-color: #666;
  }

  @include smallScreen() {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);

    font-size: 0.8rem;
    gap: 0.4em 0;
    // grid-template-columns: repeat(3, 1fr);
  }
}

.info {
  display: flex;
  flex-wrap: wrap;

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
  width: 100%;

  &-general {
    display: flex;

    span {
      display: flex;
      justify-content: center;

      width: 100%;

      align-items: center;
    }

    img {
      margin: 0 0.3em;
      width: 1.8em;
    }
  }

  &-position {
    display: flex;

    margin-top: 1em;
    text-align: center;

    span {
      width: 100%;
      font-size: 300;
    }

    p {
      color: #00cff3;
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
</style>