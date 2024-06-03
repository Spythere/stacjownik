<template>
  <div class="tooltip-content">
    <div v-if="imageState == 'loading'" class="loading-info">
      {{ $t('vehicle-preview.loading') }}
    </div>

    <div v-if="imageState == 'error'">{{ $t('vehicle-preview.error') }}</div>

    <img
      v-if="tooltipStore.type"
      @load="onImageLoad"
      @error="onImageError"
      width="300"
      height="176"
      class="rounded-md w-full h-auto"
      :src="`https://static.spythere.eu/images/${vehicleName}--300px.jpg`"
    />

    <div v-if="imageState == 'error'" class="error-placeholder"></div>

    <div class="vehicle-name">
      {{ vehicleName.replace(/_/g, ' ') }}
      <span v-if="vehicleCargo">({{ vehicleCargo.id }})</span>
    </div>

    <div class="vehicle-props" v-if="vehicleProps">
      {{ vehicleProps.speed }}km/h &bull; {{ vehicleProps.length }}m &bull;
      {{ (vehicleProps.weight / 1000).toFixed(1) }}t
      <span v-if="vehicleCargo">(+{{ (vehicleCargo.weight / 1000).toFixed(1) }}t)</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  data() {
    return {
      tooltipStore: useTooltipStore(),
      apiStore: useApiStore(),
      imageState: 'loading'
    };
  },

  mounted() {
    this.imageState = 'loading';
  },

  watch: {
    'tooltipStore.type'(prev, val) {
      if (prev != val) this.imageState = 'loading';
    }
  },

  methods: {
    onImageLoad() {
      this.imageState = 'loaded';
    },

    onImageError(e: Event) {
      this.imageState = 'error';

      (e.target as HTMLElement).style.display = 'none';
    }
  },

  computed: {
    vehicleName() {
      return this.tooltipStore.content.split(':')[0];
    },

    vehicleCargo() {
      return this.vehicleProps?.cargoTypes?.find(
        (c) => c.id == this.tooltipStore.content.split(':')[1]
      );
    },

    vehicleProps() {
      const vehicleDataArray = this.apiStore.vehiclesData?.vehicleList.find(
        ([name]) => name === this.vehicleName
      );

      if (!vehicleDataArray) return null;

      return (
        this.apiStore.vehiclesData!.vehicleProps.find((v) => v.type == vehicleDataArray[1]) ?? null
      );
    }
  }
});
</script>

<style lang="scss" scoped>
.tooltip-content {
  width: 300px;
  min-height: 200px;
  background-color: #333;
  box-shadow: 0 0 10px 2px #aaa;

  padding: 0.5em;
  border-radius: 0.5em;
}

.loading-info {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

img {
  width: 100%;
  height: auto;
}

.vehicle-name {
  text-align: center;
  margin-top: 0.5em;
  text-wrap: wrap;
}

.vehicle-props {
  color: #ccc;
}

.error-placeholder {
  height: 176px;
}
</style>
