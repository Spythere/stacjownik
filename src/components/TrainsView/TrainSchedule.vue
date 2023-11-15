<template>
  <div class="train-schedule" @click="toggleShowState">
    <StockList :trainStockList="train.stockList" />

    <!-- <div class="train-stock"> -->
    <!-- <ul>
        <li v-for="(stockName, i) in train.stockList" :key="i">
          <p>{{ stockName.split(':')[0].split('_').splice(0, 2).join(' ') }} {{ stockName.split(':')[1] }}</p>
          <TrainThumbnail :name="stockName" /> 
        </li>
      </ul> -->
    <!-- </div> -->

    <div class="schedule-wrapper" v-if="train.timetableData">
      <ul class="stop_list">
        <li
          v-for="(stop, i) in train.timetableData.followingStops"
          :key="i"
          class="stop"
          :class="addClasses(stop, i)"
        >
          <span class="stop_info">
            <div class="indicator"></div>

            <div class="progress-bar"></div>

            <div class="stop-bar"></div>

            <span class="distance" v-if="stop.stopDistance">
              {{ Math.floor(stop.stopDistance) }}
            </span>

            <span class="stop-name" v-html="stop.stopName"> </span>

            <StopDate :stop="stop" />
          </span>

          <div class="stop_line" v-if="i < train.timetableData!.followingStops.length - 1">
            <div class="progress-bar"></div>

            <div v-if="stop.comments" style="color: salmon">
              <b>{{ stop.stopNameRAW }} </b>: <span v-html="stop.comments"></span>
            </div>

            <span
              v-if="
                stop.departureLine == train.timetableData!.followingStops[i + 1].arrivalLine &&
                !/sbl/gi.test(stop.departureLine!)
              "
            >
              {{ stop.departureLine }}
            </span>

            <span v-else-if="!/sbl/gi.test(stop.departureLine!)">
              {{ stop.departureLine }} /
              {{ train.timetableData!.followingStops[i + 1].arrivalLine }}
            </span>
          </div>

          <div class="stop_line" v-else>
            <div v-if="stop.comments" style="color: salmon">
              <b>{{ stop.stopNameRAW }} </b>: <span v-html="stop.comments"></span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import Train from '../../scripts/interfaces/Train';
import { useStore } from '../../store/mainStore';
import StopDate from '../Global/StopDate.vue';
import StockList from '../Global/StockList.vue';
import { TrainStop } from '../../store/typings';

export default defineComponent({
  components: { StopDate, StockList },
  props: {
    train: {
      type: Object as PropType<Train>,
      required: true
    }
  },

  mixins: [dateMixin],

  emits: ['click'],

  setup(props) {
    return {
      store: useStore(),

      lastConfirmed: computed(() => {
        return props.train.timetableData!.followingStops.findIndex(
          (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed && !stops[i + 1]?.stopped
        );
      }),
      activeMinorStops: computed(() => {
        const lastMajorConfirmed = props.train.timetableData!.followingStops.findIndex(
          (stop, i, stops) => stop.confirmed && !stops[i + 1]?.confirmed
        );

        const activeMinorStopList: number[] = [];
        if (lastMajorConfirmed + 1 >= props.train.timetableData!.followingStops.length)
          return activeMinorStopList;

        for (
          let i = lastMajorConfirmed + 1;
          i < props.train.timetableData!.followingStops.length;
          i++
        ) {
          if (/po\.|sbl/gi.test(props.train.timetableData!.followingStops[i].stopNameRAW))
            activeMinorStopList.push(i);
          else break;
        }

        return activeMinorStopList;
      })
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
        sbl: /sbl/gi.test(stop.stopName),
        [stop.stopType.replaceAll(', ', '-')]:
          stop.stopType.match(new RegExp('ph|pm|pt')) && !stop.confirmed && !stop.beginsHere,
        'minor-stop-active': this.activeMinorStops.includes(index),
        'last-confirmed': index == this.lastConfirmed && !stop.terminatesHere
      };
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = '/images/icon-unknown.png';
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

$barClr: #b1b1b1;
$confirmedClr: #18d818;
$stoppedClr: #f55f31;
$haltClr: #f8bb36;
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
  padding: 0 1em;
}

.schedule-wrapper {
  overflow-y: auto;
  width: 100%;
  z-index: 5;

  margin-top: 1em;
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

.stop-name {
  background: $stopNameClr;
  padding: 0.3em 0.5em;

  display: flex;
  align-items: center;

  &.misc {
    background: gray;
  }
}

.stop-comment {
  background: forestgreen;
  padding: 0.3em 0.5em;

  max-width: 250px;
  overflow: hidden;
  white-space: nowrap;

  width: 2em;

  cursor: pointer;

  &:hover {
    text-overflow: ellipsis;
    width: 100%;
  }

  img {
    width: 1em;
  }

  span {
    font-size: 0.8em;
  }
}

ul.stop_list {
  margin-left: 2.5em;
}

ul.stop_list > li.stop {
  position: relative;

  display: flex;
  flex-direction: column;

  padding: 0 0.5em;

  &.sbl {
    .stop-date {
      display: none;
    }

    .stop-name {
      background: none;
      color: #aaa;
      padding: 0;
    }
  }

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

    flex-wrap: wrap;
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

    font-size: 0.75em;
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
}
</style>
