<template>
    <div class="driver-train-card">
        <TrainInfo :train="chosenTrain" :extended="true" />

        <!-- Train action buttons -->
        <div class="train-stock-actions">
            <button class="btn btn--action" style="margin: 1em 0" @click="copyStockToClipboard()">
                <i class="fa-regular fa-copy"></i> {{ i18n.t('trains.stock-copy') }}
            </button>

            <button class="btn btn--action" style="margin: 1em 0" @click="showNumberPropositions()">
                <i class="fa-regular fa-lightbulb"></i> {{ i18n.t('trains.number-propositions') }}
            </button>
        </div>

        <StockList :trainStockList="chosenTrain.stockList" />
        <TrainSchedule :train="chosenTrain" />
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Train } from '../../typings/common';
import { useI18n } from 'vue-i18n';

import StockList from '../Global/StockList.vue';
import TrainSchedule from '../TrainsView/TrainSchedule.vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';

const i18n = useI18n();

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

function showNumberPropositions() {

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