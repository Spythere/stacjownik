<template>
  <div class="driver-train-card">
    <TrainInfo :train="chosenTrain" :extended="true" />

    <!-- Train action buttons -->
    <div class="train-stock-actions">
      <button class="btn btn--action" @click="toggleNumberPropositions()">
        <i class="fa-regular fa-lightbulb"></i> {{ i18n.t('analysis.button-show') }}
      </button>
    </div>

    <!-- Proposed numbers container -->
    <transition name="view-anim">
      <DriverAnalysis :chosenTrain="chosenTrain" v-if="arePropositionsVisible" />
    </transition>

    <StockList :trainStockList="chosenTrain.stockList" :key="chosenTrain.id" :showPreviews="true" />
    <TrainSchedule :train="chosenTrain" />
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { Train } from '../../typings/common';
import { useI18n } from 'vue-i18n';

import StockList from '../Global/StockList.vue';
import TrainSchedule from '../TrainsView/TrainSchedule.vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';
import DriverAnalysis from './DriverAnalysis.vue';

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
