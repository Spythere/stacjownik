<template>
  <section class="info-dispatcher">
    <div class="info-top" v-if="onlineScenery && onlineScenery.dispatcherExp != -1">
      <LevelBadge
        badgeType="dispatcher"
        :level="onlineScenery.dispatcherExp"
        :isSupporter="onlineScenery.dispatcherIsSupporter"
      />

      <router-link class="dispatcher-name" :to="`/profile?playerId=${onlineScenery.dispatcherId}`">
        <span
          class="text--creator"
          v-if="isCreator(onlineScenery.dispatcherName)"
          :title="$t('donations.creator-message')"
        >
          {{ onlineScenery.dispatcherName }}
        </span>
        <span
          class="text--donator"
          v-else-if="apiStore.donatorsData.includes(onlineScenery.dispatcherName)"
          :title="$t('donations.dispatcher-message')"
        >
          {{ onlineScenery.dispatcherName }}
        </span>
        <span v-else>{{ onlineScenery.dispatcherName }}</span>
      </router-link>

      <FlagIcon :languageId="onlineScenery.dispatcherLanguageId" width="1.25em" />
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
import FlagIcon from '../../Global/FlagIcon.vue';
import { isCreator } from '../../../utils/userUtils';
import LevelBadge from '@/components/Global/LevelBadge.vue';

export default defineComponent({
  mixins: [styleMixin, dateMixin, routerMixin],
  components: { StationStatusBadge, FlagIcon, LevelBadge },

  data() {
    return {
      apiStore: useApiStore(),
      isCreator
    };
  },

  props: {
    onlineScenery: {
      type: Object as PropType<ActiveScenery>,
      required: false
    }
  }
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
