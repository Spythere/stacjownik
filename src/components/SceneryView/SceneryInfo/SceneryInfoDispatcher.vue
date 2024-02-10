<template>
  <section class="info-dispatcher">
    <div class="dispatcher" v-if="onlineScenery && onlineScenery.dispatcherExp != -1">
      <span
        class="dispatcher_level"
        :style="calculateExpStyle(onlineScenery.dispatcherExp, onlineScenery.dispatcherIsSupporter)"
      >
        {{ onlineScenery.dispatcherExp > 1 ? onlineScenery.dispatcherExp : 'L' }}
      </span>

      <router-link
        class="dispatcher_name"
        :to="`/journal/dispatchers?search-dispatcher=${onlineScenery.dispatcherName}`"
      >
        <span
          class="text--donator"
          v-if="isDonator(onlineScenery.dispatcherName)"
          :title="$t('donations.dispatcher-message')"
        >
          {{ onlineScenery.dispatcherName }}
        </span>
        <span v-else>{{ onlineScenery.dispatcherName }}</span>
      </router-link>

      <span class="dispatcher_likes text--primary">
        <img src="/images/icon-like.svg" alt="Likes count icon" />
        <span>{{ onlineScenery?.dispatcherRate || '0' }}</span>
      </span>
    </div>

    <StationStatusBadge
      :isOnline="onlineScenery ? true : false"
      :dispatcherStatus="onlineScenery?.dispatcherStatus"
      :dispatcherTimestamp="onlineScenery?.dispatcherTimestamp"
    />
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import dateMixin from '../../../mixins/dateMixin';
import routerMixin from '../../../mixins/routerMixin';
import styleMixin from '../../../mixins/styleMixin';
import StationStatusBadge from '../../Global/StationStatusBadge.vue';
import { ActiveScenery } from '../../../store/typings';
import donatorMixin from '../../../mixins/donatorMixin';

export default defineComponent({
  mixins: [styleMixin, dateMixin, routerMixin, donatorMixin],
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
