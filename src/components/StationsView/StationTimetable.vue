<template>
  <div class="station-timetable">
    <div class="timetable-wrapper">
      <div class="timetable-title title">
        <div style="font-size: 1.5em;">{{stationInfo.stationName.toUpperCase()}}</div>
        <div style="font-size: 0.7em;">AKTYWNE ROZKŁADY JAZDY</div>
      </div>

      <div class="timetable-content">
        <div class="timetable-item" v-for="(scheduledTrain, i) in computedScheduledTrains" :key="i">
          <span class="timetable-general">
            <span class="general-info">
              <router-link
                :to="{ name: 'TrainsView', params: { passedSearchedTrain: scheduledTrain.trainNo.toString()}}"
              >
                <span>
                  <strong>{{scheduledTrain.category}}</strong>
                  {{scheduledTrain.trainNo}}
                </span>
              </router-link>|
              <span>
                <a
                  :href="'https://td2.info.pl/profile/?u=' + scheduledTrain.driverId"
                  target="_blank"
                >{{ scheduledTrain.driverName }}</a>
              </span>
            </span>

            <span class="general-confirmed">
              <span
                style="color: red"
                v-if="scheduledTrain.terminatesHere && scheduledTrain.confimed"
              >Skończył bieg</span>

              <span
                style="color: lime"
                v-else-if="scheduledTrain.confirmed && !scheduledTrain.terminatesHere"
              >Odprawiony</span>

              <span
                style="color: gold"
                v-else-if="scheduledTrain.currentStationName == stationInfo.stationName && !scheduledTrain.stopped"
              >Na stacji</span>

              <span
                style="color: #aaa"
                v-else-if="!scheduledTrain.confirmed && scheduledTrain.currentStationName != stationInfo.stationName"
              >W drodze</span>

              <span style="color: orangered" v-else-if="scheduledTrain.stopped">Postój</span>
            </span>
          </span>

          <span class="timetable-schedule">
            <span class="schedule-arrival">
              <span class="arrival-time begins" v-if="scheduledTrain.beginsHere">ROZPOCZYNA BIEG</span>
              <span
                class="arrival-time"
                v-else
              >{{timestampToTime(scheduledTrain.arrivalTime)}} ({{scheduledTrain.arrivalDelay}})</span>
            </span>

            <span class="schedule-stop">
              <span
                class="stop-time"
                v-if="scheduledTrain.stopTime"
              >{{scheduledTrain.stopTime}} {{scheduledTrain.stopType}}</span>
              <span class="stop-arrow arrow"></span>
            </span>
            <span class="schedule-departure">
              <span
                class="departure-time terminates"
                v-if="scheduledTrain.terminatesHere"
              >KOŃCZY BIEG</span>
              <span
                class="departure-time"
                v-else
              >{{timestampToTime(scheduledTrain.departureTime)}} ({{scheduledTrain.departureDelay}})</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import Station from "@/scripts/interfaces/Station";


@Component
export default class StationTimetable extends Vue {
  @Prop() readonly stationInfo!: Station;

  get computedScheduledTrains() {
    return this.stationInfo.scheduledTrains.sort((a, b) => {
      if (a.arrivalTime > b.arrivalTime) return 1;
      else if ((a.arrivalTime < b.arrivalTime)) return -1;

      return a.departureTime > b.departureTime ? 1 : -1;
    })
  }

  timestampToTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.station-timetable {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  overflow: hidden;

  transform: translateY(-100%);
  -webikit-transform: translateY(-100%);

  &.show {
    transform: translateY(0);
    -webkit-transform: translateY(0);
  }

  transition: transform 150ms ease-out;

  background: #333;

  @include smallScreen() {
    font-size: 1.3em;
  }
}

.timetable {
  &-content {
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  &-title {
    padding-top: 2rem;
    padding-bottom: 0.3rem;
    font-size: 1.6em;
  }

  &-wrapper {
    height: 100%;

    display: flex;
    flex-direction: column;
  }

  &-item {
    margin: 1em auto;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0 1rem;

    padding: 0 2rem;

    @include smallScreen() {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
}

.timetable {
  &-general {
    padding: 0.3rem 0.5rem;
    border: 1px solid white;

    display: flex;
    align-items: center;
    justify-content: space-between;

    @include smallScreen() {
      width: 95%;
      font-size: 0.85em;
    }
  }

  &-schedule {
    @include smallScreen() {
      width: 80%;
      margin: 0.7em 0;
      font-size: 0.9em;
    }

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    font-size: 1.3em;
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
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.75em;
}
</style>