<template>
  <span class="status-badge" :class="statusID" v-if="isOnline">
    {{ $t(`status.${statusID}`) }}
    {{ statusID == 'online' ? timestampToString(statusTimestamp!) : '' }}
  </span>

  <span class="status-badge free" v-else>
    {{ $t('status.free') }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';

export default defineComponent({
  props: {
    statusID: {
      type: String,
    },
    statusTimestamp: {
      type: Number,
    },
    isOnline: {
      type: Boolean,
    },
  },
  mixins: [dateMixin],
});
</script>

<style lang="scss" scoped>
$free: #8a8a8a;
$ending: #e6c300;
$no-limit: #117fc9;
$unav: #ff3d5d;
$brb: #e6a100;
$no-space: #222;
$online: #09a116;
$unknown: rgb(185, 60, 60);

.status-badge {
  border-radius: 1rem;
  font-weight: 500;

  padding: 0.2em 0.55em;

  background-color: $online;

  &.free {
    background-color: $free;
    font-size: 0.95em;
  }

  &.ending {
    background-color: $ending;
    color: black;
    font-size: 0.9em;
  }

  &.no-limit {
    background-color: $no-limit;
    font-size: 0.85em;
  }

  &.not-signed,
  &.unavailable {
    background-color: $unav;
    font-size: 0.85em;
  }

  &.brb {
    background-color: $brb;
    color: black;
    font-size: 0.95em;
  }

  &.no-space {
    background-color: $no-space;
    border: 1px solid white;
    color: white;
    font-size: 0.85em;
  }

  &.unknown {
    background-color: $unknown;
    font-size: 0.95em;
  }
}
</style>
