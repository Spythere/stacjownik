<template>
  <span class="stop-label" :data-sbl="stop.isSBL">
    <span class="name" v-html="stop.nameHtml"></span>

    <span
      class="date arrival"
      v-if="stop.position != 'begin'"
      :class="{
        delayed: stop.arrivalDelay > 0 && stop.status != 'unconfirmed',
        preponed: stop.arrivalDelay < 0 && stop.status != 'unconfirmed',
        'on-time': stop.arrivalDelay == 0 && stop.status == 'confirmed'
      }"
    >
      <span v-if="stop.arrivalDelay != 0 && stop.status != 'unconfirmed'">
        <s>{{ timestampToString(stop.arrivalScheduled) }}</s>
        {{ timestampToString(stop.arrivalReal) }}
        ({{ stop.arrivalDelay > 0 ? '+' : '' }}{{ stop.arrivalDelay }})
      </span>

      <span v-else>
        {{ timestampToString(stop.arrivalScheduled) }}
      </span>
    </span>

    <span
      class="date stop"
      v-if="stop.duration || stop.status == 'stopped'"
      :class="stop.type.replace(', ', '-')"
    >
      {{ stop.duration }} {{ stop.type == '' ? 'pt' : stop.type }}
    </span>

    <span
      class="date departure"
      v-if="stop.position != 'end' && (stop.duration != 0 || stop.status == 'stopped')"
      :class="{
        delayed: stop.departureDelay > 0 && stop.status == 'confirmed',
        preponed: stop.departureDelay < 0 && stop.status == 'confirmed'
      }"
    >
      <span v-if="stop.departureDelay != 0 && stop.status == 'confirmed'">
        <s>{{ timestampToString(stop.departureScheduled) }}</s>
        {{ timestampToString(stop.departureReal) }}

        ({{ stop.departureDelay > 0 ? '+' : '' }}{{ stop.departureDelay }})
      </span>

      <span v-else>
        {{ timestampToString(stop.departureScheduled) }}
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { TrainScheduleStop } from './TrainSchedule.vue';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    stop: {
      type: Object as PropType<TrainScheduleStop>,
      required: true
    }
  }
});
</script>

<style lang="scss" scoped>
$preponedClr: lime;
$delayedClr: salmon;
$dateClr: #525151;
$stopExchangeClr: #db8e29;
$stopDefaultClr: #252525;
$stopNameClr: #22a8d1;

.stop-label {
  &[data-sbl='true'] {
    .date {
      display: none;
    }

    .name {
      background: none;
      color: #aaa;
      padding: 0;
    }
  }

  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .name {
    background: $stopNameClr;
    padding: 0.3em 0.5em;

    display: flex;
    align-items: center;

    &.misc {
      background: gray;
    }
  }

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
