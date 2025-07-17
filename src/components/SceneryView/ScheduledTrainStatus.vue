<template>
  <div class="general-status">
    <router-link
      :to="`/scenery?station=${computedScheduledTrain.stationNameHref}`"
      :class="computedScheduledTrain.status"
      v-html="computedScheduledTrain.stopStatusIndicator"
    >
    </router-link>
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
      let stationNameHref = '';

      switch (status) {
        case StopStatus.ARRIVING:
          if (prevElement) {
            stopStatusIndicator = this.$t('timetables.desc-arriving', {
              prevStationName: prevElement?.stationName ?? '',
              prevDepartureLine: prevElement?.departureRouteExt ?? ''
            });

            stationNameHref = prevElement?.stationName ?? '';
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
            : this.$t(`timetables.desc-end`);

          stationNameHref = nextElement?.stationName ?? '';

          break;

        case StopStatus.DEPARTED:
          if (!nextElement?.stationName) {
            stopStatusIndicator = this.$t('timetables.desc-departed-ends', {
              nextStationName: currentElement.stationName
            });

            stationNameHref = nextElement?.stationName ?? '';
          } else {
            stopStatusIndicator = this.$t('timetables.desc-departed', {
              nextStationName: nextElement?.stationName ?? currentElement.stationName,
              nextArrivalLine: nextElement?.arrivalRouteExt
            });

            stationNameHref = nextElement?.stationName ?? '';
          }

          break;

        case StopStatus.DEPARTED_AWAY:
          stopStatusIndicator = this.$t('timetables.desc-departed-away', {
            nextStationName: nextElement?.stationName,
            nextArrivalLine: nextElement?.arrivalRouteExt
          });

          stationNameHref = nextElement?.stationName ?? '';
          break;

        case StopStatus.TERMINATED:
          stopStatusIndicator = this.$t('timetables.desc-terminated');
          break;

        default:
          break;
      }
      return {
        ...this.sceneryTimetableRow,
        stationNameHref,
        stopStatusIndicator
      };
    }
  },

  methods: {
    navigateToScenery(sceneryName?: string) {
      if (!sceneryName) return;

      this.$router.push(`/scenery?station=${sceneryName}`);
    }
  }
});
</script>

<style lang="scss" scoped>
.general-status {
  margin-top: 0.5em;

  & > .arriving {
    color: #ccc;
  }

  & > .departed {
    color: lime;

    &-away {
      color: #5ecc5e;
    }
  }

  & > .stopped {
    color: #ffa600;
  }

  & > .online {
    color: gold;
  }

  & > .terminated {
    color: salmon;
  }
}
</style>
