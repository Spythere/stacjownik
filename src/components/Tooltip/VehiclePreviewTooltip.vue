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

    <div class="vehicle-props" v-if="vehicleData">
      {{ vehicleData.group.speed }}km/h &bull; {{ vehicleData.group.length }}m &bull;
      {{ (vehicleData.group.weight / 1000).toFixed(1) }}t
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
    vehicleName(prev, val) {
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

    vehicleData() {
      return this.apiStore.vehiclesData?.find((v) => v.name == this.vehicleName);
    },

    vehicleCargo() {
      const x = this.vehicleData?.group.cargoTypes?.find(
        (c) => c.id == this.tooltipStore.content.split(':')[1]
      );
      console.log(this.vehicleData, x);

      return x;
    }
  }
});
</script>

<style lang="scss" scoped>
.tooltip-content {
  width: 300px;
  min-height: 200px;
  background-color: #1f1f1f;
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
