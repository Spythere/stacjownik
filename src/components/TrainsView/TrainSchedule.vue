<template>
  <div class="train-schedule" @click="toggleShowState">
    <StockList :trainStockList="train.stockList" />

    <div class="schedule-wrapper" v-if="train.timetableData">
      <div class="stops">
        <div
          v-for="(stop, i) in scheduleStops"
          :key="i"
          class="stop"
          :data-status="stop.status"
          :data-position="stop.position"
          :data-delayed="stop.departureDelay > 0"
          :data-stop-type="stop.type"
          :data-minor-stop-active="stop.isActive"
          :data-last-confirmed="stop.isLastConfirmed"
        >
          <span class="stop_info">
            <span class="distance">
              {{ stop.distance ? stop.distance.toFixed(1) : '' }}
            </span>

            <div class="progress">
              <div class="line line_node line_node-top"></div>
              <div class="node"></div>
              <div class="line line_node line_node-bottom"></div>
            </div>

            <StopLabel :stop="stop" />
          </span>

          <div class="stop_line">
            <!-- Grid placeholder -->
            <div></div>

            <div class="progress">
              <div class="line line_connection" v-if="i < scheduleStops.length - 1"></div>
            </div>

            <div class="bottom-line-info">
              <div class="info-comments" v-if="stop.comments" style="color: salmon">
                <img src="/images/icon-warning.svg" alt="icon-warning" width="20" />
                <b v-html="stop.comments"></b>
              </div>

              <!-- Routes  -->
              <span
                v-if="
                  stop.departureLine &&
                  scheduleStops[i + 1] != undefined &&
                  !/-|_|(^it\d+)|(^sbl)/gi.test(stop.departureLine)
                "
              >
                <div class="scenery-route">
                  <span>{{ stop.departureLine }}</span>
                  <span v-if="stop.departureLineInfo">
                    | {{ stop.departureLineInfo.routeSpeed }}
                    <span v-if="stop.departureLineInfo.isElectric">⚡</span>
                    <img
                      v-else
                      src="/images/icon-we4a.png"
                      :title="$t('trains.we4a-tooltip')"
                      width="10"
                    />
                  </span>
                </div>

                <div
                  v-if="stop.sceneryName != scheduleStops[i + 1]?.sceneryName"
                  class="scenery-change-name"
                >
                  <span>{{ scheduleStops[i + 1].sceneryName }}</span>
                  <span v-if="stop.departureLineInfo?.routeTracks == 1"> &UpDownArrow;</span>
                  <span v-else> &UpArrowDownArrow;</span>
                </div>

                <div class="scenery-route">
                  <span> {{ scheduleStops[i + 1].arrivalLine }}</span>

                  <span v-if="scheduleStops[i + 1].arrivalLineInfo">
                    | {{ scheduleStops[i + 1].arrivalLineInfo!.routeSpeed }}
                    <span v-if="scheduleStops[i + 1].arrivalLineInfo!.isElectric">⚡</span>
                    <img
                      v-else
                      src="/images/icon-we4a.png"
                      :title="$t('trains.we4a-tooltip')"
                      width="10"
                    />
                  </span>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import StopLabel from './StopLabel.vue';
import StockList from '../Global/StockList.vue';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';
import { StationRoutesInfo, Train } from '../../typings/common';

export interface TrainScheduleStop {
  nameHtml: string;
  nameRaw: string;

  status: 'confirmed' | 'unconfirmed' | 'stopped';
  type: string;
  position: 'begin' | 'end' | 'en-route';

  arrivalScheduled: number;
  arrivalReal: number;

  departureScheduled: number;
  departureReal: number;

  departureDelay: number;
  arrivalDelay: number;

  duration: number | null;

  isActive: boolean;
  isLastConfirmed: boolean;
  isSBL: boolean;

  sceneryName: string | null;
  distance: number;

  arrivalLine: string | null;
  departureLine: string | null;

  arrivalLineInfo?: StationRoutesInfo;
  departureLineInfo?: StationRoutesInfo;

