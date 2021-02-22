<template>
  <div class="scenery-timetable">
    <h3 class="timetable-header">
      <span>AKTYWNE ROZKŁADY JAZDY</span>

      <a v-if="!timetableOnly" :href="currentURL + '&timetable_only=1'" target="_blank">
        <img :src="viewIcon" alt="icon-view" title="Wyodrębnij rozkłady jazdy" />
      </a>
    </h3>

    <div class="select-box" v-if="stationInfo.checkpoints">
      <div class="option-container">
        <div class="option-selected" @click="toggleOptionList">
          <span>{{ selectedOption }}</span>
          <img :src="require('@/assets/icon-select.svg')" alt="icon-select" />
        </div>

        <ul class="option-list" :class="{ open: listOpen }">
          <li class="option-item" v-for="(cp, i) in stationInfo.checkpoints" :key="i" @click="() => chooseOption(cp.checkpointName)">
            <input type="option-radio" name="sort" />
            <label :id="cp.checkpointName">{{ cp.checkpointName }}</label>
          </li>
        </ul>
      </div>
    </div>

    <span class="timetable-item loading" v-if="dataStatus == 0">Ładowanie...</span>

    <span class="timetable-item empty" v-else-if="computedScheduledTrains.length == 0">Brak aktywnych rozkładów!</span>

    <transition-group name="list-anim">
      <div class="timetable-item" v-for="(scheduledTrain, i) in computedScheduledTrains" :key="i+1">
        <span class="timetable-general">
          <span class="general-info">
            <router-link :to="{
                  name: 'TrainsView',
                  params: {
                    passedSearchedTrain: scheduledTrain.trainNo.toString(),
                  },
                }">
              <span>
                <strong>{{ scheduledTrain.category }}</strong>
                {{ scheduledTrain.trainNo }}
              </span>
            </router-link>|
            <span>
              <a :href="
                    'https://td2.info.pl/profile/?u=' + scheduledTrain.driverId
                  " target="_blank">{{ scheduledTrain.driverName }}</a>
            </span>

            <div class="info-route">
              <strong>{{ scheduledTrain.beginsAt }} - {{ scheduledTrain.terminatesAt }}</strong>
            </div>
          </span>

          <span class="general-status">
            <span :class="scheduledTrain.stopStatus">{{scheduledTrain.stopLabel}}</span>
          </span>
        </span>

        <span class="timetable-schedule">
          <span class="schedule-arrival">
            <span class="arrival-time begins" v-if="scheduledTrain.stopInfo.beginsHere">
              ROZPOCZYNA
              <div>BIEG</div>
            </span>
            <span class="arrival-time" v-else>
              {{ scheduledTrain.stopInfo.arrivalTimeString }} ({{
              scheduledTrain.stopInfo.arrivalDelay
              }})
            </span>
          </span>

          <span class="schedule-stop">
            <span class="stop-time" v-if="scheduledTrain.stopInfo.stopTime">
              {{ scheduledTrain.stopInfo.stopTime }}
              {{ scheduledTrain.stopInfo.stopType }}
            </span>
            <span class="stop-arrow arrow"></span>
          </span>
          <span class="schedule-departure">
            <span class="departure-time terminates" v-if="scheduledTrain.stopInfo.terminatesHere">KOŃCZY BIEG</span>
            <span class="departure-time" v-else>
              {{ scheduledTrain.stopInfo.departureTimeString }} ({{
              scheduledTrain.stopInfo.departureDelay
              }})
            </span>
          </span>
        </span>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import Station from "@/scripts/interfaces/Station";
import ScheduledTrain from "@/scripts/interfaces/ScheduledTrain";

@Component
export default class SceneryTimetable extends Vue {
  @Prop() readonly stationInfo!: Station;
  @Prop() readonly timetableOnly!: boolean;
  @Prop() readonly dataStatus!: number;

  viewIcon: string = require("@/assets/icon-view.svg");

  listOpen: boolean = false;
  selectedOption: string = "";

  mounted() {
    if (!this.stationInfo.checkpoints) return;

    if (this.selectedOption == "")
      this.selectedOption = this.stationInfo.checkpoints[0].checkpointName;
  }

  activated() {
    if (!this.stationInfo) return;
    if (!this.stationInfo.checkpoints) return;

    if (this.selectedOption == "")
      this.selectedOption = this.stationInfo.checkpoints[0].checkpointName;
  }

  toggleOptionList() {
    this.listOpen = !this.listOpen;
  }

  closeOptionList() {
    this.listOpen = false;
  }

