<template>
  <div class="scenery-timetable-header">
    <h3>
      <img src="/images/icon-timetable.svg" alt="icon-timetable" />
      <span>{{ $t('scenery.timetables') }}</span>

      <span>
        <span class="text--primary">{{ onlineScenery?.scheduledTrainCount.all ?? 0 }}</span>
        <span> / </span>
        <span class="text--grayed">
          {{ onlineScenery?.scheduledTrainCount.confirmed ?? 0 }}
        </span>
      </span>
    </h3>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { Station, ActiveScenery } from '../../../typings/common';
import { useMainStore } from '../../../store/mainStore';

const props = defineProps({
  station: {
    type: Object as PropType<Station>
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  },

  chosenCheckpoint: {
    type: String,
    required: true
  }
});
</script>

<style lang="scss" scoped>
.scenery-timetable-header {
  background-color: #181818;
  padding: 0.5em;
}

h3 {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;

  gap: 0.5em;
  font-size: 1.3em;
}
</style>
