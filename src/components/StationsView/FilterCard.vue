<template>
  <section
    class="card"
    v-if="showCard"
  >
    <div
      class="card-exit"
      @click="exit"
    >
      <!-- <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" /> -->
    </div>

    <div class="card-title flex">{{ $t("filters.title") }}</div>

    <div class="card-options">
      <div
        class="option"
        v-for="(option, i) in inputs.options"
        :key="i"
      >
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
          >{{ $t(`filters.${option.id}`) }}</span>
        </label>
      </div>
    </div>

    <div class="card-sliders">
      <div
        class="slider"
        v-for="(slider, i) in inputs.sliders"
        :key="i"
      >
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
          <input
            type="checkbox"
            v-model="saveOptions"
            @change="saveFilters"
          />
          <span
            class="save"
            :class="{ checked: saveOptions }"
          >
            {{ $t("filters.save") }}
          </span>
        </label>
      </div>
    </div>

    <div class="card-actions flex">
      <action-button
        class="outlined"
        @click="resetFilters"
      >
        {{ $t("filters.reset") }}
      </action-button>
      <action-button
        class="outlined"
        @click="exit"
      >{{
        $t("filters.close")
      }}</action-button>
    </div>
  </section>
</template>

<script lang="ts">
import inputData from "@/data/options.json";

import StorageManager from "@/scripts/managers/storageManager";
import { defineComponent } from "@vue/runtime-core";
import ActionButton from "../Global/ActionButton.vue";

export default defineComponent({
  components: { ActionButton },
  props: ["showCard", "exit"],

  data: () => ({
    inputs: { ...inputData },
    saveOptions: false,
    STORAGE_KEY: "options_saved",
  }),

  mounted() {
    this.saveOptions = StorageManager.isRegistered(this.STORAGE_KEY);
  },

  methods: {
    handleChange(e: Event) {
      const target = e.target as HTMLInputElement;

      this.$emit("changeFilterValue", {
        name: target.name,
        value: !target.checked,
      });
      if (this.saveOptions)
        StorageManager.setBooleanValue(target.name, target.checked);
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

    saveFilters() {
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

$accessCol: #e03b07;
$controlCol: #0085ff;
$signalCol: #bf7c00;
$statusCol: #349b32;
$saveCol: #28a826;

.card {
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
      grid-template-columns: repeat(auto-fit, minmax(8em, 1fr));
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
    }
  }

  &-save {
    display: flex;
    justify-content: center;

    .option {
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

    padding: 0.5em 0.55em;

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
        background-color: $accessCol;

        &::before {
          box-shadow: 0 0 6px 1px $accessCol;
        }
      }

      &.control {
        background-color: $controlCol;

        &::before {
          box-shadow: 0 0 6px 1px $controlCol;
        }
      }

      &.signals {
        background-color: $signalCol;

        &::before {
          box-shadow: 0 0 6px 1px $signalCol;
        }
      }

      &.status {
        background-color: $statusCol;

        &::before {
          box-shadow: 0 0 6px 1px $statusCol;
        }
      }

      &.save {
        background-color: $saveCol;

        &::before {
          box-shadow: 0 0 6px 1px $saveCol;
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