  chooseOption(name: string) {
    this.selectedOption = name;
    this.closeOptionList();
  }

  get currentURL() {
    return `${location.origin}/scenery?hash=${this.stationInfo?.stationHash}`;
  }

  get computedScheduledTrains() {
    if (!this.stationInfo) return [];

    let scheduledTrains: ScheduledTrain[] | undefined;

    if (this.stationInfo.checkpoints)
      scheduledTrains = this.stationInfo.checkpoints.find(
        (cp) => cp.checkpointName === this.selectedOption
      )?.scheduledTrains;
    else scheduledTrains = this.stationInfo.scheduledTrains;

    return (
      scheduledTrains?.sort((a, b) => {
        if (a.stopStatusID > b.stopStatusID) return 1;
        else if (a.stopStatusID < b.stopStatusID) return -1;

        if (a.stopInfo.arrivalTimestamp > b.stopInfo.arrivalTimestamp) return 1;
        else if (a.stopInfo.arrivalTimestamp < b.stopInfo.arrivalTimestamp)
          return -1;

        return a.stopInfo.departureTimestamp > b.stopInfo.departureTimestamp
          ? 1
          : -1;
      }) || []
    );
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
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

.list-anim {
  &-enter-active,
  &-leave-active {
    transition: all 250ms ease-out;
  }

  &-enter,
  &-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }

  &-move {
    transition: transform 100ms;
  }
}

.select-box {
  display: flex;
  justify-content: center;
}

.option {
  &-container {
    position: relative;

    input {
      display: none;
    }

    label {
      padding: 0.5rem 1rem;
      cursor: pointer;
    }
  }

  &-item {
    display: flex;
    justify-content: center;

    &:hover {
      background-color: rgba(#868686, 0.85);
    }

    transition: background 150ms ease-in;
  }

  &-selected,
  &-list {
    background: #444;
    border-radius: 0.5em;
  }

  &-selected {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0.5rem 1rem;
    min-width: 10em;
    cursor: pointer;

    span {
      margin-right: 2rem;
    }

    img {
      max-width: 0.75em;
    }
  }

  &-list {
    position: absolute;
    top: 100%;
    left: 0;

    width: 100%;

    z-index: 10;

    background-color: rgba(#222, 0.95);
    overflow: hidden;

    max-height: 0;

    &.open {
      max-height: 250px;
      opacity: 1;
    }

    transition: all 150ms ease-in;
  }
}

.timetable {
  &-header {
    a {
      display: flex;
    }

    img {
      cursor: pointer;
    }
  }

  &-item {
    margin: 1em auto;
    font-size: 0.8em;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));

    padding: 0 0.5rem;

    background: #555;

    @include smallScreen() {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    &.loading,
    &.empty {
      padding: 1rem;
      font-size: 1em;
    }

    &.empty {
      color: $accentCol;
    }
  }

  &-general {
    padding: 0.5rem 0.3rem;
    border-radius: 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    text-align: left;

    overflow: hidden;

    @include smallScreen() {
      width: 95%;
      font-size: 1.3em;
    }
  }

  &-schedule {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    font-size: 1.2em;

    @include smallScreen() {
      width: 100%;
      margin: 0.7em 0;
      font-size: 1.8em;
    }
  }
}

.arrow {
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 2px;
  margin-left: 50px;

  position: relative;

  transform: rotate(-45deg);

  &::before {
    content: "";
    position: absolute;
    display: block;
    width: 55px;
    height: 3px;
    top: 4px;
    left: 4px;

    transform: translate(-100%, -1px) rotate(45deg);
    transform-origin: right bottom;

    background: white;
  }
}

.general-info {
  span {
    color: $accentCol;
  }

  .info-route {
    margin-top: 0.5em;
  }
}

.general-status {
  span.arriving {
    color: #aaa;
  }

  span.departed {
    color: lime;
    font-weight: bold;

    &-away {
      font-weight: bold;
      color: rgb(0, 155, 0);
    }
  }

  span.stopped {
    color: #ffa600;
    font-weight: bold;
  }

  span.online {
    color: gold;
  }

  span.terminated {
    color: #e00000;
    font-weight: bold;
  }
}

.schedule {
  &-arrival,
  &-stop,
  &-departure {
    display: flex;
    justify-content: center;
    align-items: center;

    margin: 0 0.3rem;
  }

  &-stop {
    display: flex;
    flex-direction: column;

    .stop-time {
      font-size: 0.7em;
      margin: 5px 0;
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.75em;
}
</style>