<template>
  <section class="driver-view">
    <div class="content">
      <div v-if="chosenTrain">
        <TrainInfo :train="chosenTrain" :extended="true" ref="trainInfo" />
        <TrainSchedule :train="chosenTrain" tabindex="0" />
      </div>

      <Loading v-else-if="apiStore.dataStatuses.connection == Status.Data.Loading" />

      <div v-else>Ups! Nie ma takiego pociągu</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TrainInfo from '../components/TrainsView/TrainInfo.vue';
import TrainSchedule from '../components/TrainsView/TrainSchedule.vue';
import Loading from '../components/Global/Loading.vue';
import { useMainStore } from '../store/mainStore';
import { useApiStore } from '../store/apiStore';
import { Status } from '../typings/common';

const props = defineProps({
  trainId: {
    required: true
  }
});

const mainStore = useMainStore();
const apiStore = useApiStore();
const chosenTrain = computed(() => mainStore.trainList.find((train) => train.id == props.trainId));
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.driver-view {
  padding: 1em 0;
}

.content {
  background-color: #1a1a1a;
}
</style>
