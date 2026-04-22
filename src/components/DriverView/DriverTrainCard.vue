<template>
  <div class="driver-train-card">
    <TrainInfo :train="chosenTrain" :extended="true" />

    <!-- Train action buttons -->
    <div class="train-stock-actions">
      <button class="btn btn--action" style="margin: 1em 0" @click="copyStockToClipboard()">
        <i class="fa-regular fa-copy"></i> {{ i18n.t('trains.stock-copy') }}
      </button>

      <button class="btn btn--action" style="margin: 1em 0" @click="toggleNumberPropositions()">
        <i class="fa-regular fa-lightbulb"></i> {{ i18n.t('trains.number-propositions') }}
      </button>
    </div>

    <!-- Proposed numbers container -->
    <transition name="view-anim">
      <DriverPropositions :chosenTrain="chosenTrain" v-if="arePropositionsVisible" />
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
import DriverPropositions from './DriverPropositions.vue';

const i18n = useI18n();

const arePropositionsVisible = ref(false);

const props = defineProps({
  chosenTrain: {
    type: Object as PropType<Train>,
    required: true
  }
});

function copyStockToClipboard() {
  const stockString = props.chosenTrain.stockList.join(';');

  if (!stockString) {
    alert(i18n.t('trains.stock-clipboard-failure'));
    return;
  }

  navigator.clipboard
    .writeText(stockString)
    .then(() => {
      prompt(i18n.t('trains.stock-clipboard-success'), stockString);
    })
    .catch(() => {
      alert(i18n.t('trains.stock-clipboard-failure'));
    });
}

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
  gap: 0.5em;
}
</style>
