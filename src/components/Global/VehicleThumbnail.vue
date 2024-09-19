<template>
  <div class="vehicle-thumbnail" :data-load-status="imgStatus" ref="thumbRef">
    <div class="stock-text">
      <div>{{ vehicleName }}</div>
      <small v-if="vehicleCargo">({{ vehicleCargo }})</small>
    </div>

    <div class="stock-images">
      <img
        v-for="(thumbnailImage, imageIndex) in images"
        :src="`https://static.spythere.eu/thumbnails/v2/${thumbnailImage}.png`"
        height="60"
        loading="lazy"
        data-tooltip-type="VehiclePreviewTooltip"
        :data-tooltip-content="vehicleString"
        @error="onImageError($event, imageFallbacks[imageIndex])"
        @load="onImageLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType, Ref, ref } from 'vue';

const props = defineProps({
  vehicleString: { type: String, required: true },
  images: { type: Object as PropType<string[]>, required: true },
  imageFallbacks: { type: Object as PropType<string[]>, required: true }
});

const thumbRef = ref(null) as Ref<HTMLElement | null>;
const imgStatus = ref('loading');

const vehicleName = computed(() => props.vehicleString.split(':')[0].replace(/_/g, ' '));
const vehicleCargo = computed(() => props.vehicleString.split(':')[1]);

function onImageError(event: Event, fallbackImage: string) {
  (event.target as HTMLImageElement).src = `/images/${fallbackImage}.png`;
  imgStatus.value = 'error';
}

function onImageLoad() {
  if (imgStatus.value != 'error') {
    imgStatus.value = 'loaded';
  }

  if (thumbRef.value) thumbRef.value.style.opacity = '1';
}
</script>

<style lang="scss" scoped>
.vehicle-thumbnail {
  
  position: relative;
  opacity: 0;
  transition: opacity 100ms ease-in-out;

  &[data-load-status='loading'] {
    min-height: 60px;
    min-width: 200px;
  }
}

.stock-text {
  text-align: center;
  color: #aaa;
  font-size: 0.9em;
  margin-bottom: 0.25em;
  padding: 0.25em 0;
}

.stock-images {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  cursor: crosshair;

  padding: 0.5em 0;
}
</style>
