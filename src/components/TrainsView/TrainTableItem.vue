<template>
  <li class="train-item">
    <router-link class="a-block" :to="train.driverRouteLocation">
      <div class="item-wrapper">
        <TrainInfo :train="train" />

        <div class="train-stats">
          <StockList :trainStockList="train.stockList" :tractionOnly="true" />

          <div>
            <span>{{ train.speed }}km/h</span>

            <div>
              <span> {{ train.length }}m</span>
              &bull;
              <span> {{ (train.mass / 1000).toFixed(1) }}t</span>
              <span v-if="train.stockList.length > 1">
                &bull;
                {{ $t('trains.cars') }}: {{ train.stockList.length - 1 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </router-link>
  </li>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { Train } from '../../typings/common';
import TrainInfo from './TrainInfo.vue';
import StockList from '../Global/StockList.vue';

defineProps({
  train: {
    type: Object as PropType<Train>,
    required: true
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.train-item {
  background-color: #1a1a1a;
  margin-bottom: 1em;
  width: 100%;
  padding: 1em;
}

.item-wrapper {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;
}

.train-stats {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;
  text-align: center;

  line-height: 1.5em;
}

@include smallScreen() {
  .item-wrapper {
    grid-template-columns: 1fr;
    gap: 1em 0;
  }
}
</style>
