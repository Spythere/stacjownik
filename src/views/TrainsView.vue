<template>
  <section class="trains-view">
    <div class="list" v-if="listLoaded">
      <div v-for="train in onlineTrainsList" :key="train.timetableId">{{ train.route }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import axios from "axios";

@Component
export default class TrainsView extends Vue {
  onlineTrainsList: {
    mass: number;
    length: number;
    speed: number;
    signal: string;
    distance: number;
    connectedTrack: string;
    route?: string;
    driverId: number;
    trainNo: number;
    timetableId?: number;
    driverName: string;
    currentStationName: string;
    category: string;
    sceneries: string[];
    TWR: boolean;
    SKR: boolean;
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
      dataSceneryConnection: string;
      isOnline: boolean;
    }[] = response.data.message;

    onlineTrainsData = onlineTrainsData.filter((train) => train.isOnline);

    onlineTrainsData.forEach(async (train) => {
      const timetableData = await this.getTimetableData(train.trainNo);

      if (timetableData)
        this.onlineTrainsList.push({
          driverId: train.driverId,
          driverName: train.driverName,
          trainNo: train.trainNo,
          currentStationName: train.station.stationName,
          mass: train.dataMass,
          length: train.dataLength,
          speed: train.dataSpeed,
          distance: train.dataDistance,
          signal: train.dataSignal,
          connectedTrack: train.dataSceneryConnection,
          route: timetableData.route || "",
          timetableId: timetableData.timetableId,
          category: timetableData.trainCategoryCode,
          sceneries: timetableData.sceneries,
          TWR: timetableData.twr,
          SKR: timetableData.skr,
        });
    });
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

  mounted() {
    this.getTrainData().then(() => (this.listLoaded = true));
  }
}
</script>

<style scoped>
.list {
  font-size: 1.2rem;
}
</style>