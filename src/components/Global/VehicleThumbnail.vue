<template>
  <div class="vehicle-thumbnail" :data-load-status="imgStatus">
    <img
      ref="imgRef"
      :src="`https://static.spythere.eu/thumbnails/v2/${imgName}.png`"
      height="60"
      loading="lazy"
      data-tooltip-type="VehiclePreviewTooltip"
      :data-tooltip-content="vehicleName"
      @error="onImageError"
      @load="onImageLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

const props = defineProps({
  vehicleName: { type: String, required: true },
  imgName: { type: String, required: true },
  fallbackName: { type: String, required: true },
  placeholderName: String
});

const imgRef = ref(null) as Ref<HTMLElement | null>;

const imgStatus = ref('loading');

function onImageError(event: Event) {
  (event.target as HTMLImageElement).src = `/images/${props.fallbackName}.png`;
  imgStatus.value = 'error';
}

function onImageLoad() {
  if (imgStatus.value != 'error') {
    imgStatus.value = 'loaded';
  }

  if (imgRef.value) imgRef.value.style.opacity = '1';
}
</script>

<style lang="scss" scoped>
.vehicle-thumbnail {
  position: relative;

  &[data-load-status='loading'] {
    min-height: 60px;
    min-width: 200px;
  }
}

img {
  opacity: 0;
  transition: opacity 100ms ease-in-out;
}
</style>
