<template>
  <div class="driver-train-card">
    <TrainInfo :train="chosenTrain" :extended="true" />

    <!-- Train action buttons -->
    <div class="train-stock-actions">
      <button class="btn btn--action" @click="toggleNumberPropositions()">
        <i class="fa-regular fa-lightbulb"></i> {{ i18n.t('helper.button-show') }}
      </button>

      <button class="btn btn--action" @click="toggleNumberPropositions()">
        <i class="fa-regular fa-calendar"></i> {{ i18n.t('driver.details.button-show') }}
      </button>
    </div>

    <!-- Proposed numbers container -->
    <transition name="view-anim">
      <DriverHelper :chosenTrain="chosenTrain" v-if="arePropositionsVisible" />
    </transition>

    <transition name="view-anim">
      <DriverTimetableDetails :chosenTrain="chosenTrain" />
    </transition>

    <StockList :trainStockList="chosenTrain.stockList" :key="chosenTrain.id" :showPreviews="true" />
    <DriverTrainSchedule :train="chosenTrain" />
  </div>
</template>

<script setup lang="ts">
import { Train } from '@/typings/common';
import { ref, PropType } from 'vue';
import { useI18n } from 'vue-i18n';

import DriverHelper from './DriverHelper.vue';
import StockList from '../Global/StockList.vue';
import DriverTrainSchedule from './DriverTrainSchedule.vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';
import DriverTimetableDetails from './DriverTimetableDetails.vue';

const i18n = useI18n();

const arePropositionsVisible = ref(false);

const props = defineProps({
  chosenTrain: {
    type: Object as PropType<Train>,
    required: true
  }
});

function toggleNumberPropositions() {
  arePropositionsVisible.value = !arePropositionsVisible.value;
}
</script>

<style lang="scss" scoped>
.driver-train-card {
  padding: 1em;
  background-color: var(--clr-view-bg);
  border-radius: 0 0 0.5em 0.5em;
}

.train-stock-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 1em 0;
}
</style>
