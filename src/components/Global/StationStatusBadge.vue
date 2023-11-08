<template>
  <span class="status-badge" :class="statusName" v-if="isOnline">
    {{ $t(`status.${statusName}`) }}
    {{
      statusName == 'online' && dispatcherStatus && dispatcherStatus > 5
        ? timestampToString(dispatcherStatus)
        : ''
    }}
  </span>

  <span class="status-badge free" v-else>
    {{ $t('status.free') }}
  </span>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { DispatcherStatus } from '../../scripts/enums/DispatcherStatus';

export default defineComponent({
  props: {
    dispatcherStatus: {
      type: Number as PropType<DispatcherStatus | number>
    },
    isOnline: {
      type: Boolean
    }
  },
  mixins: [dateMixin],

  computed: {
    statusName() {
      if (!this.dispatcherStatus) return 'free';

      switch (this.dispatcherStatus) {
        case DispatcherStatus.AFK:
          return 'afk';

        case DispatcherStatus.ENDING:
          return 'ending';

        case DispatcherStatus.INVALID:
          return 'invalid';

        case DispatcherStatus.NOT_LOGGED_IN:
          return 'not-signed';

        case DispatcherStatus.NO_SPACE:
          return 'no-space';

        case DispatcherStatus.UNAVAILABLE:
          return 'unavailable';

        case DispatcherStatus.UNKNOWN:
          return 'unknown';

        default:
          if (this.dispatcherStatus >= Date.now() + 25500000) return 'no-limit';
          return 'online';
      }
    }
  }
});
</script>

<style lang="scss" scoped>
$free: #8a8a8a;
$ending: #e6c300;
$no-limit: #117fc9;
$unav: #ff3d5d;
$afk: #e6a100;
$no-space: #222;
$online: #09a116;
$unknown: #b93c3c;

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

  &.afk {
    background-color: $afk;
    color: black;
    font-size: 0.95em;
  }

  &.no-space {
    background-color: $no-space;
    border: 1px solid white;
    color: white;
    font-size: 0.85em;
  }

  &.unknown,
  &.invalid {
    background-color: $unknown;
    font-size: 0.95em;
  }
}
</style>
