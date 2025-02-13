<template>
  <div class="general-status">
    <span
      :class="computedScheduledTrain.status"
      data-tooltip-type="HtmlTooltip"
      :data-tooltip-content="computedScheduledTrain.stopStatusDescription"
      @click.prevent="() => {}"
    >
      {{ computedScheduledTrain.stopStatusIndicator }}
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

      const prevDepartureIndicator = prevElement?.departureRouteExt
        ? `(${prevElement.departureRouteExt}) ${prevElement.stationName}`
        : '---';

      const nextArrivalIndicator = nextElement?.arrivalRouteExt
        ? `(${nextElement.arrivalRouteExt}) ${nextElement.stationName}`
        : `${currentElement.stationName}`;

      let stopStatusDescription = '',
        stopStatusIndicator = '';

      switch (status) {
        case StopStatus.ARRIVING:
          stopStatusIndicator = `${this.$t('timetables.from')}: ${prevDepartureIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-arriving', {
            prevStationName: prevElement?.stationName ?? '',
            prevDepartureLine: prevElement?.departureRouteExt ?? ''
          });
          break;

        case StopStatus.ONLINE:
        case StopStatus.STOPPED:
          stopStatusIndicator = nextElement?.arrivalRouteExt
            ? `${this.$t('timetables.to')}: ${nextArrivalIndicator}`
            : `${this.$t('timetables.desc-end')}`;
          stopStatusDescription = nextElement?.arrivalRouteExt
            ? this.$t(`timetables.desc-${status}`, {
                nextStationName: nextElement?.stationName,
                nextArrivalLine: nextElement?.arrivalRouteExt
              })
            : '';
          break;

        case StopStatus.DEPARTED:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;

          if (!nextElement?.stationName) {
            stopStatusDescription = this.$t('timetables.desc-departed-ends', {
              nextStationName: currentElement.stationName
            });
          } else {
            stopStatusDescription = this.$t('timetables.desc-departed', {
              nextStationName: nextElement?.stationName ?? currentElement.stationName,
              nextArrivalLine: nextElement?.arrivalRouteExt
            });
          }

          break;

        case StopStatus.DEPARTED_AWAY:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-departed-away', {
            nextStationName: nextElement?.stationName,
            nextArrivalLine: nextElement?.arrivalRouteExt
          });
          break;

        case StopStatus.TERMINATED:
          stopStatusIndicator = `X ${this.$t('timetables.desc-terminated')}`;
          stopStatusDescription = this.$t('timetables.desc-terminated');
          break;

        default:
          break;
      }
      return {
        ...this.sceneryTimetableRow,
        stopStatusDescription,
        stopStatusIndicator
      };
    }
  }
});
</script>

<style lang="scss" scoped>
.general-status {
  margin-top: 0.5em;
  cursor: help;

  span.arriving {
    color: #ccc;
  }

  span.departed {
    color: lime;
    font-weight: bold;

    &-away {
      font-weight: bold;
      color: #5ecc5e;
    }
  }

  span.stopped {
    color: #ffa600;
    font-weight: bold;
  }

  span.online {
    color: gold;
  }

  span.terminated {
    color: salmon;
    font-weight: bold;
  }
}
</style>
