<template>
  <div class="train-schedule">
    <div class="schedule-wrapper" v-if="train.timetableData">
      <div class="stops">
        <div
          v-for="(stop, i) in scheduleStopsV2"
          :key="i"
          class="stop"
          :data-status="stop.status"
          :data-sbl="stop.isSBL && stop.sceneryName == scheduleStopsV2[i + 1]?.sceneryName"
          :data-position="stop.position"
          :data-delayed="stop.departureDelay > 0"
          :data-stop-type="stop.type"
          :data-is-active="stop.isActive"
          :data-track-count-departure="stop.departureLineInfo?.routeTracks ?? 2"
          :data-track-count-arrival="stop.arrivalLineInfo?.routeTracks ?? 2"
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
              <div class="line line_connection" v-if="i < scheduleStopsV2.length - 1"></div>
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
                  (scheduleStopsV2[i + 1]?.arrivalLineInfo?.routeSpeed !=
                    stop.arrivalLineInfo?.routeSpeed ||
                    stop.sceneryName != scheduleStopsV2[i + 1]?.sceneryName)
                "
              >
                <div class="scenery-route">
                  <span>{{ stop.departureLine }}</span>

                  <span v-if="stop.departureLineInfo">
                    <span> | {{ stop.departureLineInfo.routeSpeed }}</span>

                    <img
                      :src="
                        stop.departureLineInfo.isElectric
                          ? '/images/icon-catenary.svg'
                          : '/images/icon-we4a.png'
                      "
                      width="14"
                      data-tooltip-type="BaseTooltip"
                      :data-tooltip-content="
                        $t(
                          `trains.${!stop.departureLineInfo.isElectric ? 'no-' : ''}catenary-tooltip`
                        )
                      "
                    />

                    <img
                      v-if="stop.departureLineInfo.isRouteSBL"
                      src="/images/icon-sbl-transparent.svg"
                      width="14"
                      data-tooltip-type="BaseTooltip"
                      :data-tooltip-content="$t('trains.sbl-tooltip')"
                    />
                  </span>
                </div>

                <div
                  v-if="stop.sceneryName != scheduleStopsV2[i + 1]?.sceneryName"
                  class="scenery-change-name"
                >
                  <span>{{ scheduleStopsV2[i + 1].sceneryName }}</span>
                </div>

                <div
                  class="scenery-route"
                  v-if="stop.sceneryName != scheduleStopsV2[i + 1]?.sceneryName"
                >
                  <span> {{ scheduleStopsV2[i + 1].arrivalLine }}</span>

                  <span v-if="scheduleStopsV2[i + 1].arrivalLineInfo">
                    <span> | {{ scheduleStopsV2[i + 1].arrivalLineInfo!.routeSpeed }} </span>

                    <img
                      :src="
                        scheduleStopsV2[i + 1].arrivalLineInfo?.isElectric
                          ? '/images/icon-catenary.svg'
                          : '/images/icon-we4a.png'
                      "
                      data-tooltip-type="BaseTooltip"
                      :data-tooltip-content="
                        $t(
                          `trains.${!scheduleStopsV2[i + 1].arrivalLineInfo?.isElectric ? 'no-' : ''}catenary-tooltip`
                        )
                      "
                      width="14"
                    />

                    <img
                      v-if="scheduleStopsV2[i + 1].arrivalLineInfo!.isRouteSBL"
                      src="/images/icon-sbl-transparent.svg"
                      width="14"
                      data-tooltip-type="BaseTooltip"
                      :data-tooltip-content="$t('trains.sbl-tooltip')"
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
import { StationRoutesInfo, TimetablePathElement, Train } from '../../typings/common';
import { TrainSchedulePoint } from './typings';

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

  methods: {
    getPathSceneryData(pathEl: TimetablePathElement) {
      const sceneryData =
        this.store.stationList?.find((sc) => sc.name == pathEl.stationName) ?? null;

      if (!sceneryData || !sceneryData.generalInfo) return null;

      const activeScenery = this.apiStore.activeData?.activeSceneries?.find(
        (sc) => sc.stationName == pathEl.stationName
      );

      const arrivalLineData = pathEl.arrivalRouteExt
        ? (sceneryData.generalInfo.routes.all.find(
            (rt) => rt.routeName == pathEl.arrivalRouteExt
          ) ?? null)
        : null;

      const departureLineData = pathEl.departureRouteExt
        ? (sceneryData.generalInfo.routes.all.find(
            (rt) => rt.routeName == pathEl.departureRouteExt
          ) ?? null)
        : null;

      return {
        generalInfo: sceneryData.generalInfo,
        isOnline:
          activeScenery &&
          (activeScenery.isOnline == 1 || activeScenery.lastSeen >= Date.now() - 60000),
        arrivalLineData,
        departureLineData
      };
    }
  },

  computed: {
    scheduleStopsV2() {
      if (!this.train.timetableData) return [];

      const { timetablePath, followingStops } = this.train.timetableData;

      const stopRows: TrainSchedulePoint[] = [];

      let currentPathIndex = 0;
      let currentPath = timetablePath[0];

      let pathData = this.getPathSceneryData(currentPath);

      let arrivalLineInfo: StationRoutesInfo | null = null;
      let departureLineInfo: StationRoutesInfo | null = null;

      let isActive = false;

      if (pathData?.departureLineData) {
        arrivalLineInfo = pathData.departureLineData;
        departureLineInfo = pathData.departureLineData;
      }

      for (const stop of followingStops) {
        let isExternal = false;

        if (
          stop.arrivalLine &&
          currentPath.arrivalRouteExt &&
          stop.arrivalLine == currentPath.arrivalRouteExt
        ) {
          isExternal = true;

          if (pathData?.arrivalLineData) {
            arrivalLineInfo = pathData.arrivalLineData;
          }
        }

        let correctedDepartureLineData: StationRoutesInfo | null = null;

        const internalRouteInfo = stop.departureLine
          ? pathData?.generalInfo.routes.all.find(
              (route) => route.isInternal && route.routeName == stop.departureLine
            )
          : undefined;

        if (internalRouteInfo) {
          correctedDepartureLineData = internalRouteInfo;
          departureLineInfo = internalRouteInfo;
        }

        let rowData: TrainSchedulePoint = {
          nameHtml: stop.stopName,
          nameRaw: stop.stopNameRAW,

          arrivalScheduled: stop.arrivalTimestamp,
          arrivalReal: stop.arrivalRealTimestamp,

          departureScheduled: stop.departureTimestamp,
          departureReal: stop.departureRealTimestamp,

          departureDelay: stop.departureDelay,
          arrivalDelay: stop.arrivalDelay,

          duration: stop.stopTime ?? 0,
          type: stop.stopType,
          distance: stop.stopDistance,

          comments: stop.comments ?? null,

          arrivalLine: stop.arrivalLine,
          departureLine: stop.departureLine,

          arrivalLineInfo: arrivalLineInfo,
          departureLineInfo,

          isExternal,

          isActive: isActive,

          isSBL: /sbl/gi.test(stop.stopName),
          position: stop.beginsHere ? 'begin' : stop.terminatesHere ? 'end' : 'en-route',
          status: stop.confirmed ? 'confirmed' : stop.stopped ? 'stopped' : 'unconfirmed',

          sceneryName: currentPath.stationName,
          isSceneryOnline: pathData?.isOnline ?? false
        };

        if (internalRouteInfo) {
          arrivalLineInfo = departureLineInfo;
        }

        if (
          stopRows[stopRows.length - 1]?.status == 'confirmed' &&
          rowData.status != 'confirmed' &&
          rowData.status != 'stopped'
        )
          stopRows[stopRows.length - 1].isActive = true;

        if (
          stopRows[stopRows.length - 1]?.isActive == true &&
          !/(^<strong>|, podg$)/.test(rowData.nameHtml)
        )
          rowData.isActive = true;

        stopRows.push(rowData);

        if (
          stop.departureLine &&
          currentPath.departureRouteExt &&
          stop.departureLine == currentPath.departureRouteExt
        ) {
          // Reverse search for last scenery checkpoint
          if (pathData?.departureLineData) {
            stopRows[stopRows.length - 1].isExternal = true;

            for (let i = stopRows.length - 1; i > 0; i--) {
              stopRows[i].departureLineInfo = pathData.departureLineData;

              if (/(^<strong>|, podg$)/.test(stopRows[i].nameHtml)) {
                break;
              }

              stopRows[i].arrivalLineInfo = pathData.departureLineData;
            }
          }

          currentPath = timetablePath[++currentPathIndex];
          pathData = this.getPathSceneryData(currentPath);
        }
      }

      console.log(stopRows);

      return stopRows;
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
  &[data-sbl='true'] {
    display: none;
  }

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

  // &[data-minor-stop-active='true'] {
  //   .progress > .line {
  //     animation: $blinkAnim;
  //   }

  //   & + div {
  //     .progress > .line_node-top {
  //       animation: $blinkAnim;
  //     }
  //   }
  // }

  &[data-is-active='true'] {
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
      width: 8px;
      border-width: 3px;
    }
  }

  &[data-track-count-arrival='2'] {
    .progress > .line_node-top {
      width: 8px;
      border-width: 3px;
    }
  }

  &[data-track-count-arrival='1'] {
    .progress > .line_node-top {
      width: 2px;
      border-width: 2px;
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

  img[data-tooltip] {
    cursor: help;
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
