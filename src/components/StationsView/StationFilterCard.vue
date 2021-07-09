<template>
  <section class="card" v-if="showCard">
    <div class="card_exit" @click="exit">
      <!-- <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" /> -->
    </div>

    <div class="card_title flex">{{ $t("filters.title") }}</div>

    <section class="card_options">
      <filter-option
        v-for="(option, i) in inputs.options"
        :option="option"
        :key="i"
        @optionChange="handleChange"
      />
    </section>

    <!-- <section class="card_modes">
      <filter-option :option="inputs.modes[0]" @optionChange="invertFilters" />
    </section> -->

    <section class="card_sliders">
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
    </section>

    <section class="card_save">
      <filter-option
        @optionChange="saveFilters"
        :option="{
          id: 'save',
          name: 'save',
          section: 'mode',
          value: saveOptions,
          defaultValue: true,
        }"
      />
      <!-- <div class="option">
        <label>
          <input type="checkbox" v-model="saveOptions" @change="saveFilters" />
          <span class="save" :class="{ checked: saveOptions }">
            {{ $t("filters.save") }}
          </span>
        </label>
      </div> -->
    </section>

    <section class="card_actions flex">
      <action-button class="outlined" @click="resetFilters">
        {{ $t("filters.reset") }}
      </action-button>
      <action-button class="outlined" @click="exit">{{
        $t("filters.close")
      }}</action-button>
    </section>
  </section>
</template>

<script lang="ts">
import inputData from "@/data/options.json";

import StorageManager from "@/scripts/managers/storageManager";
import { defineComponent } from "@vue/runtime-core";
import ActionButton from "../Global/ActionButton.vue";
import FilterOption from "./FilterOption.vue";

export default defineComponent({
  components: { ActionButton, FilterOption },
  props: ["showCard", "exit"],
  emits: ["changeFilterValue", "invertFilters", "resetFilters"],

  data: () => ({
    inputs: { ...inputData },
    saveOptions: false,
    STORAGE_KEY: "options_saved",
  }),

  mounted() {
    this.saveOptions = StorageManager.isRegistered(this.STORAGE_KEY);
  },

  methods: {
    handleChange(change: { name: string; value: boolean }) {
      this.$emit("changeFilterValue", {
        name: change.name,
        value: !change.value,
      });

      if (this.saveOptions)
        StorageManager.setBooleanValue(change.name, change.value);
    },

    handleInput(e: Event) {
      const target = e.target as HTMLInputElement;

      this.$emit("changeFilterValue", {
        name: target.name,
        value: target.value,
      });
      if (this.saveOptions)
        StorageManager.setStringValue(target.name, target.value);
    },

    invertFilters() {
      this.inputs.options.forEach((option) => {
        option.value = !option.value;
        StorageManager.setBooleanValue(option.name, option.value);
      });

      this.$emit("invertFilters");
    },

    saveFilters(change: { value }) {
      this.saveOptions = change.value;

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
    },

    resetFilters() {
      this.inputs.options.forEach((option) => {
        option.value = option.defaultValue;
        StorageManager.setBooleanValue(option.name, option.value);
      });

      this.inputs.sliders.forEach((slider) => {
        slider.value = slider.defaultValue;
        StorageManager.setNumericValue(slider.name, slider.value);
      });

      this.$emit("resetFilters");
    },

    closeCard() {
      this.exit();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";
@import "../../styles/card";

.card {
  > section {
    margin-top: 1em;
  }

  &_title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

    margin: 0.5em 0;

    text-align: center;
  }

  &_options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, 1fr);
    gap: 0.5em;

    @include smallScreen() {
      grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
      grid-template-rows: auto;
    }
  }

  &_modes {
    display: flex;
    justify-content: center;

    .option {
      margin: 0 1em;
    }
  }

  &_actions button {
    margin: 0 0.3em;
  }

  &_save {
    display: flex;
    justify-content: center;

    .option {
      font-size: 1.1em;
    }
  }

  &_exit {
    img {
      width: 2em;
    }
  }
}

.slider {
  display: flex;
  align-items: center;

  margin: 1em 0;

  &-value {
    color: $accentCol;
    margin-right: 0.5em;
    padding: 0.1em 0.2em;
  }

  &-content {
    flex-grow: 2;
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