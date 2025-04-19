<template>
  <section class="driver-view">
    <div class="view-wrapper">
      <div v-if="chosenTrain">
        <DriverTopActions :chosenTrain="chosenTrain" />
        <DriverTrainCard :chosenTrain="chosenTrain" />
      </div>

      <Loading v-else-if="apiStore.dataStatuses.connection == Status.Data.Loading" />

      <DriverNotFound v-else />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Loading from '../components/Global/Loading.vue';
import { useMainStore } from '../store/mainStore';
import { useApiStore } from '../store/apiStore';
import { Status } from '../typings/common';

import DriverTopActions from '../components/DriverView/DriverTopActions.vue';
import DriverTrainCard from '../components/DriverView/DriverTrainCard.vue';
import DriverNotFound from '../components/DriverView/DriverNotFound.vue';

const props = defineProps({
  trainId: {
    type: String
  },

  modalId: {
    type: String
  }
});

const mainStore = useMainStore();
const apiStore = useApiStore();

const chosenTrain = computed(() =>
  mainStore.trainList.find((train) => train.id == props.trainId || train.modalId == props.modalId)
);
</script>

<style lang="scss" scoped>
.driver-view {
  margin: 0 auto;
  padding: 1em 0;
  max-width: var(--max-container-width);
  min-height: calc(100vh - 7em);
}
</style>
