<template>
  <section class="info-dispatcher">
    <div class="dispatcher" v-if="station.onlineInfo">
      <span
        class="dispatcher_level"
        :style="calculateExpStyle(station.onlineInfo.dispatcherExp)"
      >
        {{ station.onlineInfo.dispatcherExp > 1 ? station.onlineInfo.dispatcherExp : 'L' }}
      </span>

      <span class="dispatcher_name">{{ station.onlineInfo.dispatcherName }}</span>
    </div>

    <span class="status-badge" v-if="station.onlineInfo && onlineFrom > 0">
      OD {{ new Date(onlineFrom).toLocaleTimeString('pl-PL', { hour: "2-digit", minute: "2-digit" }) }}
    </span>

    <span class="status-badge" v-if="station.onlineInfo" :class="station.onlineInfo.statusID">
      {{ $t(`status.${station.onlineInfo.statusID}`) }}
      {{ station.onlineInfo.statusID == 'online' ?  timestampToString(station.onlineInfo.statusTimestamp) : '' }}
    </span>

    <span class="status-badge free" v-else>
      {{ $t('status.free') }}
    </span>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import styleMixin from '@/mixins/styleMixin';
import Station from '@/scripts/interfaces/Station';
import dateMixin from '@/mixins/dateMixin';

export default defineComponent({
  mixins: [styleMixin, dateMixin ],
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },

    onlineFrom: {
      type: Number,
      default: -1
    }
  },


  data: () => ({
    icons: {
      spawn: require('@/assets/icon-spawn.svg'),
    }
  }),
});
</script>

<style lang="scss" scoped>
.info-dispatcher {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;

  .dispatcher {
    font-size: 2em;

    &_level {
      display: inline-block;
      margin-right: 0.3em;
      background: firebrick;

      border-radius: 0.1em;

      width: 1.5em;
      height: 1.5em;
      line-height: 1.5em;
      font-weight: bold;
    }

    &_name {
      margin-right: 1em;
    }
  }

  .status-badge {
    font-size: 1.2em;
    margin: 0.5em 0.25em;
  }
}
</style>
