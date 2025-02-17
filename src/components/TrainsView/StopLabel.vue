<template>
  <span
    class="stop-label"
    :data-minor="stop.isSBL || (stop.nameRaw.endsWith(', po') && !stop.duration)"
  >
    <router-link v-if="/(, podg$|<strong>)/.test(stop.nameHtml)" :to="sceneryHref">
      <b class="stop-name">
        {{ stop.nameRaw }}
      </b>
    </router-link>

    <span v-else class="stop-name">{{ stop.nameRaw }}</span>

    <span
      v-if="stop.position != 'begin'"
      class="date arrival"
      :data-status-delayed="stop.arrivalDelay > 0"
      :data-status-preponed="stop.arrivalDelay < 0"
      :data-status="stop.status"
    >
      p.
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
      v-if="stop.duration"
      class="date stop"
      :data-stop-types="stop.type.replace(', ', '-')"
      :data-stop-status="stop.departureDelay > 0 && !stop.duration ? 'delayed' : ''"
    >
      {{
        stop.duration == 0 && stop.departureDelay > 0
          ? stop.departureDelay - stop.arrivalDelay
          : stop.duration
      }}
      {{ stop.type == '' ? 'pt' : stop.type }}
    </span>

    <span
      v-if="
        stop.position != 'end' &&
        (stop.duration != 0 ||
          stop.position == 'begin' ||
          stop.status == 'stopped' ||
          stop.departureDelay != stop.arrivalDelay)
      "
      class="date departure"
      :data-status-delayed="stop.departureDelay > 0"
      :data-status-preponed="stop.departureDelay < 0"
      :data-status-confirmed="stop.status == 'confirmed'"
    >
      o.
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
import { PropType, defineComponent, stop } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { TrainSchedulePoint } from './typings';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    stop: {
      type: Object as PropType<TrainSchedulePoint>,
      required: true
    }
  },

  computed: {
    sceneryHref() {
      return `/scenery?station=${this.stop.sceneryName}&checkpoint=${this.stop.nameRaw}`;
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
$stopNameClr: #303030;

s {
  color: #ccc;
}

.stop-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .stop-name {
    background: $stopNameClr;
    border-radius: 0.5em 0 0 0.5em;
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

    &:last-child {
      border-radius: 0 0.5em 0.5em 0;
    }
  }

  &[data-minor='true'] {
    .date {
      display: none;
    }

    .stop-name {
      background: none;
      color: #aaa;
      padding: 0;
    }

    i {
      display: none;
    }
  }

  .stop {
    &[data-stop-types='ph'],
    &[data-stop-types='ph-pm'],
    &[data-stop-types='pm'] {
      background: $stopExchangeClr;
    }

    background: $stopDefaultClr;

    &[data-stop-status='delayed'] {
      color: $delayedClr;
    }
  }
}

.stop-label > a {
  z-index: 0;
}

.stop .arrival {
  &[data-status='confirmed'][data-status-delayed='true'] {
    span {
      color: $delayedClr;
    }
  }

  &[data-status='confirmed'][data-status-preponed='true'] {
    span {
      color: $preponedClr;
    }
  }

  &[data-status='stopped'][data-status-preponed='true'] {
    span {
      color: $preponedClr;
    }
  }

  &[data-status='stopped'][data-status-delayed='true'] {
    span {
      color: $delayedClr;
    }
  }
}

.stop .departure[data-status-confirmed='true'] {
  &[data-status-delayed='true'] {
    span {
      color: $delayedClr;
    }
  }

  &[data-status-preponed='true'] {
    span {
      color: $preponedClr;
    }
  }
}
</style>
