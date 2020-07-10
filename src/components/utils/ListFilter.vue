<template>
  <transition name="slide">
    <section class="filter-card">
      <div class="card-exit" @click="exit">
        <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
      </div>

      <div class="card-title flex">FILTRY</div>

      <div class="card-options">
        <div class="option" v-for="(option, i) in options" :key="i">
          <label class="option-label">
            <input
              class="option-input"
              type="checkbox"
              :name="option.name"
              :id="option.id"
              v-model="option.value"
              @change="handleChange"
            />
            <span class="option-content" :class="option.section">{{option.content}}</span>
          </label>
        </div>
      </div>

      <div class="card-sliders">
        <div class="slider" v-for="(slider, i) in sliders" :key="i">
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

      <div class="card-reset flex">
        <button class="button" @click="reset">RESET FILTRÓW</button>
      </div>
    </section>
  </transition>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapActions } from "vuex";

export default Vue.extend({
  name: "list-filter",
  data: () => ({
    options: [
      {
        id: "is-default",
        name: "default",
        section: "access",
        value: true,
        defaultValue: true,
        content: "W PACZCE"
      },
      {
        id: "not-default",
        name: "notDefault",
        section: "access",
        value: true,
        defaultValue: true,
        content: "POZA PACZKĄ"
      },
      {
        id: "non-public",
        name: "nonPublic",
        section: "access",
        value: true,
        defaultValue: true,
        content: "NIEPUBLICZNA"
      },
      {
        id: "SPK",
        name: "SPK",
        section: "control",
        value: true,
        defaultValue: true,
        content: "SPK"
      },
      {
        id: "SCS",
        name: "SCS",
        section: "control",
        value: true,
        defaultValue: true,
        content: "SCS"
      },
      {
        id: "by-hand",
        name: "ręczne",
        section: "control",
        value: true,
        defaultValue: true,
        content: "RĘCZNE"
      },
      {
        id: "levers",
        name: "mechaniczne",
        section: "control",
        value: true,
        defaultValue: true,
        content: "MECHANICZNE"
      },
      {
        id: "modern",
        name: "współczesna",
        section: "signals",
        value: true,
        defaultValue: true,
        content: "WSPÓŁCZESNA"
      },
      {
        id: "semaphore",
        name: "kształtowa",
        section: "signals",
        value: true,
        defaultValue: true,
        content: "KSZTAŁTOWA"
      },
      {
        id: "mixed",
        name: "mieszana",
        section: "signals",
        value: true,
        defaultValue: true,
        content: "MIESZANA"
      },
      {
        id: "historic",
        name: "historyczna",
        section: "signals",
        value: true,
        defaultValue: true,
        content: "HISTORYCZNA"
      },

      {
        id: "free",
        name: "free",
        section: "status",
        value: true,
        defaultValue: true,
        content: "WOLNA"
      },
      {
        id: "occupied",
        name: "occupied",
        section: "status",
        value: true,
        defaultValue: true,
        content: "ZAJĘTA"
      },
      {
        id: "ending",
        name: "ending",
        section: "status",
        value: true,
        defaultValue: true,
        content: "KOŃCZY"
      }
    ],

    sliders: [
      {
        id: "min-level",
        name: "minLevel",
        minRange: 0,
        maxRange: 20,
        value: 0,
        defaultValue: 0,
        content: "MINIMALNY WYMAGANY POZIOM DYŻURNEGO"
      },
      {
        id: "min-oneway-e",
        name: "minOneWayCatenary",
        minRange: 0,
        maxRange: 5,
        value: 0,
        defaultValue: 0,
        content: "MINIMALNA LICZBA SZLAKÓW JEDNOTOROWYCH ZELEKTRYFIKOWANYCH"
      },
      {
        id: "min-oneway-ne",
        name: "minOneWay",
        minRange: 0,
        maxRange: 5,
        value: 0,
        defaultValue: 0,
        content: "MINIMALNA LICZBA SZLAKÓW JEDNOTOROWYCH NIEZELEKTRYFIKOWANYCH"
      },
      {
        id: "min-twoway-e",
        name: "minTwoWayCatenary",
        minRange: 0,
        maxRange: 5,
        value: 0,
        defaultValue: 0,
        content: "MINIMALNA LICZBA SZLAKÓW DWUTOROWYCH ZELEKTRYFIKOWANYCH"
      },
      {
        id: "min-twoway-ne",
        name: "minTwoWay",
        minRange: 0,
        maxRange: 5,
        value: 0,
        defaultValue: 0,
        content: "MINIMALNA LICZBA SZLAKÓW DWUTOROWYCH NIEZELEKTRYFIKOWANYCH"
      }
    ]
  }),
  props: ["exit"],
  methods: {
    ...mapActions(["setFilter", "resetFilters"]),
    handleChange(e: any) {
      this.setFilter({ filterName: e.target.name, value: !e.target.checked });
    },
    handleInput(e: any) {
      this.setFilter({
        filterName: e.target.name,
        value: parseInt(e.target.value)
      });
    },
    reset() {
      this.options.forEach(option => (option.value = option.defaultValue));
      this.sliders.forEach(slider => (slider.value = slider.defaultValue));

      this.resetFilters();
    },
    exitFilters() {
      this.exit();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";
@import "../../styles/variables";

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
}

.filter-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  z-index: 0;

  overflow: auto;
  max-height: 95vh;

  padding: 0.5em;
  max-width: 600px;
  width: 65%;

  background: #262a2e;

  font-size: calc(0.75rem + 0.4vw);

  @include smallScreen() {
    width: 85vw;
    font-size: 1em;
  }
  box-shadow: 0 0 15px 5px #474747;
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

  &-reset {
    margin-top: 0.7em;
  }
}

.option {
  margin: 0.3em;

  &-input {
    display: none;

    &:not(:checked) + span {
      background-color: #585858;

      &::before {
        box-shadow: none;
      }
    }
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

    font-size: 0.6em;
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