<template>
  <div class="tooltip-content">
    <div class="image-box">
      <Loading v-if="imageState == 'loading'" class="loading-info" />

      <img
        v-if="tooltipStore.type"
        @load="onImageLoad"
        @error="onImageError"
        width="300"
        height="176"
        :src="`https://stacjownik.spythere.eu/static/images/${vehicleName}--300px.jpg`"
      />
    </div>

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
import Loading from '../Global/Loading.vue';

export default defineComponent({
  components: { Loading },

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
      if (!e.target || !(e.target instanceof HTMLImageElement) || this.imageState == 'error')
        return;

      this.imageState = 'error';

      e.target.src = '/images/no-vehicle-image.png';
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

.image-box {
  position: relative;
  min-height: 170px;
}

.loading-info {
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(-50%, -50%);
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
