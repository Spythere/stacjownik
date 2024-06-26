<template>
  <div class="stock-list">
    <div v-if="tractionOnly">
      <p>
        {{ computedStockList[0].split(':')[0].split('_').splice(0, 2).join(' ') }}
        {{ computedStockList[0].split(':')[1] }}
      </p>

      <img
        class="traction-only"
        :src="
          getVehicleThumbnailURL(
            computedStockList[0].split(':')[0],
            /^EN/.test(computedStockList[0]) ? 'rb' : ''
          )
        "
        @error="onImageError($event, computedStockList[0])"
        width="300"
        height="60"
      />
    </div>

    <ul v-else>
      <li v-for="(stockName, i) in computedStockList" :key="i">
        <p>
          {{ stockName.split(':')[0].split('_').splice(0, 3).join(' ') }}
          <div v-if="stockName.split(':')[1]">({{ stockName.split(':')[1] }})</div>
        </p>

        <span>
          <img
            :data-mouseover="stockName"
            data-tooltip-type="VehiclePreviewTooltip"
            :data-tooltip-content="stockName"
            :src="
              getVehicleThumbnailURL(stockName.split(':')[0], /^EN/.test(stockName) ? 'rb' : '')
            "
            @error="onImageError($event, stockName)"
            @click.stop="() => {}"
            width="400"
            height="60"
          />

          <!-- /// Manualne dodawanie miniaturek członów dla kibelków /// -->
          <img
            :data-mouseover="stockName"
            data-tooltip-type="VehiclePreviewTooltip"
            :data-tooltip-content="stockName.split(':')[0]"
            v-if="/^(EN|2EN)/.test(stockName)"
            :src="getVehicleThumbnailURL(stockName, 's')"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-s.png')
            "
            @click.stop="() => {}"
          />

          <img
            :data-mouseover="stockName"
            data-tooltip-type="VehiclePreviewTooltip"
            :data-tooltip-content="stockName.split(':')[0]"
            v-if="/^EN71/.test(stockName)"
            :src="getVehicleThumbnailURL(stockName, 's')"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-s.png')
            "
            @click.stop="() => {}"
          />

          <img
            :data-mouseover="stockName"
            data-tooltip-type="VehiclePreviewTooltip"
            :data-tooltip-content="stockName.split(':')[0]"
            v-if="/^(EN|2EN)/.test(stockName)"
            :src="getVehicleThumbnailURL(stockName, 'ra')"
            @error="
              (event) => ((event.target as HTMLImageElement).src = '/images/icon-loco-ezt-ra.png')
            "
            @click.stop="() => {}"
          />
          <!-- ///  -->
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  props: {
    trainStockList: {
      type: Array as PropType<string[]>,
      required: true
    },
    tractionOnly: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  computed: {
    computedStockList() {
      return this.tractionOnly ? this.trainStockList.slice(0, 1) : this.trainStockList;
    }
  },

  methods: {
    getVehicleThumbnailURL(locoType: string, suffix?: string) {
      return `https://static.spythere.eu/thumbnails/${locoType}${suffix}.png`;
    },

    onImageError(event: Event, stockName: string) {
      let fallbackName = '';

      const isLoco = /.-\d{3}/.test(stockName);

      if (isLoco) {
        if (/^\d?EN\d{2}/.test(stockName)) fallbackName = 'loco-ezt';
        else if (/^SN\d{2}/.test(stockName)) fallbackName = 'loco-szt';
        else if (/^\d{0,}?E/.test(stockName)) fallbackName = 'loco-e';
        else fallbackName = 'loco-s';
      } else {
        const isCarPassenger = /(\d{3}a|(Bau|Gor)\d{2}|304C)_/.test(stockName);

        fallbackName += 'car-';
        fallbackName += isCarPassenger ? 'passenger' : 'cargo';
      }

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
  cursor: crosshair;
}

img {
  max-height: 60px;
  width: auto;
  height: auto;
}

img.traction-only {
  max-width: 100%;
}

p {
  text-align: center;
  color: #aaa;
  font-size: 0.95em;
  margin-bottom: 1em;
}
</style>
