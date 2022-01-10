<template>
  <div class="train-schedule" @click="toggleShowState">
    <div class="schedule-wrapper">
      <ul class="stop_list">
        <li v-for="(stop, i) in followingStops" :key="i" class="stop" :class="addClasses(stop, i)">
          <span class="stop_info">
            <div class="indicator"></div>

            <div class="progress-bar"></div>

            <div class="stop-bar"></div>

            <span class="distance" v-if="stop.stopDistance">
              {{ Math.floor(stop.stopDistance) }}
            </span>

            <span class="stop-name">
              <span v-html="stop.stopName"></span>
              <img v-if="stop.comments" :src="icons.warning" :title="`${$t('trains.comment')}: ${stop.comments}`">
              {{ decodeURIComponent(stop.comments) }}
            </span>
            <span class="stop-date">
              <span
                class="date arrival"
                v-if="!stop.beginsHere"
                :class="{
                  delayed: stop.arrivalDelay > 0 && stop.confirmed,
                  preponed: stop.arrivalDelay < 0 && stop.confirmed,
                  'on-time': stop.arrivalDelay == 0 && stop.confirmed,
                }"
              >
                <span v-if="stop.arrivalDelay != 0 && stop.confirmed">
                  <s>{{ stop.arrivalTimeString }}</s>
                  {{ stop.arrivalRealTimeString }}
                </span>

                <span v-else>
                  {{ stop.arrivalTimeString }}
                </span>
              </span>

              <span class="date stop" v-if="stop.stopTime" :class="stop.stopType.replace(', ', '-')">
                {{ stop.stopTime }} {{ stop.stopType == '' ? 'pt' : stop.stopType }}
              </span>

              <span
                class="date departure"
                v-if="!stop.terminatesHere && stop.stopTime != 0"
                :class="{
                  delayed: stop.departureDelay > 0 && stop.confirmed,
                  preponed: stop.departureDelay < 0 && stop.confirmed,
                }"
              >
                <span v-if="stop.departureDelay != 0 && stop.confirmed">
                  <s>{{ stop.departureTimeString }}</s>
                  {{ stop.departureRealTimeString }}
                </span>

                <span v-else>
                  {{ stop.departureTimeString }}
                </span>
              </span>
            </span>
          </span>


          <div class="stop_line" v-if="i < followingStops.length - 1">
            <div class="progress-bar"></div>

            <span v-if="stop.departureLine == followingStops[i + 1].arrivalLine">
              {{ stop.departureLine }}
            </span>

            <span v-else>
              {{ stop.departureLine }} /
              {{ followingStops[i + 1].arrivalLine }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import TrainStop from '@/scripts/interfaces/TrainStop';
import { computed, defineComponent } from '@vue/runtime-core';

export default defineComponent({
  props: {
    followingStops: {
      type: Array as () => TrainStop[],
      required: true,
    },
  },

  emits: ['click'],

  data: () => ({
    icons: {
      warning: require("@/assets/icon-warning.svg")
    }
  }),

  setup(props) {
    return {
      lastConfirmed: computed(() => {
        return props.followingStops.findIndex(
          (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed && !stops[i + 1]?.stopped
        );
      }),
      activeMinorStops: computed(() => {
        const lastMajorConfirmed = props.followingStops.findIndex(
          (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed
        );

        const activeMinorStopList: number[] = [];
        if (lastMajorConfirmed + 1 >= props.followingStops.length) return activeMinorStopList;

        for (let i = lastMajorConfirmed + 1; i < props.followingStops.length; i++) {
          if (props.followingStops[i].stopNameRAW.includes('po.')) activeMinorStopList.push(i);
          else break;
        }

        return activeMinorStopList;
      }),
    };
  },

  methods: {
    toggleShowState() {
      this.$emit('click');
    },

    addClasses(stop: TrainStop, index: number) {
      return {
        confirmed: stop.confirmed,
        stopped: stop.stopped,
        begin: stop.beginsHere,
        end: stop.terminatesHere,
        delayed: stop.departureDelay > 0,
        [stop.stopType.replaceAll(', ', '-')]:
          stop.stopType.match(new RegExp('ph|pm|pt')) && !stop.confirmed && !stop.beginsHere,
        'minor-stop-active': this.activeMinorStops.includes(index),
        'last-confirmed': index == this.lastConfirmed && !stop.terminatesHere,
      };
    },
  },
});
</script>

<style lang="scss" scoped>
$barClr: #b1b1b1;
$confirmedClr: #18d818;
$stoppedClr: #f55f31;
$haltClr: #f8bb36;

$preponedClr: lime;
$delayedClr: salmon;
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
  left: -17px;

  height: 100%;
  width: 3px;

  background-color: $barClr;
}

ul.stop_list > li.stop {
  position: relative;

  display: flex;
  flex-direction: column;

  padding: 0 0.5em;

  &[class*='ph'] > .stop_info > .indicator {
    border-color: $stopNameClr;
  }

  &[class*='pt'] > .stop_info > .indicator {
    border-color: #818181;
  }

  &.begin {
    .stop_info > .indicator {
      border-color: lightgreen;
    }

    .stop_info > .progress-bar {
      background: lightgreen;
    }
  }

  &.end {
    .stop_info > .indicator {
      border-color: salmon;
    }

    .stop_info > .progress-bar {
      background: salmon;
    }
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
    left: -17px;

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

    img {
      width: 1em;
      margin-left: 0.5em;
    }
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
        s {
          color: #999;
        }

        span {
          color: $delayedClr;
        }
      }

      &.preponed {
        s {
          color: #999;
        }

        span {
          color: $preponedClr;
        }
      }
    }
  }
}
</style>
