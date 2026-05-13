<template>
  <div class="scenery-info">
    <router-link class="scenery-link" :to="`/scenery?station=${sceneryName}`">
      {{ sceneryName }}
    </router-link>

    <span v-if="activeScenery">
      &bull;
      {{ activeScenery.dispatcherName }} ({{
        activeScenery.dispatcherExp > 1 ? activeScenery.dispatcherExp : 'L'
      }}) &bull;
      <span
        v-if="activeScenery.lastSeen >= Date.now() - 60000 || activeScenery.isOnline"
        class="online-status"
        :data-status="getDispatcherStatusId(activeScenery?.dispatcherStatus)"
      >
        {{
          t(`status.${getDispatcherStatusId(activeScenery.dispatcherStatus)}`, [
            timestampToTimeString(activeScenery.dispatcherStatus)
          ]).toLowerCase()
        }}
      </span>

      <span v-else class="offline-since-status">
        {{ t('status.offline-since', [humanizeDuration(Date.now() - activeScenery.lastSeen)]) }}
      </span>
    </span>

    <span v-else class="offline-status"> &bull; offline</span>
  </div>
</template>

<script lang="ts" setup>
import { getDispatcherStatusId } from '@/composables/dispatcher';
import { humanizeDuration, timestampToTimeString } from '@/composables/time';
import { useApiStore } from '@/store/apiStore';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  sceneryName: {
    type: String,
    required: true
  }
});

const { activeData } = useApiStore();
const { t } = useI18n();

const activeScenery = computed(() => {
  return activeData?.activeSceneries
    ?.filter((sc) => sc.stationName == props.sceneryName)
    .sort((s1, s2) => s2.lastSeen - s1.lastSeen)[0];
});
</script>

<style lang="scss" scoped>
.online-status {
  color: lightgreen;

  &[data-status='unavailable'] {
    color: lightsalmon;
  }

  &[data-status='not-signed'] {
    color: lightsalmon;
  }

  &[data-status='no-limit'] {
    color: lightblue;
  }
}

.offline-since-status {
  color: lightcoral;
}

.offline-status {
  color: #ccc;
}

.scenery-link {
  color: white;
}
</style>
