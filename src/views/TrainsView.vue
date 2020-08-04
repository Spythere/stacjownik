<template>
  <section class="trains-view">
    <ul class="list" v-if="listLoaded">
      <li class="item" v-for="train in computedTrains" :key="train.timetableId">
        <span class="info">
          <div class="info-category">
            <strong>{{train.category}}</strong>
            {{train.trainNo}}
          </div>

          <div class="info-warnings">
            <span class="warning twr" v-if="train.TWR">TWR</span>
            <span class="warning skr" v-if="train.SKR">SKR</span>
          </div>

          <div class="info-route">
            <strong>{{train.route && train.route.replace("|", " -> ")}}</strong>
          </div>

          <div class="info-stations">
            <i v-if="train.sceneries.length > 0">Przez: {{train.sceneries}}</i>
          </div>
        </span>

        <span class="driver">
          <span class="driver-name">{{train.driverName}}</span>
          <span class="driver-loco">
            <img src="https://rj.td2.info.pl/dist/img/thumbnails/ET41-144.png" alt="icon-train" />
          </span>
        </span>
        <span class="stats">
          <div class="stats-general">
            <span class="mass">
              <img :src="massIcon" alt="icon-mass" />
              {{train.mass/1000}}t
            </span>

            <span class="speed">
              <img :src="speedIcon" alt="icon-speed" />
              {{train.speed}} km/h
            </span>

            <span class="length">
              <img :src="lengthIcon" alt="icon-length" />
              {{train.length}}m
            </span>
          </div>

          <div class="stats-position">
            <span class="station">
              <p>
                <strong>SCENERIA</strong>
              </p>
              {{train.currentStationName}}
            </span>
            <span class="track">
              <p>
                <strong>SZLAK</strong>
              </p>
              {{train.connectedTrack || "---"}}
            </span>
            <span class="signal">
              <p>
                <strong>SEMAFOR</strong>
              </p>
              {{train.signal || "---"}}
            </span>
          </div>
        </span>
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

import axios from "axios";

@Component
export default class TrainsView extends Vue {
  speedIcon: string = require("@/assets/icon-speed.svg");
  massIcon: string = require("@/assets/icon-mass.svg");
  lengthIcon: string = require("@/assets/icon-length.svg");

  @Getter("getAllStations") stations!: Station[];

  onlineTrainsList: {
    mass: number;
    length: number;
    speed: number;
    signal: string;
    distance: number;
    imageURL: string;
    connectedTrack: string;
    driverId: number;
    trainNo: number;
    driverName: string;
    currentStationName: string;
    route: string | null;
    timetableId: number | null;
    category: string | null;
    sceneries: string | null;
    TWR: boolean | null;
    SKR: boolean | null;
    noTimetable: boolean;
  }[] = [];

  listLoaded: boolean = false;

  async getTrainData() {
    const response = await axios.get(
      "https://api.td2.info.pl:9640/?method=getTrainsOnline"
    );

    let onlineTrainsData: {
      driverId: number;
      driverName: string;
      trainNo: number;
      station: { stationName: string };
      dataMass: number;
      dataLength: number;
      dataSpeed: number;
      dataDistance: number;
      dataSignal: string;
      dataCon: string;
      dataSceneryConnection: string;
      isOnline: boolean;
    }[] = response.data.message;

    this.onlineTrainsList = await Promise.all(
      onlineTrainsData
        .filter((train) => train.isOnline)
        .map(async (train) => {
          const timetableData = await this.getTimetableData(train.trainNo);

          return {
            driverId: train.driverId,
            driverName: train.driverName,
            trainNo: train.trainNo,
            currentStationName: train.station.stationName,
            mass: train.dataMass,
            length: train.dataLength,
            speed: train.dataSpeed,
            distance: train.dataDistance,
            signal: train.dataSignal,
            imageURL: train.dataCon,
            connectedTrack: train.dataSceneryConnection,
            noTimetable: timetableData == null,
            route: timetableData && timetableData.route,
            timetableId: timetableData && timetableData.timetableId,
            category: timetableData && timetableData.trainCategoryCode,
            sceneries:
              timetableData &&
              (await this.mapSceneries(timetableData.sceneries)),
            TWR: timetableData && timetableData.twr,
            SKR: timetableData && timetableData.skr,
          };
        })
    );

    this.listLoaded = true;
  }

  async getTimetableData(trainNo: number) {
    const response = await axios.get(
      `https://api.td2.info.pl:9640/?method=readFromSWDR&value=getTimetable%3B${trainNo}%3Beu`
    );

    const timetableData: {
      timetableId: number;
      trainCategoryCode: string;
      route: string;
      twr: boolean;
      skr: boolean;
      sceneries: string[];
    } | null = response.data.message.trainInfo;

    return timetableData;
  }

  mapSceneries(sceneries: string[]): string {
    let text = "";

    for (let i = sceneries.length - 1; i >= 0; i--) {
      const station = this.stations.find(
        (station) => station.stationHash == sceneries[i]
      );

      if (!station) continue;
      if (i == sceneries.length - 1 || i == 0) continue;

      text += `${station.stationName}${i > 1 ? ", " : ""}`;
    }

    return text;
  }

  get computedTrains() {
    return this.onlineTrainsList.filter((train) => !train.noTimetable);
  }

  mounted() {
    this.getTrainData();
  }
}
</script>

<style lang="scss" scoped>
.trains-view {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.list {
  font-size: calc(0.5rem + 0.5vw);

  margin-top: 2rem;
  max-height: calc(100vh - 14em);
  overflow: auto;

  max-width: 1300px;
}

.item {
  display: grid;
  grid-template-columns: repeat(3, 1fr);

  background-color: #444;
  padding: 1rem;

  &:nth-child(even) {
    background-color: #666;
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
    max-width: 15em;
  }
}

.stats {
  &-general {
    display: flex;

    span {
      display: flex;
      width: 100%;

      align-items: center;
    }

    img {
      margin: 0 0.3em;
    }
  }

  &-position {
    display: flex;
    margin-top: 1em;

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
</style>