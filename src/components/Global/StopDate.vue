<template>
  <span class="stop-date">
    <span
      class="date arrival"
      v-if="!stop.beginsHere"
      :class="{
        delayed: stop.arrivalDelay > 0 && stop.confirmed,
        preponed: stop.arrivalDelay < 0 && stop.confirmed,
        'on-time': stop.arrivalDelay == 0 && stop.confirmed,
      }"
    >
      <span v-if="stop.arrivalDelay != 0 && stop.confirmed">
        <s>{{ timestampToString(stop.arrivalTimestamp) }}</s>
        {{ timestampToString(stop.arrivalRealTimestamp) }}
        ({{ stop.arrivalDelay > 0 ? '+' : '' }}{{ stop.arrivalDelay }})
      </span>

      <span v-else>
        {{ timestampToString(stop.arrivalTimestamp) }}
      </span>
    </span>

    <span class="date stop" v-if="stop.stopTime" :class="stop.stopType.replace(', ', '-')">
      {{ stop.stopTime }} {{ stop.stopType == '' ? 'pt' : stop.stopType }}
    </span>

    <span
      class="date departure"
      v-if="!stop.terminatesHere && stop.stopTime != 0"
      :class="{
        delayed: stop.departureDelay > 0 && stop.confirmed,
        preponed: stop.departureDelay < 0 && stop.confirmed,
      }"
    >
      <span v-if="stop.departureDelay != 0 && stop.confirmed">
        <s>{{ timestampToString(stop.departureTimestamp) }}</s>
        {{ timestampToString(stop.departureRealTimestamp) }}

        ({{ stop.departureDelay > 0 ? '+' : '' }}{{ stop.departureDelay }})
      </span>

      <span v-else>
        {{ timestampToString(stop.departureTimestamp) }}
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import dateMixin from '@/mixins/dateMixin';
import TrainStop from '@/scripts/interfaces/TrainStop';
import { defineComponent } from 'vue';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    stop: {
      type: Object as () => TrainStop,
      required: true,
    },
  },

  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
$preponedClr: lime;
$delayedClr: salmon;
$dateClr: #525151;
$stopExchangeClr: #db8e29;
$stopDefaultClr: #252525;

.stop-date {
  display: flex;
  align-items: center;

  .date {
    background: $dateClr;
    padding: 0.3em 0.5em;
  }

  .stop {
    &.ph,
    &.ph-pm,
    &.pm {
      background: $stopExchangeClr;
    }

    background: $stopDefaultClr;
  }

  .arrival,
  .departure {
    &.delayed {
      s {
        color: #999;
      }

      span {
        color: $delayedClr;
      }
    }

    &.preponed {
      s {
        color: #999;
      }

      span {
        color: $preponedClr;
      }
    }
  }
}
</style>
