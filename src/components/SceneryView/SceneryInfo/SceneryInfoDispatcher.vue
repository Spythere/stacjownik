<template>
  <section class="info-dispatcher">
    <div class="dispatcher" v-if="station.onlineInfo">
      <span class="dispatcher_level" :style="calculateExpStyle(station.onlineInfo.dispatcherExp)">
        {{ station.onlineInfo.dispatcherExp > 1 ? station.onlineInfo.dispatcherExp : 'L' }}
      </span>

      <router-link
        class="dispatcher_name"
        :to="`/journal/dispatchers?dispatcherName=${station.onlineInfo.dispatcherName}`"
      >
        {{ station.onlineInfo.dispatcherName }}
      </router-link>

      <span class="dispatcher_likes text--primary">
        <img :src="getIcon('like')" alt="icon-like" />
        <span>{{ station.onlineInfo?.dispatcherRate || '0' }}</span>
      </span>
    </div>

    <span class="status-badge" v-if="station.onlineInfo && onlineFrom > 0">
      OD {{ new Date(onlineFrom).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) }}
    </span>

    <span class="status-badge" v-if="station.onlineInfo" :class="station.onlineInfo.statusID">
      {{ $t(`status.${station.onlineInfo.statusID}`) }}
      {{ station.onlineInfo.statusID == 'online' ? timestampToString(station.onlineInfo.statusTimestamp) : '' }}
    </span>

    <span class="status-badge free" v-else>
      {{ $t('status.free') }}
    </span>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import imageMixin from '../../../mixins/imageMixin';
import routerMixin from '../../../mixins/routerMixin';
import styleMixin from '../../../mixins/styleMixin';
import Station from '../../../scripts/interfaces/Station';

export default defineComponent({
  mixins: [styleMixin, dateMixin, routerMixin, imageMixin],
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },

    onlineFrom: {
      type: Number,
      default: -1,
    },
  },
});
</script>

<style lang="scss" scoped>
.info-dispatcher {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;
  gap: 0.5em;

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
      cursor: pointer;
      margin-right: 0.25em;
    }

    &_likes {
      img {
        height: 0.7em;
        margin: 0 0.25em;
      }
    }
  }

  .status-badge {
    font-size: 1.25em;
    margin: 0.5em 0.25em;
  }
}
</style>
