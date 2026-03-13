<template>
  <div class="filter-slider-container">
    <input
      class="slider"
      v-for="slider in sliderGroupsOptions[sliderGroup]"
      type="range"
      :name="slider.id"
      :id="slider.id"
      :min="slider.minRange"
      :max="slider.maxRange"
      :step="slider.step"
      v-model="filters[slider.id]"
    />

    <div class="slider-track" @click="moveCloserSliderToMousePos"></div>
  </div>
</template>

<script lang="ts" setup>
import { inject, PropType } from 'vue';
import { SliderGroup, sliderGroupsOptions } from '../../managers/stationFilterManager';

const filters = inject('StationsView_filters') as Record<string, any>;

const props = defineProps({
  sliderGroup: {
    type: String as PropType<SliderGroup>,
    required: true
  }
});

// Change slider value that's the closest one to the mouse position on the slider track click
function moveCloserSliderToMousePos(e: MouseEvent) {
  const { clientX, target } = e;
  const { minRange, maxRange, step } = sliderGroupsOptions[props.sliderGroup][0];

  const boundingRect = (target as HTMLElement).getBoundingClientRect();
  const mouseX = clientX - boundingRect.left;

  const leftSliderValue = filters[sliderGroupsOptions[props.sliderGroup][0].id];
  const rightSliderValue = filters[sliderGroupsOptions[props.sliderGroup][1].id];

  let mouseValue = Math.round((maxRange - minRange) * (mouseX / boundingRect.width));

  // Adjust mouse value to the closest step point (divide by 10, get rounded number, then multiply by step)
  mouseValue = Math.round(mouseValue / step) * step;

  let sliderIndex =
    Math.abs(leftSliderValue - mouseValue) < Math.abs(rightSliderValue - mouseValue) ? 0 : 1;

  filters[sliderGroupsOptions[props.sliderGroup][sliderIndex].id] = mouseValue;
}
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.filter-slider-container {
  position: relative;
  padding: 0.5em;
  height: 1.25em;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  border-radius: 1em;
  z-index: 10;

  cursor: pointer;
  background-color: #444;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4d4d4d;
  }
}

.slider {
  width: 100%;
  height: 1.25em;
  background: none;
  outline: none;
  border-radius: 1em;
  padding: 0;

  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);

  z-index: 100;

  pointer-events: none;
  cursor: pointer;

  -webkit-appearance: none;
  appearance: none;

  &:hover ~ .slider-track {
    background-color: #4d4d4d;
  }

  &:focus-visible {
    outline: 1px solid white;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;

    position: relative;
    z-index: 100;

    width: 1.25em;
    height: 1.25em;
    border-radius: 1em;
    background: var(--clr-primary);

    pointer-events: all;
  }

  &::-moz-range-thumb {
    width: 1.25em;
    height: 1.25em;
    border-radius: 1em;
    background: var(--clr-primary);

    pointer-events: all;
  }

  // &:first-child::-webkit-slider-runnable-track {
  // }

  &::-moz-range-track {
    position: relative;
    z-index: -1;

    width: 100%;
    height: 5px;
    cursor: pointer;
    background: none;
    border-radius: 1em;
  }

  // &:first-child::-moz-range-track {
  //   background: var(--clr-primary);
  // }
}
</style>
