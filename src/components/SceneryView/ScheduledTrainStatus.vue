<template>
  <div class="general-status">
    <span
      :class="computedScheduledTrain.status"
      @click.prevent="() => {}"
      v-html="computedScheduledTrain.stopStatusIndicator"
    >
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { StopStatus } from '../../typings/common';
import { SceneryTimetableRow } from './typings';

export default defineComponent({
  props: {
    sceneryTimetableRow: {
      type: Object as PropType<SceneryTimetableRow>,
      required: true
    }
  },

  computed: {
    computedScheduledTrain() {
      const { status, prevElement, currentElement, nextElement } = this.sceneryTimetableRow;

      let stopStatusIndicator = '';

      switch (status) {
        case StopStatus.ARRIVING:
          if (prevElement) {
            stopStatusIndicator = this.$t('timetables.desc-arriving', {
              prevStationName: prevElement?.stationName ?? '',
              prevDepartureLine: prevElement?.departureRouteExt ?? ''
            });
          } else {
            stopStatusIndicator = this.$t('timetables.desc-beginning');
          }
          break;

        case StopStatus.ONLINE:
        case StopStatus.STOPPED:
          stopStatusIndicator = nextElement?.arrivalRouteExt
            ? this.$t(`timetables.desc-${status}`, {
                nextStationName: nextElement?.stationName,
                nextArrivalLine: nextElement?.arrivalRouteExt
              })
            : '';
          break;

        case StopStatus.DEPARTED:
          if (!nextElement?.stationName) {
            stopStatusIndicator = this.$t('timetables.desc-departed-ends', {
              nextStationName: currentElement.stationName
            });
          } else {
            stopStatusIndicator = this.$t('timetables.desc-departed', {
              nextStationName: nextElement?.stationName ?? currentElement.stationName,
              nextArrivalLine: nextElement?.arrivalRouteExt
            });
          }

          break;

        case StopStatus.DEPARTED_AWAY:
          stopStatusIndicator = this.$t('timetables.desc-departed-away', {
            nextStationName: nextElement?.stationName,
            nextArrivalLine: nextElement?.arrivalRouteExt
          });
          break;

        case StopStatus.TERMINATED:
          stopStatusIndicator = this.$t('timetables.desc-terminated');
          break;

        default:
          break;
      }
      return {
        ...this.sceneryTimetableRow,
        stopStatusIndicator
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.general-status {
  margin-top: 0.5em;

  span.arriving {
    color: #ccc;
  }

  span.departed {
    color: lime;

    &-away {
      color: #5ecc5e;
    }
  }

  span.stopped {
    color: #ffa600;
  }

  span.online {
    color: gold;
  }

  span.terminated {
    color: salmon;
  }
}
</style>
