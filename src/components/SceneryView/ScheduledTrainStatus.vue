<template>
  <div class="general-status">
    <span :class="computedScheduledTrain.stopStatus" :title="computedScheduledTrain.stopStatusDescription">
      {{ computedScheduledTrain.stopStatusIndicator }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ScheduledTrain, StopStatus } from '../../scripts/interfaces/ScheduledTrain';

interface ScheduledTrainComp extends ScheduledTrain {
  stopStatusIndicator: string;
  stopStatusDescription: string;
}

export default defineComponent({
  props: {
    scheduledTrain: {
      type: Object as PropType<ScheduledTrain>,
      required: true,
    },
  },

  computed: {
    computedScheduledTrain(): ScheduledTrainComp {
      const { prevDepartureLine, prevStationName, stopStatus, nextArrivalLine, nextStationName } = this.scheduledTrain;

      const prevDepartureIndicator = prevDepartureLine ? `(${prevDepartureLine}) ${prevStationName}` : '---';
      const nextArrivalIndicator = nextArrivalLine ? `(${nextArrivalLine}) ${nextStationName}` : '---';

      let stopStatusDescription = '',
        stopStatusIndicator = '';

      switch (stopStatus) {
        case StopStatus.arriving:
          stopStatusIndicator = `${this.$t('timetables.from')}: ${prevDepartureIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-arriving', { prevStationName, prevDepartureLine });
          break;

        case StopStatus.online:
        case StopStatus.stopped:
          stopStatusIndicator = nextArrivalLine
            ? `${this.$t('timetables.to')}: ${nextArrivalIndicator}`
            : `${this.$t('timetables.desc-end')}`;
          stopStatusDescription = nextArrivalLine
            ? this.$t(`timetables.desc-${stopStatus}`, { nextStationName, nextArrivalLine })
            : '';
          break;

        case StopStatus.departed:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-departed', { nextStationName, nextArrivalLine });
          break;

        case StopStatus['departed-away']:
          stopStatusIndicator = `${this.$t('timetables.to')}: ${nextArrivalIndicator}`;
          stopStatusDescription = this.$t('timetables.desc-departed-away', { nextStationName, nextArrivalLine });
          break;

        case StopStatus.terminated:
          stopStatusIndicator = `X ${this.$t('timetables.desc-terminated')}`;
          stopStatusDescription = this.$t('timetables.desc-terminated');
          break;

        default:
          break;
      }
      return {
        ...this.scheduledTrain,
        stopStatusDescription,
        stopStatusIndicator,
      };
    },
  },
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