  isExternal: boolean;

  comments: string | null;
}

export default defineComponent({
  components: { StopLabel, StockList },
  props: {
    train: {
      type: Object as PropType<Train>,
      required: true
    }
  },

  mixins: [dateMixin],

  emits: ['click'],

  data() {
    return {
      store: useMainStore(),
      apiStore: useApiStore()
    };
  },

  computed: {
    scheduleStops(): TrainScheduleStop[] {
      if (!this.train.timetableData) return [];

      const { timetablePath } = this.train.timetableData;
      let currentPathIndex = 0;

      return (
        this.train.timetableData?.followingStops.map((stop, i, arr) => {
          const isExternal =
            i < arr.length - 1 &&
            stop.departureLine === timetablePath[currentPathIndex].departureRouteExt;

          const sceneryName = timetablePath[currentPathIndex].stationName;
          const sceneryInfo = this.apiStore.sceneryData.find((st) => st.name == sceneryName);

          const arrivalLineInfo = sceneryInfo?.routesInfo.find(
            (r) => r.routeName == stop.arrivalLine
          );

          const departureLineInfo = sceneryInfo?.routesInfo.find(
            (r) => r.routeName == stop.departureLine
          );

          if (isExternal) currentPathIndex++;

          return {
            nameHtml: stop.stopName,
            nameRaw: stop.stopNameRAW,

            arrivalScheduled: stop.arrivalTimestamp,
            arrivalReal: stop.arrivalRealTimestamp,

            departureScheduled: stop.departureTimestamp,
            departureReal: stop.departureRealTimestamp,

            departureDelay: stop.departureDelay,
            arrivalDelay: stop.arrivalDelay,

            duration: stop.stopTime,

            comments: stop.comments ?? null,

            arrivalLine: stop.arrivalLine,
            departureLine: stop.departureLine,

            arrivalLineInfo: arrivalLineInfo,
            departureLineInfo: departureLineInfo,

            isExternal,

            type: stop.stopType,
            distance: stop.stopDistance,
            isActive: this.activeMinorStops.includes(i),
            isLastConfirmed: this.lastConfirmed === i && !stop.terminatesHere,
            isSBL: /sbl/gi.test(stop.stopName),
            position: stop.beginsHere ? 'begin' : stop.terminatesHere ? 'end' : 'en-route',
            sceneryName,
            status: stop.confirmed ? 'confirmed' : stop.stopped ? 'stopped' : 'unconfirmed'
          };
        }) ?? []
      );
    },

    lastConfirmed() {
      return this.train.timetableData?.followingStops.findIndex(
        (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed && !stops[i + 1]?.stopped
      );
    },

    activeMinorStops() {
      if (!this.train.timetableData) return [];

      const lastMajorConfirmed = this.train.timetableData.followingStops.findIndex(
        (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed
      );

      const activeMinorStopList: number[] = [];
      if (lastMajorConfirmed + 1 >= this.train.timetableData.followingStops.length)
        return activeMinorStopList;

      for (
        let i = lastMajorConfirmed + 1;
        i < this.train.timetableData!.followingStops.length;
        i++
      ) {
        if (/(, po$|sbl|, pe$)/gi.test(this.train.timetableData!.followingStops[i].stopNameRAW))
          activeMinorStopList.push(i);
        else break;
      }

      return activeMinorStopList;
    }
  },

  methods: {
    toggleShowState() {
      this.$emit('click');
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

$barClr: #b1b1b1;
$confirmedClr: #4ae24a;
$stoppedClr: #f55f31;
$haltClr: #f8bb36;

$blinkAnim: 0.5s ease-in-out alternate infinite blink;

@keyframes blink {
  from {
    border-color: $barClr;
  }
  to {
    border-color: $confirmedClr;
  }
}

.train-schedule {
  padding: 1em;
}

.schedule-wrapper {
  overflow-y: auto;
  width: 100%;
  z-index: 5;

  margin-top: 1em;
}

.stops {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  gap: 5px;

  padding: 5px 0;
}

.stop {
  // Begin stop
  &[data-position='begin'] {
    .node {
      border-color: lightgreen;
    }

    .line_node-top {
      display: none;
    }
  }

  // End stop
  &[data-position='end'] {
    .node {
      border-color: salmon;
    }

    .line_node-bottom {
      display: none;
    }
  }

  // Stop types
  &[data-stop-type*='pt'] .node {
    border-color: #818181;
  }

  &[data-stop-type*='ph'] .node {
    border-color: $haltClr;
  }

  &[data-minor-stop-active='true'] {
    .progress > .line {
      animation: $blinkAnim;
    }

    & + div {
      .progress > .line_node-top {
        animation: $blinkAnim;
      }
    }
  }

  // Last confirmed outpost / checkpoint
  &[data-last-confirmed='true'] {
    .progress > .line_connection {
      animation: $blinkAnim;
    }

    .progress > .line_node-bottom {
      animation: $blinkAnim;
    }

    & + div {
      .progress > .line_node-top {
        animation: $blinkAnim;
      }
    }
  }

  // Confirmed status
  &[data-status='confirmed'] {
    .progress > .node {
      border-color: $confirmedClr;
    }
    .progress > .line {
      border-left: 2px solid $confirmedClr;
      border-right: 2px solid $confirmedClr;
    }
  }

  // Stopped status
  &[data-status='stopped'] {
    .progress > .node {
      border-color: $stoppedClr;
    }

    .progress > .line_node {
      border-color: $stoppedClr;
    }
  }

  // Unused so far
  &[data-track-count-departure='2'] {
    .progress > .line {
      width: 6px;
    }
  }

  &[data-track-count-arrival='2'] {
    .progress > .line_node-top {
      width: 6px;
    }
  }

  &[data-track-count-arrival='1'] {
    .progress > .line_node-top {
      width: 4px;
    }
  }

  &[data-electrified-departure] {
    .stop_line > .line-speed > .speed-departure {
      color: #00c1c7;
    }
  }

  &[data-electrified-arrival] {
    .stop_line > .line-speed > .speed-next-arrival {
      color: #00c1c7;
    }
  }
}

.stop_info,
.stop_line {
  display: grid;
  grid-template-columns: 30px 40px auto 1fr;
}

.line-speed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #9b9b9b;
  gap: 10px;
}

.stop_info {
  position: relative;
  text-align: center;
}

.stop_line {
  font-size: 0.8em;
  color: #ccc;
  margin-top: 5px;
}

.distance {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
}

.progress {
  position: relative;

  & > .node {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;

    text-align: right;

    width: 15px;
    height: 15px;

    background-color: var(--clr-secondary);
    border: 4px solid $barClr;
    border-radius: 100%;
  }

  & > .line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 10;

    height: 100%;

    // background-color: $barClr;
    border-left: 2px solid $barClr;
    border-right: 2px solid $barClr;

    &.line_connection {
      transform: translate(-50%, -6px);
      height: calc(100% + 12px);
      // height: calc(100% + 0.25em);
    }

    &.line_node-top {
      top: 0;
      height: 50%;
    }

    &.line_node-bottom {
      top: 50%;
      height: 50%;
    }

    &.line_stop {
      border-color: $stoppedClr;
      z-index: 11;
    }
  }
}

.info-comments {
  display: flex;
  align-items: center;
  gap: 0.25em;

  margin: 0.25em 0;

  img {
    height: 1.2em;
  }
}

.scenery-route {
  display: flex;
  gap: 0.25em;

  span:nth-child(2) {
    display: flex;
    gap: 0.25em;
    align-items: center;
  }

  img {
    width: 1em;
  }
}

.scenery-change-name {
  position: relative;
  margin: 0.25em 0;

  &::before {
    content: '';
    position: absolute;
    height: 2px;
    width: 30px;
    background-color: #aaa;

    top: 50%;
    right: calc(100% + 5px);
    transform: translate(0, -50%);
  }
}
</style>
