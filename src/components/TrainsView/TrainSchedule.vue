<template>
  <div class="train-schedule" @click="toggleShowState">
    <div class="schedule-wrapper">
      <ul class="stop_list">
        <li
          v-for="(stop, i) in followingStops"
          :key="i"
          :class="addClasses(stop, i)"
        >
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
                      ? stop.arrivalRealTimeString || ""
                      : stop.arrivalTimeString || "",
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
                      ? stop.departureRealTimeString || ""
                      : stop.departureTimeString || "",
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
import TrainStop from "@/scripts/interfaces/TrainStop";
import { computed, defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: {
    followingStops: {
      type: Array as () => TrainStop[],
      required: true,
    },
  },
  emits: ["click"],

  setup(props) {
    return {
      lastConfirmed: computed(() => {
        return props.followingStops.findIndex(
          (stop, i, stops) =>
            stop.confirmed && !stops[i + 1]?.confirmed && !stops[i + 1]?.stopped
        );
      }),
      activeMinorStops: computed(() => {
        const lastMajorConfirmed = props.followingStops.findIndex(
          (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed
        );

        const activeMinorStopList: number[] = [];
        if (lastMajorConfirmed + 1 >= props.followingStops.length)
          return activeMinorStopList;

        for (
          let i = lastMajorConfirmed + 1;
          i < props.followingStops.length;
          i++
        ) {
          if (props.followingStops[i].stopNameRAW.includes("po."))
            activeMinorStopList.push(i);
          else break;
        }

        return activeMinorStopList;
      }),
    };
  },

  methods: {
    stylizeTime(timeString: string, delay: number, confirmed: boolean) {
      return (
        timeString +
        (delay != 0 && confirmed
          ? " (" + (delay > 0 ? "+" : "") + delay.toString() + ")"
          : "")
      );
    },

    toggleShowState() {
      this.$emit("click");
    },

    addClasses(stop: TrainStop, index: number) {
      return {
        confirmed: stop.confirmed,
        stopped: stop.stopped,
        beginning: stop.beginsHere,
        delayed: stop.departureDelay > 0,
        [stop.stopType.replaceAll(", ", "-")]:
          stop.stopType.match(new RegExp("ph|pm|pt")) && !stop.confirmed,
        "minor-stop-active": this.activeMinorStops.includes(index),
        "last-confirmed": index == this.lastConfirmed,
      };
    },
  },
});
</script>

<style lang="scss" scoped>
$barClr: #d4d4d4;
$confirmedClr: #18d818;
$stoppedClr: #ff4500;
$haltClr: #48c5eb;

$preponedClr: #008b00;
$delayedClr: #e93f3f;
$dateClr: #525151;
$stopExchangeClr: #db8e29;
$stopDefaultClr: #252525;
$stopNameClr: #22a8d1;

@keyframes blink {
  from {
    background-color: $barClr;
  }
  to {
    background-color: $confirmedClr;
  }
}

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
  z-index: 10;

  top: -1px;
  /* left: -1rem; */
  left: -17px;

  /* transform: translate(-1px, -1px); */
  /* transform: translateX(-4spx, -1px); */

  height: 100%;
  width: 3px;

  background-color: $barClr;
}

ul.stop_list > li {
  position: relative;

  display: flex;
  flex-direction: column;

  padding: 0 0.5em;

  &[class*="ph"] > .stop_info > .indicator {
    border-color: $stopExchangeClr;
  }

  &[class*="pt"] > .stop_info > .indicator {
    border-color: #818181;
  }

  &.minor-stop-active {
    .stop_info > .progress-bar {
      animation: 0.5s ease-in-out alternate infinite blink;
    }

    .stop_line > .progress-bar {
      animation: 0.5s ease-in-out alternate infinite blink;
    }
  }

  &.last-confirmed {
    .stop_line > .progress-bar {
      animation: 0.5s ease-in-out alternate infinite blink;
    }
  }

  &.confirmed {
    .stop_info {
      > .progress-bar {
        background-color: $confirmedClr;
      }

      > .indicator {
        border-color: $confirmedClr;
      }
    }

    .stop_line > .progress-bar {
      background-color: $confirmedClr;
    }
  }

  &.stopped {
    .stop_info {
      > .indicator {
        border-color: $stoppedClr;
      }

      > .stop-bar {
        background: $stoppedClr;
      }
    }
  }

  .stop_line {
    font-size: 0.8em;
    color: #ccc;

    padding: 0.35em 0;

    position: relative;

    .line-segment {
      color: $barClr;
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

    transform: translate(-1px, -1px);

    z-index: 10;

    width: 3px;
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
    z-index: 11;

    top: 50%;
    left: -1rem;

    transform: translate(-47%, -50%);

    text-align: right;

    width: 15px;
    height: 15px;

    background: var(--clr-secondary);
    border: 3px solid $barClr;
    border-radius: 100%;
  }

  .stop-name {
    background: $stopNameClr;
    padding: 0.3em 0.5em;

    display: flex;
    align-items: center;
  }

  .stop-date {
    display: flex;
    align-items: center;

    .date {
      background: $dateClr;
      padding: 0.3em 0.5em;
    }

    .stop {
      &.ph,
      &.ph-pm,
      &.pm {
        background: $stopExchangeClr;
      }

      background: $stopDefaultClr;
    }

    .arrival,
    .departure {
      &.delayed {
        background: $delayedClr;
      }

      &.preponed {
        background: $preponedClr;
      }
    }
  }
}
</style>
