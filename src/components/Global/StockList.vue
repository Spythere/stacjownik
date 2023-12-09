<template>
  <div class="stock-list">
    <ul>
      <li v-for="(stockName, i) in trainStockList" :key="i">
        <p>
          {{ stockName.split(':')[0].split('_').splice(0, 2).join(' ') }}
          {{ stockName.split(':')[1] }}
        </p>

        <span>
          <img
            :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockName.split(':')[0]}${
              /^EN/.test(stockName) ? 'rb' : ''
            }.png`"
            @error="onImageError($event, stockName)"
            width="400"
            height="60"
          />

          <img
            v-if="/^(EN|2EN)/.test(stockName)"
            :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockName.split(':')[0]}s.png`"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-s.png')
            "
          />

          <img
            class="train-thumbnail"
            v-if="/^EN71/.test(stockName)"
            :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockName.split(':')[0]}s.png`"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-s.png')
            "
          />

          <img
            class="train-thumbnail"
            v-if="/^(EN|2EN)/.test(stockName)"
            :src="`https://rj.td2.info.pl/dist/img/thumbnails/${stockName.split(':')[0]}ra.png`"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-ra.png')
            "
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { API } from '../../typings/api';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  props: {
    trainStockList: {
      type: Array as PropType<string[]>,
      required: true
    }
  },

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  methods: {
    onImageError(event: Event, stockName: string) {
      const fallbackName =
        Object.keys(this.apiStore.rollingStockData!.info).find((type) => {
          return this.apiStore.rollingStockData!.info[type as keyof API.RollingStock.Info].find(
            (v) => v[0] === stockName.split(':')[0]
          );
        }) || 'vehicle-unknown';

      (event.target as HTMLImageElement).src = `/images/icon-${fallbackName}.png`;
    }
  }
});
</script>

<style lang="scss" scoped>
.stock-list {
  display: flex;
  justify-content: center;
}

.stock-list ul {
  display: flex;
  align-items: flex-end;
  overflow: auto;
  margin: 0 auto;
  padding: 1em 0;
}

ul > li > span {
  display: flex;
  align-items: flex-end;
}

img {
  max-height: 60px;
  width: auto;
  height: auto;
}

p {
  text-align: center;
  color: #aaa;
  font-size: 0.9em;
  margin-bottom: 1em;
}
</style>
