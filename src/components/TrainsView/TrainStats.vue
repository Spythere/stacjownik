<template>
  <div class="train-stats">
    <div class="btn-wrapper">
      <button
        class="stats-btn button"
        @click="toggleStats"
        v-if="trains.length > 0"
      >{{statsOpen ? 'Zamknij' : 'Otwórz'}} statystki ruchu</button>
    </div>

    <div class="stats-body" v-if="statsOpen">
      <h2 class="stats-header">STATYSTYKI RUCHU</h2>
      <div class="stats-speed">
        <div class="title">PRĘDKOŚCI POCIĄGÓW (MIN | ŚR | MAX)</div>
        <div class="content">{{speedStats.min}} | {{speedStats.avg}} | {{speedStats.max}} km/h</div>
      </div>

      <div class="stats-length">
        <div class="title">DŁUGOŚCI ROZKŁADÓW (MIN | ŚR | MAX)</div>
        <div
          class="content"
        >{{timetableStats.min}} | {{timetableStats.avg}} | {{timetableStats.max}} km</div>
      </div>

      <div class="stats-categories">
        <div class="title">KATEGORIE RJ</div>
        <div class="category-list">
          <span class="category" v-for="[key, value] of categoryList" :key="key">
            <span class="category-type">{{key}}</span>
            <span class="category-count">{{value}}</span>
          </span>
        </div>
      </div>

      <div class="stats-warnings">
        <div class="title">TWR/SKR</div>
        <div class="content">
          <div class="warning twr">
            Wysokiego ryzyka
            [{{specialTrainCount[0]}}]
          </div>

          <div class="warning skr">
            Przekroczona skrajnia
            [{{specialTrainCount[1]}}]
          </div>
        </div>
      </div>

      <div class="stats-locos">
        <div class="title">NAJCZĘSTSZE JEDNOSTKI</div>
        <div class="loco-list content">
          <div class="loco" v-for="(loco,i) in locoList" :key="i">{{loco[0]}} | {{loco[1]}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import Train from "@/scripts/interfaces/Train";

@Component
export default class TrainStats extends Vue {
  @Prop() readonly trains!: Train[];

  statsOpen: boolean = false;

  toggleStats() {
    this.statsOpen = !this.statsOpen;
  }

  get speedStats(): { avg: string; min: string; max: string } {
    if (this.trains.length == 0) return { avg: "0", min: "0", max: "0" };

    const avg = (
      this.trains.reduce((acc, train) => acc + train.speed, 0) /
      this.trains.length
    ).toFixed(2);

    const minMax = this.trains.reduce((acc, train) => {
      if (train.noTimetable) return acc;

      acc[0] =
        acc[0] === undefined || train.speed < acc[0] ? train.speed : acc[0];

      acc[1] =
        acc[1] === undefined || train.speed > acc[1] ? train.speed : acc[1];
      return acc;
    }, [] as any);

    return { avg, min: minMax[0].toString(), max: minMax[1].toString() };
  }

  get timetableStats(): { avg: string; min: string; max: string } {
    if (this.trains.length == 0) return { avg: "0", min: "0", max: "0" };

    const avg = (
      this.trains.reduce((acc, train) => acc + train.routeDistance, 0) /
      this.trains.length
    ).toFixed(2);

    const minMax = this.trains.reduce((acc, train) => {
      if (train.noTimetable) return acc;

      acc[0] =
        acc[0] === undefined || train.routeDistance < acc[0]
          ? train.routeDistance
          : acc[0];

      acc[1] =
        acc[1] === undefined || train.routeDistance > acc[1]
          ? train.routeDistance
          : acc[1];
      return acc;
    }, [] as any);

    return { avg, min: minMax[0].toString(), max: minMax[1].toString() };
  }

  get categoryList(): Map<string, number> {
    const map = this.trains.reduce((acc, train) => {
      if (train.noTimetable || !train.category) return acc;

      acc.set(
        train.category,
        acc.get(train.category) ? acc.get(train.category) + 1 : 1
      );

      return acc;
    }, new Map());

    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]));
  }

  get locoList(): any[] {
    const map = this.trains.reduce((acc, train) => {
      if (train.noTimetable || !train.locoType) return acc;

      acc.set(
        train.locoType,
        acc.get(train.locoType) ? acc.get(train.locoType) + 1 : 1
      );

      return acc;
    }, new Map());

    const sorted = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .filter((v, i) => i < 3);

    return sorted;
  }

  get specialTrainCount(): [number, number] {
    const twrList = this.trains.filter((train) => train.TWR);
    const skrList = this.trains.filter((train) => train.SKR);

    return [twrList.length, skrList.length];
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.train-stats {
  padding: 0.3em 0;
  font-size: 0.9em;
}

.button {
  font-size: 1em;
  padding: 0.5em;
}

.content {
  font-size: 1.2em;
  color: #ddd;
}

.stats-header {
  margin-bottom: 1rem;
}

.stats-body {
  display: inline-block;
  max-width: 800px;

  background: #333;

  padding: 1rem;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
}

.category {
  margin-right: 0.4em;
  margin-bottom: 0.4em;

  &-type,
  &-count {
    display: inline-block;
    padding: 0.2em 0.4em;
  }

  &-type {
    background: #888;
  }

  &-count {
    background: #ffc014;
    color: black;
  }
}

.warning {
  display: inline-block;
  margin-right: 0.4em;
  padding: 0.2em 0.3em;

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

.loco {
  padding-bottom: 0.4em;
}

@include smallScreen {
  .button {
    font-size: 0.9rem;
  }
  .stats-body {
    display: block;
    max-width: 100%;
  }
  .btn-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
}
</style>