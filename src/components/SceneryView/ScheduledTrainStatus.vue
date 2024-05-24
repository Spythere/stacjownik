<template>
  <div class="general-status">
    <span
      :class="computedScheduledTrain.status"
      :title="computedScheduledTrain.stopStatusDescription"
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
      const { prevDepartureLine, prevStationName, nextArrivalLine, nextStationName, status } =
        this.sceneryTimetableRow;

      const prevDepartureIndicator = prevDepartureLine
        ? `(${prevDepartureLine}) ${prevStationName}`
        : '---';
      const nextArrivalIndicator = nextArrivalLine
        ? `(${nextArrivalLine}) ${nextStationName}`
        : '---';

      let stopStatusDescription = '',
        stopStatusIndicator = '';

      switch (status) {
        case StopStatus.ARRIVING:
          stopStatusIndicator = `${this.$t('timetables.from')}: ${prevDepartureIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-arriving', {
            prevStationName,
            prevDepartureLine
          });
          break;

        case StopStatus.ONLINE:
        case StopStatus.STOPPED:
          stopStatusIndicator = nextArrivalLine
            ? `${this.$t('timetables.to')}: ${nextArrivalIndicator}`
            : `${this.$t('timetables.desc-end')}`;
          stopStatusDescription = nextArrivalLine
            ? this.$t(`timetables.desc-${status}`, { nextStationName, nextArrivalLine })
            : '';
          break;

        case StopStatus.DEPARTED:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-departed', {
            nextStationName,
            nextArrivalLine
          });
          break;

        case StopStatus.DEPARTED_AWAY:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-departed-away', {
            nextStationName,
            nextArrivalLine
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
