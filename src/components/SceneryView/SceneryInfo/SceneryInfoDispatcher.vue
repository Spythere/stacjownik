<template>
  <section class="info-dispatcher">
    <div class="info-top" v-if="onlineScenery && onlineScenery.dispatcherExp != -1">
      <span
        class="dispatcher-level"
        :style="calculateExpStyle(onlineScenery.dispatcherExp, onlineScenery.dispatcherIsSupporter)"
      >
        {{ onlineScenery.dispatcherExp > 1 ? onlineScenery.dispatcherExp : 'L' }}
      </span>

      <router-link
        class="dispatcher-name"
        :to="`/journal/dispatchers?search-dispatcher=${onlineScenery.dispatcherName}`"
      >
        <span
          class="text--donator"
          v-if="apiStore.donatorsData.includes(onlineScenery.dispatcherName)"
          :title="$t('donations.dispatcher-message')"
        >
          {{ onlineScenery.dispatcherName }}
        </span>
        <span v-else>{{ onlineScenery.dispatcherName }}</span>
      </router-link>
    </div>

    <div class="info-bottom">
      <span
        class="dispatcher-likes text--primary"
        v-if="onlineScenery && onlineScenery.dispatcherExp != -1"
      >
        <img src="/images/icon-like.svg" alt="Likes count icon" />
        <span>{{ onlineScenery?.dispatcherRate || '0' }}</span>
      </span>

      <span class="dispatcher-badge">
        <StationStatusBadge
          :isOnline="onlineScenery ? true : false"
          :dispatcherStatus="onlineScenery?.dispatcherStatus"
          :dispatcherTimestamp="onlineScenery?.dispatcherTimestamp"
        />
      </span>
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import routerMixin from '../../../mixins/routerMixin';
import styleMixin from '../../../mixins/styleMixin';
import StationStatusBadge from '../../Global/StationStatusBadge.vue';
import { ActiveScenery } from '../../../typings/common';
import { useApiStore } from '../../../store/apiStore';

export default defineComponent({
  mixins: [styleMixin, dateMixin, routerMixin],

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  props: {
    onlineScenery: {
      type: Object as PropType<ActiveScenery>,
      required: false
    }
  },
  components: { StationStatusBadge }
});
</script>

<style lang="scss" scoped>
.info-dispatcher {
  font-size: 1.8em;
}

.info-top {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
}

.info-bottom {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;

  margin-top: 0.5em;
}

.dispatcher-level {
  background: firebrick;

  border-radius: 0.1em;

  width: 1.5em;
  height: 1.5em;
  line-height: 1.5em;
  font-weight: bold;
}

.dispatcher-likes {
  display: flex;
  gap: 0.25em;

  img {
    width: 1em;
  }
}

.dispatcher-badge {
  font-size: 0.7em;
}
</style>
