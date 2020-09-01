<template>
  <section class="filter-card">
    <div class="card-exit" @click="exit">
      <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
    </div>

    <div class="card-title flex">FILTRUJ STACJE</div>

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
          >{{option.content}}</span>
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

        <span class="slider-value">{{slider.value}}</span>

        <div class="slider-content">{{slider.content}}</div>
      </div>
    </div>

    <div class="card-save">
      <div class="option">
        <label class="option-label">
          <input class="option-input" type="checkbox" v-model="saveOptions" @change="saveFilters" />
          <span class="option-content save" :class="{'checked': saveOptions}">ZAPISZ FILTRY</span>
        </label>
      </div>
    </div>

    <div class="card-actions flex">
      <button class="button" @click="reset">RESET FILTRÓW</button>
      <button class="button" @click="exit">ZAMKNIJ FILTRY</button>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import inputData from "@/data/options.json";

@Component
export default class FilterCard extends Vue {
  inputs = { ...inputData };
  saveOptions: boolean = false;
  STORAGE_KEY: string = "options_saved";

  @Prop() exit!: () => void;

  mounted() {
    const storage = window.localStorage;

    if (storage.getItem(this.STORAGE_KEY) === "true") this.saveOptions = true;
    else this.saveOptions = false;
  }

  handleChange(e: Event): void {
    const target = <HTMLInputElement>e.target;

    this.$emit("changeFilterValue", {
      name: target.name,
      value: !target.checked,
    });

    if (this.saveOptions)
      window.localStorage.setItem(target.name, target.checked + "");
  }

  handleInput(e: Event): void {
    const target = <HTMLInputElement>e.target;
    this.$emit("changeFilterValue", {
      name: target.name,
      value: target.value,
    });

    if (this.saveOptions)
      window.localStorage.setItem(target.name, target.value + "");
  }

  saveFilters(): void {
    const storage = window.localStorage;

    if (this.saveOptions) {
      this.inputs.options.forEach((option) =>
        storage.setItem(option.name, option.value + "")
      );

      this.inputs.sliders.forEach((slider) =>
        storage.setItem(slider.name, slider.value + "")
      );

      storage.setItem(this.STORAGE_KEY, "true");
    } else storage.setItem(this.STORAGE_KEY, "false");
  }

  reset(): void {
    this.inputs.options.forEach((option) => {
      option.value = option.defaultValue;
      window.localStorage.setItem(option.name, option.value + "");
    });

    this.inputs.sliders.forEach((slider) => {
      slider.value = slider.defaultValue;
      window.localStorage.setItem(slider.name, slider.value + "");
    });

    this.$emit('resetFilters');
  }

  closeCard(): void {
    this.exit();
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";
@import "../../styles/variables";

.filter-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 3;

  overflow: auto;
  max-height: 95vh;

  padding: 0.5em;
  max-width: 600px;
  width: 65%;

  background: #262a2e;

  font-size: calc(0.75rem + 0.4vw);
  box-shadow: 0 0 15px 5px #474747;

  @include smallScreen() {
    width: 85vw;
    font-size: 1em;
  }
}

.card {
  &-exit {
    position: absolute;
    top: 0;
    right: 0;

    margin: 0.8em;

    img {
      width: 1.1em;
    }

    cursor: pointer;
  }

  &-title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

    margin: 0.5em 0;
  }

  &-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6em, 1fr));
    padding: 0 1.5em;
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
      width: 30%;
      font-size: 0.9em;
    }
  }
}

.option {
  margin: 0.3em;

  &-input {
    display: none;
  }

  &-content {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    width: 100%;
    text-align: center;

    cursor: pointer;

    padding: 0.6em 0.5em;
    border-radius: 0.4em;

    font-size: 0.65em;

    background-color: #333;

    display: inline-block;
    position: relative;

    transition: all 0.2s;

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

        border-radius: inherit;
      }
    }
  }
}

.slider {
  display: flex;

  padding: 0.5em;

  &-value {
    display: flex;
    justify-content: center;
    align-items: center;

    color: $accentCol;
    margin-right: 0.3em;
    padding: 0.1em 0.2em;

    font-size: 1.1em;
    font-weight: 500;

    border-radius: 0.2em;
  }

  &-content {
    display: flex;
    align-items: center;

    font-size: 0.75em;
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