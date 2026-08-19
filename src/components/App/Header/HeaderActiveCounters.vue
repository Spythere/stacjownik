<template>
  <div class="header-counters">
    <img src="/images/icon-dispatcher.svg" alt="icon dispatcher" />
    <span class="text--primary">{{ onlineDispatchersCount }}</span>

    <span class="text--grayed">&nbsp;</span>

    <img src="/images/icon-train.svg" alt="icon train" />
    <span class="text--primary">{{ onlineTrainsCount }}</span>

    <span class="text--grayed">&nbsp;</span>

    <img src="/images/icon-timetable.svg" alt="icon timetable" />
    <span class="text--primary">{{ onlineTimetablesCount }}</span>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '@/store/mainStore';
import { computed } from 'vue';

const store = useMainStore();

const onlineTrainsCount = computed(() => {
  return store.trainList.filter((train) => train.region == store.region.id).length;
});

const onlineTimetablesCount = computed(() => {
  return store.trainList.filter((train) => train.region == store.region.id && train.timetableData)
    .length;
});

const onlineDispatchersCount = computed(() => {
  return store.activeSceneryList.filter(
    (scenery) => scenery.region == store.region.id && scenery.dispatcherId != -1
  ).length;
});
</script>

<style lang="scss" scoped>
.header-counters {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.85em;

  span {
    margin: 0 0.15em;
  }

  img {
    width: 1.3em;
  }
}
</style>
