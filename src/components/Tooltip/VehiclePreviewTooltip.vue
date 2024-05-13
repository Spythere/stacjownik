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
      :src="`https://static.spythere.eu/images/${tooltipStore.content}--300px.jpg`"
    />

    <div v-if="imageState == 'error'" class="error-placeholder"></div>

    <div class="vehicle-name">
      {{ tooltipStore.content.replace(/_/g, ' ') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';

export default defineComponent({
  data() {
    return {
      tooltipStore: useTooltipStore(),
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
  color: #ccc;
  text-wrap: wrap;
}

.error-placeholder {
  height: 176px;
}
</style>
