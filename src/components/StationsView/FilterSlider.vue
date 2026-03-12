<template>
  <div class="filter-slider">
    <input
      v-for="slider in sliderGroupsOptions[sliderGroup]"
      type="range"
      :name="slider.id"
      :id="slider.id"
      :min="slider.minRange"
      :max="slider.maxRange"
      :step="slider.step"
      v-model="filters[slider.id]"
    />
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
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.filter-slider {
  position: relative;
  padding: 0.5em;
}

.filter-slider > input {
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);

  -webkit-appearance: none;
  appearance: none;
  background: none;
  border: none;
  outline: none;
  pointer-events: none;

  &:focus-visible ~ * {
    color: gold;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: all;
    z-index: 100;

    height: 20px;
    width: 20px;
    margin-top: -7px;

    border-radius: 50%;

    background-color: var(--clr-primary);

    @include responsive.smallScreen {
      width: 15px;
      height: 15px;
      margin-top: -5px;
    }
  }

  &::-moz-range-thumb {
    pointer-events: all;

    position: relative;
    z-index: 10;

    height: 1em;
    width: 1em;

    border-radius: 50%;

    background-color: #333;
    border: 3px solid var(--clr-primary);

    cursor: pointer;

    @include responsive.smallScreen {
      width: 1em;
      height: 1em;
    }
  }

  &::-webkit-slider-runnable-track {
    position: relative;
    z-index: 1;

    width: 100%;
    height: 5px;
    cursor: pointer;

    border-radius: 1em;
  }

  &:first-child::-webkit-slider-runnable-track {
    background: var(--clr-primary);
  }

  &::-moz-range-track {
    position: relative;
    z-index: -1;

    width: 100%;
    height: 5px;
    cursor: pointer;
    background: none;
    border-radius: 1em;
  }

  &:first-child::-moz-range-track {
    background: var(--clr-primary);
  }

  &::-ms-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    background: none;
    border-radius: 1em;
  }

  &:first-child::-ms-track {
    background: white;
  }
}
</style>
