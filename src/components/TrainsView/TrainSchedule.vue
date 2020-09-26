<template>
  <div class="train-schedule" @click="click">
    <div class="schedule-wrapper">
      <div class="schedule-bar"></div>

      <ul class="schedule-list">
        <li
          class="schedule-item"
          v-for="(stop, i) in followingStops"
          :key="i"
          :class="{ confirmed: stop.confirmed, stopped: stop.stopped }"
        >
          <div class="progress-bar"></div>

          <div
            class="stop-line arrival"
            v-if="i > 0 && followingStops[i - 1].departureLine != stop.arrivalLine"
          >{{ stop.arrivalLine }}</div>

          <span class="stop-info">
            <div class="info-indicator"></div>

            <span class="info-name" v-html="stop.stopName"></span>
            <span class="info-date">
              <span
                class="date-arrival"
                v-if="!stop.beginsHere"
                :class="{delayed: stop.arrivalDelay > 0, preponed: stop.arrivalDelay < 0}"
              >p. {{stylizeTime(stop.arrivalRealTimeString, stop.arrivalDelay)}}</span>

              <span
                class="date-stop"
                v-if="stop.stopTime"
                :class="stop.stopType.replace(', ', '-')"
              >{{ stop.stopTime }} {{ stop.stopType }}</span>

              <span
                class="date-departure"
                v-if="!stop.terminatesHere && stop.stopTime != 0"
                :class="{delayed: stop.departureDelay > 0, preponed: stop.departureDelay < 0}"
              >o. {{ stylizeTime(stop.departureRealTimeString, stop.departureDelay) }}</span>
            </span>
          </span>

          <div class="stop-line departure">{{ stop.departureLine }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

import TrainStop from "@/scripts/interfaces/TrainStop";

@Component
export default class TrainSchedule extends Vue {
  @Prop() readonly followingStops!: TrainStop[];
  @Prop() readonly currentStationName!: string;

  stylizeTime(timeString: string, delay: number) {
    return timeString + (delay != 0 ? " (" + (delay > 0 ? "+" : "") + delay.toString() + ")" : "");
  }

  click() {
    this.$emit('click')
  }

}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";

.train-schedule {
  max-height: 600px;
  overflow: auto;
  margin-top: 1rem;

  font-size: 1em;

  @include smallScreen() {
    font-size: 0.8em;
  }
}

.schedule-bar,
.progress-bar {
  position: absolute;
  z-index: 1;

  width: 2px;
  height: 100%;

  top: 0;
  left: 0;

  background: white;
}

.progress-bar {
  height: 100%;

  top: 0;
  left: calc(-0.5rem - 2px);
  width: 2px;
}

.schedule-wrapper {
  position: relative;
  margin-top: 1rem;
  margin-left: 0.5rem;
}

ul.schedule-list {
  margin-left: 10px;
}

ul.schedule-list > li.schedule-item {
  position: relative;

  display: flex;
  flex-direction: column;

  padding: 0 0.5rem;

  &.confirmed {
    & > .progress-bar,
    & > .stop-info > .info-indicator {
      background: lime;
    }
  }

  &.stopped {
    & > .progress-bar {
      background: lime;
      height: 50%;
    }

    & > .stop-info > .info-indicator {
      background: orangered;
    }
  }
}

li.schedule-item > .stop-info {
  display: flex;

  position: relative;

  & > .info-indicator {
    position: absolute;
    z-index: 1;

    top: 50%;
    left: -1.5rem;

    transform: translateY(-50%);

    width: 15px;
    height: 2px;

    background: white;
  }

  & > .info-name {
    background: rgb(0, 81, 187);
    padding: 0.3rem 0.5rem;
  }

  & > .info-date {
    display: flex;
    align-items: center;

    & > span {
      background: #5c5c5c;
      padding: 0.3rem 0.5rem;
    }

    & > .date-stop {
      &.ph,
      &.ph-pm {
        background: #ce8d00;
      }

      &.pt,
      &.pm {
        background: #252525;
      }
    }

    & > .date-arrival,
    & > .date-departure {
      &.delayed {
        background: rgb(250, 0, 0);
      }

      &.preponed {
        background: rgb(0, 139, 0);
      }
    }
  }
}

li.schedule-item > .stop-line {
  font-size: 0.8em;
  color: #bbb;
  padding: 0.3em 0;
  margin: 0.2em 0;

  transform: translateX(-0.8rem);
}
</style>
