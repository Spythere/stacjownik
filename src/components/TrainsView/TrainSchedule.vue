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
          :data-track-count="stop.arrivalTrackCount ?? stop.departureTrackCount"
        >
          <span class="stop_info">
            <span class="distance">
              {{ stop.distance.toFixed(1) }}
            </span>

            <div class="progress">
              <div class="node"></div>
              <div class="line line_stop" v-if="stop.status == 'stopped'"></div>
            </div>

            <StopLabel :stop="stop" />
          </span>

          <div class="stop_line" v-if="i < scheduleStops.length - 1">
            <!-- Grid placeholder -->
            <div class="line-speed">
              <div>{{ stop.departureSpeed }}</div>
              <div>{{ stop.arrivalSpeed }}</div>
            </div>

            <div class="progress">
              <div class="line line_connection"></div>
            </div>

            <div class="bottom-line-info">
              <!-- <div>
                {{ stop.sceneryName }}
              </div> -->

              <div class="info-comments" v-if="stop.comments" style="color: salmon">
                <img src="/images/icon-warning.svg" alt="icon-warning" width="20" />
                <b v-html="stop.comments"></b>
              </div>

              <!-- Routes  -->
              <span
                v-if="
                  stop.departureLine == train.timetableData!.followingStops[i + 1].arrivalLine &&
                  !/sbl/gi.test(stop.departureLine!)
                "
              >
                {{ stop.departureLine }}
              </span>

              <span v-else-if="!/sbl/gi.test(stop.departureLine!)">
                <div>{{ stop.departureLine }}</div>
                <div
                  class="scenery-change-name"
                  v-if="
                    i < scheduleStops.length - 1 &&
                    stop.sceneryName != scheduleStops[i + 1].sceneryName
                  "
                >
                  {{ scheduleStops[i + 1].sceneryName }}
                </div>
                <div>
                  {{ train.timetableData!.followingStops[i + 1].arrivalLine }}
                </div>
              </span>

              <!-- || {{ stop.departureSpeed || '---' }} || {{ stop.arrivalSpeed || '---' }} -->
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
import Train from '../../scripts/interfaces/Train';
import StopLabel from './StopLabel.vue';
import StockList from '../Global/StockList.vue';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';

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
  sceneryHash: string;
  distance: number;

  departureLine: string | null;
  arrivalLine: string | null;

  arrivalSpeed: number | null;
  departureSpeed: number | null;

  arrivalTrackCount: number | null;
  departureTrackCount: number | null;

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
      let currentSceneryIndex = 0;
      let lastTrackCount = 2;

      return (
        this.train.timetableData?.followingStops.map((stop, i, arr) => {
          if (
            i > 0 &&
            stop.arrivalLine &&
            stop.arrivalLine != arr[i - 1].departureLine &&
            !/sbl/gi.test(stop.arrivalLine)
          )
            currentSceneryIndex++;

          const sceneryInfo = this.apiStore.sceneryData.find(
            (sd) =>
              sd.name.toLocaleLowerCase() ==
              this.timetableSceneryNames[currentSceneryIndex].toLocaleLowerCase()
          );

          const nextSceneryInfo = this.apiStore.sceneryData.find(
            (sd) =>
              sd.name.toLocaleLowerCase() ==
              this.timetableSceneryNames[currentSceneryIndex + 1]?.toLocaleLowerCase()
          );

          const arrivalLineInfo = nextSceneryInfo?.routesInfo.find(
            (r) => r.routeName == arr[i + 1]?.arrivalLine
          );

          const departureLineInfo = sceneryInfo?.routesInfo.find(
            (r) => r.routeName == stop.departureLine
          );

          // let nextOuterLineName = '';
          // for(let j = i; i < arr.length - 2; i++) {
          //   if(arr[j].departureLine && arr[j].departureLine != arr[j+1].arrivalLine) {
          //     nextOuterLineName = arr[j].departureLine!;
          //     break
          //   }
          // }

          lastTrackCount = departureLineInfo?.routeTracks ?? lastTrackCount;

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

            arrivalSpeed: arrivalLineInfo?.routeSpeed ?? null,
            departureSpeed: departureLineInfo?.routeSpeed ?? null,

            arrivalTrackCount: arrivalLineInfo?.routeTracks ?? null,
            departureTrackCount: departureLineInfo?.routeTracks ?? lastTrackCount,

            type: stop.stopType,
            distance: stop.stopDistance,
            isActive: this.activeMinorStops.includes(i),
            isLastConfirmed: this.lastConfirmed === i && !stop.terminatesHere,
            isSBL: /sbl/gi.test(stop.stopName),
            position: stop.beginsHere ? 'begin' : stop.terminatesHere ? 'end' : 'en-route',
            sceneryHash: '',
            sceneryName: this.timetableSceneryNames[currentSceneryIndex],
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
        if (/po\.|sbl/gi.test(this.train.timetableData!.followingStops[i].stopNameRAW))
          activeMinorStopList.push(i);
        else break;
      }

      return activeMinorStopList;
    },

    timetableSceneryNames() {
      if (!this.train.timetableData?.sceneries) return [];

      return this.train.timetableData?.sceneries
        .map(
          (sceneryHash) =>
            this.store.onlineSceneryList.find((st) => st.hash === sceneryHash)?.name ??
            this.apiStore.sceneryData.find((sd) => sd.hash === sceneryHash)?.name ??
            sceneryHash
        )
        .reverse();
    },

    timetableOuterRoutes() {
      // for (let i = 0; i < this.scheduleStops.length; i++) {}

      return [];
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

@keyframes blink {
  from {
    border-color: $barClr;
  }
  to {
    border-color: $confirmedClr;
  }
}

.train-schedule {
  padding: 0 1em;
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
  gap: 0.25em;

  padding: 0.25em 0;
}

.stop {
  // Begin stop
  &[data-position='begin'] {
    .node {
      border-color: lightgreen;
    }
  }

  // End stop
  &[data-position='end'] {
    .node {
      border-color: salmon;
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
      animation: 0.5s ease-in-out alternate infinite blink;
    }
  }

  // Last confirmed outpost / checkpoint
  &[data-last-confirmed='true'] {
    .progress > .line_connection {
      animation: 0.5s ease-in-out alternate infinite blink;
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
  }

  &[data-track-count='2'] {
    .progress > .line {
      width: 6px;
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
  color: gold;
  gap: 5px;
}

.stop_info {
  position: relative;
  text-align: center;
}

.stop_line {
  font-size: 0.8em;
  color: #ccc;
  margin-top: 0.25em;
}

.distance {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d6d6d6;
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
      top: -1em;
      height: calc(100% + 2em);
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

.bottom-line-info {
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
}
</style>
