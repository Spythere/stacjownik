<template>
  <div class="general-status">
    <span :class="scheduledTrain.stopStatus">
      <span v-if="scheduledTrain.stopStatus == 'arriving'">
        <span v-if="scheduledTrain.prevDepartureLine">({{ scheduledTrain.prevDepartureLine }})</span>
        {{ scheduledTrain.prevStationName }}
        &gt;<span v-if="scheduledTrain.nextArrivalLine"> ({{ scheduledTrain.nextArrivalLine }}) </span>
        {{ scheduledTrain.nextStationName || '---' }}
      </span>

      <span v-else-if="scheduledTrain.stopStatus == 'departed'">
        &gt;&gt; <span v-if="scheduledTrain.nextArrivalLine"> ({{ scheduledTrain.nextArrivalLine }}) </span>
        {{ scheduledTrain.nextStationName }}
      </span>

      <span v-else-if="scheduledTrain.stopStatus == 'departed-away'">
        &gt;&gt;&gt;
        <span v-if="scheduledTrain.nextArrivalLine"> ({{ scheduledTrain.nextArrivalLine }}) </span>
        {{ scheduledTrain.nextStationName }}
      </span>

      <span v-else-if="scheduledTrain.stopStatus == 'online'">
        &gt;
        <span v-if="scheduledTrain.nextArrivalLine">
          ({{ scheduledTrain.nextArrivalLine }}) {{ scheduledTrain.nextStationName }}
        </span>
        <span v-else-if="!scheduledTrain.nextStationName">{{ $t('timetables.end') }}</span>
        <span v-else>{{ scheduledTrain.nextStationName }}</span>
      </span>

      <span v-else-if="scheduledTrain.stopStatus == 'stopped'">
        &gt;
        <span v-if="scheduledTrain.nextArrivalLine"> ({{ scheduledTrain.nextArrivalLine }}) </span>
        {{ scheduledTrain.nextStationName }}
      </span>

      <span v-else-if="scheduledTrain.stopStatus == 'terminated'">X {{ $t('timetables.terminated') }}</span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ScheduledTrain from '../../scripts/interfaces/ScheduledTrain';

export default defineComponent({
  props: {
    scheduledTrain: {
      type: Object as PropType<ScheduledTrain>,
      required: true,
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
