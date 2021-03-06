<template>
  <div class="train-schedule" @click="click">
    <div class="schedule-wrapper">
      <ul class="stop_list">
        <li
          v-for="(stop, i) in followingStops"
          :key="i"
          :class="{
            confirmed: stop.confirmed,
            stopped: stop.stopped,
            beginning: stop.beginsHere,
            delayed: stop.departureDelay > 0,
          }"
        >
          <!-- <div class="progress-bar"></div> -->
          <!-- 
          <div
            class="stop-line"
            v-if="
              i > 0 && followingStops[i - 1].departureLine != stop.arrivalLine
            "
          >
            {{ stop.arrivalLine }}
          </div> -->

          <span class="stop_info">
            <div class="indicator"></div>

            <div class="progress-bar"></div>

            <div class="stop-bar"></div>

            <span class="distance" v-if="stop.stopDistance">
              {{ Math.floor(stop.stopDistance) }}
            </span>

            <span class="stop-name" v-html="stop.stopName"></span>
            <span class="stop-date">
              <span
                class="date arrival"
                v-if="!stop.beginsHere"
                :class="{
                  delayed: stop.arrivalDelay > 0 && stop.confirmed,
                  preponed: stop.arrivalDelay < 0 && stop.confirmed,
                }"
              >
                p.
                {{
                  stylizeTime(
                    stop.confirmed
                      ? stop.arrivalRealTimeString
                      : stop.arrivalTimeString,
                    stop.arrivalDelay,
                    stop.confirmed
                  )
                }}
              </span>

              <span
                class="date stop"
                v-if="stop.stopTime"
                :class="stop.stopType.replace(', ', '-')"
              >
                {{ stop.stopTime }} {{ stop.stopType }}
              </span>

              <span
                class="date departure"
                v-if="!stop.terminatesHere && stop.stopTime != 0"
                :class="{
                  delayed: stop.departureDelay > 0 && stop.confirmed,
                  preponed: stop.departureDelay < 0 && stop.confirmed,
                }"
              >
                o.
                {{
                  stylizeTime(
                    stop.confirmed
                      ? stop.departureRealTimeString
                      : stop.departureTimeString,
                    stop.departureDelay,
                    stop.confirmed
                  )
                }}
              </span>
            </span>
          </span>

          <div class="stop_line">
            <div class="progress-bar"></div>

            <span v-if="i < followingStops.length - 1">
              <span
                v-if="stop.departureLine == followingStops[i + 1].arrivalLine"
              >
                {{ stop.departureLine }}
              </span>

              <span v-else>
                {{ stop.departureLine }} /
                {{ followingStops[i + 1].arrivalLine }}
              </span>
            </span>
          </div>
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

  stylizeTime(timeString: string, delay: number, confirmed: boolean) {
    return (
      timeString +
      (delay != 0 && confirmed
        ? " (" + (delay > 0 ? "+" : "") + delay.toString() + ")"
        : "")
    );
  }

  click() {
    this.$emit("click");
  }
}
</script>

<style lang="scss" scoped>
.train-schedule {
  max-height: 600px;
  margin-top: 2em;

  overflow-y: auto;
}

.schedule-wrapper {
  margin-left: 2.5rem;
}

.progress-bar {
  position: absolute;

  top: 0;
  left: -1rem;

  transform: translateX(-1px);

  height: 100%;
  width: 2px;

  background-color: white;
}

ul.stop_list > li {
  position: relative;

  display: flex;
  flex-direction: column;

  padding: 0 0.5em;

  &.confirmed {
    & > .stop_line > .progress-bar {
      background-color: lime;
    }

    & > .stop_info > .progress-bar {
      background-color: lime;
    }

    & > .stop_info > .indicator {
      border-color: lime;
    }
  }

  &.stopped {
    & > .stop_info {
      & > .indicator {
        border-color: orangered;
      }

      & > .stop-bar {
        background: orangered;
      }
    }
  }

  .stop_line {
    font-size: 0.8em;
    color: #ccc;

    padding: 0.35em 0;

    position: relative;

    .line-segment {
      color: white;
      font-weight: 500;
    }
  }

  .stop_info {
    display: flex;

    position: relative;
    text-align: center;

    padding: 0.15em 0;
  }

  .stop-bar {
    position: absolute;
    top: 0;
    left: -1rem;

    transform: translateX(-1px);

    z-index: 2;

    width: 2px;
    height: 100%;
  }

  .distance {
    position: absolute;

    top: 50%;
    transform: translate(-100%, -50%);

    margin-left: -1.75rem;

    font-size: 0.85em;
    color: #d6d6d6;
  }

  .indicator {
    position: absolute;
    z-index: 3;

    top: 50%;
    left: -1rem;

    transform: translate(-50%, -50%);

    text-align: right;

    width: 15px;
    height: 15px;

    background: var(--clr-secondary);
    border: 2px solid white;
    border-radius: 100%;
  }

  .stop-name {
    background: var(--clr-accent);
    padding: 0.3em 0.5em;

    display: flex;
    align-items: center;
  }

  .stop-date {
    display: flex;
    align-items: center;

    .date {
      background: #494949;
      padding: 0.3em 0.5em;
    }

    .stop {
      &.ph,
      &.ph-pm {
        background: #db8e29;
      }

      background: #252525;
    }

    .arrival,
    .departure {
      &.delayed {
        background: #f80334;
      }

      &.preponed {
        background: rgb(0, 139, 0);
      }
    }
  }
}
</style>
