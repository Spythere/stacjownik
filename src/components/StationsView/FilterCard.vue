<template>
  <section class="card">
    <div class="card-exit" @click="exit">
      <!-- <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" /> -->
    </div>

    <div class="card-title flex">{{ $t("filters.title") }}</div>

    <div class="card-options">
      <div class="option" v-for="(option, i) in inputs.options" :key="i">
        <label class="option-label">
          <input
            class="option-input"
            type="checkbox"
            :name="option.name"
            :defaultValue="option.defaultValue"
            :id="option.id"
            v-model="option.value"
            @change="handleChange"
          />
          <span
            class="option-content"
            :class="option.section + (option.value ? ' checked' : '')"
            >{{ $t(`filters.${option.id}`) }}</span
          >
        </label>
      </div>
    </div>

    <div class="card-sliders">
      <div class="slider" v-for="(slider, i) in inputs.sliders" :key="i">
        <input
          class="slider-input"
          type="range"
          :name="slider.name"
          :id="slider.id"
          :min="slider.minRange"
          :max="slider.maxRange"
          v-model="slider.value"
          @change="handleInput"
        />

        <span class="slider-value">{{ slider.value }}</span>

        <div class="slider-content">
          {{ $t(`filters.sliders.${slider.id}`) }}
        </div>
      </div>
    </div>

    <div class="card-save">
      <div class="option">
        <label>
          <input type="checkbox" v-model="saveOptions" @change="saveFilters" />
          <span class="save" :class="{ checked: saveOptions }">
            {{ $t("filters.save") }}
          </span>
        </label>
      </div>
    </div>

    <div class="card-actions flex">
      <button class="button" @click="resetFilters">
        {{ $t("filters.reset") }}
      </button>
      <button class="button" @click="exit">{{ $t("filters.close") }}</button>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import inputData from "@/data/options.json";

import StorageManager from "@/scripts/storageManager";

@Component
export default class FilterCard extends Vue {
  inputs = { ...inputData };
  saveOptions: boolean = false;
  STORAGE_KEY: string = "options_saved";

  @Prop() exit!: () => void;

  mounted() {
    this.saveOptions = StorageManager.isRegistered(this.STORAGE_KEY);
  }

  handleChange(e: Event): void {
    const target = <HTMLInputElement>e.target;

    this.$emit("changeFilterValue", {
      name: target.name,
      value: !target.checked,
    });

    if (this.saveOptions)
      StorageManager.setBooleanValue(target.name, target.checked);
  }

  handleInput(e: Event): void {
    const target = <HTMLInputElement>e.target;
    this.$emit("changeFilterValue", {
      name: target.name,
      value: target.value,
    });

    if (this.saveOptions)
      StorageManager.setStringValue(target.name, target.value);
  }

  saveFilters(): void {
    if (!this.saveOptions) {
      StorageManager.unregisterStorage(this.STORAGE_KEY);
      return;
    }

    StorageManager.registerStorage(this.STORAGE_KEY);

    this.inputs.options.forEach((option) =>
      StorageManager.setBooleanValue(option.name, option.value)
    );

    this.inputs.sliders.forEach((slider) =>
      StorageManager.setNumericValue(slider.name, slider.value)
    );
  }

  resetFilters(): void {
    this.inputs.options.forEach((option) => {
      option.value = option.defaultValue;
      StorageManager.setBooleanValue(option.name, option.value);
    });

    this.inputs.sliders.forEach((slider) => {
      slider.value = slider.defaultValue;
      StorageManager.setNumericValue(slider.name, slider.value);
    });

    this.$emit("resetFilters");
  }

  closeCard(): void {
    this.exit();
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";
@import "../../styles/card";

.card {
  font-size: 1.25em;

  @include smallScreen() {
    font-size: 1.35em;
  }

  &-title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

    margin: 0.5em 0;

    text-align: center;
  }

  &-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, 1fr);
    gap: 0.5em;

    @include smallScreen() {
      grid-template-columns: repeat(auto-fit, minmax(6em, 1fr));
      grid-template-rows: auto;
    }
  }

  &-sliders {
    margin-top: 1em;
  }

  &-actions {
    margin-top: 0.7em;

    button {
      margin: 0 0.3em;
      border: 1px solid white;
      font-size: 0.85em;
    }
  }

  &-save {
    display: flex;
    justify-content: center;

    .option {
      width: 7em;
      font-size: 1.1em;
    }
  }

  &-exit {
    img {
      width: 2em;
    }
  }
}

.option {
  input {
    display: none;
  }

  span {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    width: 100%;
    text-align: center;

    cursor: pointer;

    padding: 0.45em 0.4em;

    font-size: 0.8em;

    display: inline-block;
    position: relative;

    transition: all 0.2s;

    border-radius: 0.5em;

    &:not(.checked) {
      background-color: #585858;

      &::before {
        box-shadow: none;
      }
    }

    &.checked {
      &.access {
        background-color: #e03b07;

        &::before {
          box-shadow: 0 0 6px 1px #e03b07;
        }
      }

      &.control {
        background-color: #0085ff;

        &::before {
          box-shadow: 0 0 6px 1px #0085ff;
        }
      }

      &.signals {
        background-color: #b000bf;

        &::before {
          box-shadow: 0 0 6px 1px #b000bf;
        }
      }

      &.status {
        background-color: #05b702;

        &::before {
          box-shadow: 0 0 6px 1px #05b702;
        }
      }

      &.save {
        background-color: #05b702;

        &::before {
          box-shadow: 0 0 6px 1px #05b702;
        }
      }

      &::before {
        position: absolute;
        content: "";
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        border-radius: 0.5em;
      }
    }
  }
}

.slider {
  display: flex;
  margin: 1em 0;

  &-value {
    display: flex;
    justify-content: center;
    align-items: center;

    color: $accentCol;
    margin-right: 0.3em;
    padding: 0.1em 0.2em;

    font-weight: 500;

    border-radius: 0.2em;
  }

  &-content {
    display: flex;
    align-items: center;

    font-size: 0.8em;
  }

  &-input {
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border: none;
    outline: none;

    min-width: 25%;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;

      height: 20px;
      width: 20px;
      margin-top: -7px;

      border-radius: 50%;

      background: white;
      border: 4px solid $accentCol;

      @include smallScreen() {
        width: 15px;
        height: 15px;
        margin-top: -5px;
        border: 3px solid $accentCol;
      }
    }

    &::-moz-range-thumb {
      height: 15px;
      width: 15px;

      border-radius: 50%;

      background: white;
      border: 4px solid $accentCol;

      cursor: pointer;

      @include smallScreen() {
        width: 15px;
        height: 15px;
        border: 3px solid $accentCol;
      }
    }

    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 5px;
      cursor: pointer;
      background: #ffffff;
      border-radius: 1em;
    }

    &::-moz-range-track {
      width: 100%;
      height: 5px;
      cursor: pointer;
      background: #ffffff;
      border-radius: 1em;
    }

    &::-ms-track {
      width: 100%;
      height: 5px;
      cursor: pointer;
      background: #ffffff;
      border-radius: 1em;
    }
  }
}
</style>