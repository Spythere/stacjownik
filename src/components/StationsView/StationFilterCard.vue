<template>
  <section class="filter-card" v-click-outside="closeCard" @keydown.esc="closeCard">
    <div class="card_controls">
      <button class="btn--image" @click="toggleCard">
        <img class="button_icon" :src="getIcon('filter2')" alt="filter icon" />
        {{ $t('options.filters') }} [F]
      </button>

      <label for="scenery-search">
        <input
          id="scenery-search"
          list="sceneries"
          :placeholder="$t('sceneries.scenery-search')"
          @focus="preventKeyDown = true"
          @blur="preventKeyDown = false"
          v-model="chosenSearchScenery"
        />

        <datalist id="sceneries">
          <option v-for="scenery in store.stationList" :value="scenery.name"></option>
        </datalist>
      </label>
    </div>

    <transition name="card-anim">
      <div class="card" v-if="isVisible">
        <div class="card_content">
          <div class="card_title flex">{{ $t('filters.title') }}</div>

          <section class="card_options">
            <filter-option
              v-for="(option, i) in inputs.options"
              :option="option"
              :key="i"
              @optionChange="handleChange"
            />
          </section>
          <section class="card_timestamp" style="text-align: center">
            <div>{{ $t('filters.minimum-hours-title') }}</div>
            <span class="clock">
              <button @click="subHour">-</button>
              <span>{{
                minimumHours == 0
                  ? $t('filters.now')
                  : minimumHours < 8
                  ? minimumHours + $t('filters.hour')
                  : $t('filters.no-limit')
              }}</span>
              <button @click="addHour">+</button>
            </span>
          </section>

          <section class="card_authors-search">
            <input
              type="text"
              :placeholder="$t('filters.authors-search')"
              name="authors"
              v-model="authorsInputValue"
              @input="handleAuthorsInput"
              @focus="preventKeyDown = true"
              @blur="preventKeyDown = false"
            />
          </section>

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

          <section class="card_actions">
            <div>
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
            </div>
            <div>
              <action-button class="outlined" @click="resetFilters">
                {{ $t('filters.reset') }}
              </action-button>
              <action-button class="outlined" @click="closeCard">{{ $t('filters.close') }}</action-button>
            </div>
          </section>
        </div>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import inputData from '../../data/options.json';
import imageMixin from '../../mixins/imageMixin';
import keyMixin from '../../mixins/keyMixin';
import routerMixin from '../../mixins/routerMixin';
import StorageManager from '../../scripts/managers/storageManager';
import { useStore } from '../../store/store';

import ActionButton from '../Global/ActionButton.vue';
import FilterOption from './FilterOption.vue';

export default defineComponent({
  components: { ActionButton, FilterOption },
  emits: ['changeFilterValue', 'invertFilters', 'resetFilters'],
  mixins: [imageMixin, keyMixin, routerMixin],

  data: () => ({
    inputs: { ...inputData },
    saveOptions: false,
    STORAGE_KEY: 'options_saved',

    authorsInputValue: '',
    minimumHours: 0,

    currentRegion: { id: '', value: '' },

    delayInputTimer: -1,
    chosenSearchScenery: '',
  }),

  setup() {
    const isVisible = inject('isFilterCardVisible');
    const store = useStore();

    return {
      isVisible,
      store,
    };
  },

  mounted() {
    this.saveOptions = StorageManager.isRegistered(this.STORAGE_KEY);

    if (StorageManager.isRegistered('onlineFromHours') && this.saveOptions) {
      this.minimumHours = StorageManager.getNumericValue('onlineFromHours');

      this.changeNumericFilterValue('onlineFromHours', this.minimumHours);
    }

    this.currentRegion = this.store.region;
  },

  watch: {
    chosenSearchScenery(value: string) {
      const chosenStation = this.store.stationList.find(({ name }) => name == value);

      if (chosenStation) {
        this.$router.push(`/scenery?station=${chosenStation.name.replace(/ /g, '_')}`);
        this.chosenSearchScenery = '';
      }
    },
  },

  methods: {
    // Override keyMixin function
    onKeyDownFunction() {
      this.isVisible = !this.isVisible;
    },

    handleChange(change: { name: string; value: boolean }) {
      this.$emit('changeFilterValue', {
        name: change.name,
        value: !change.value,
      });

      if (this.saveOptions) StorageManager.setBooleanValue(change.name, change.value);
    },

    handleInput(e: Event) {
      const target = e.target as HTMLInputElement;

      this.$emit('changeFilterValue', {
        name: target.name,
        value: target.value,
      });

      if (this.saveOptions) StorageManager.setStringValue(target.name, target.value);
    },

    handleAuthorsInput(e: Event) {
      clearTimeout(this.delayInputTimer);

      this.delayInputTimer = window.setTimeout(() => {
        this.handleInput(e);
      }, 400);
    },

    changeNumericFilterValue(name: string, value: number, saveToStorage = false) {
      this.$emit('changeFilterValue', {
        name,
        value,
      });

      if (this.saveOptions && saveToStorage) StorageManager.setNumericValue(name, value);
    },

    subHour() {
      this.minimumHours = this.minimumHours < 1 ? 8 : this.minimumHours - 1;

      this.changeNumericFilterValue('onlineFromHours', this.minimumHours, true);
    },

    addHour() {
      this.minimumHours = this.minimumHours > 7 ? 0 : this.minimumHours + 1;

      this.changeNumericFilterValue('onlineFromHours', this.minimumHours, true);
    },

    invertFilters() {
      this.inputs.options.forEach((option) => {
        option.value = !option.value;
        StorageManager.setBooleanValue(option.name, option.value);
      });

      this.$emit('invertFilters');
    },

    saveFilters(change: { value: any }) {
      this.saveOptions = change.value;

      if (!this.saveOptions) {
        StorageManager.unregisterStorage(this.STORAGE_KEY);
        return;
      }

      StorageManager.registerStorage(this.STORAGE_KEY);

      this.inputs.options.forEach((option) => StorageManager.setBooleanValue(option.name, option.value));

      this.inputs.sliders.forEach((slider) => StorageManager.setNumericValue(slider.name, slider.value));
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

      this.authorsInputValue = '';

      this.minimumHours = 0;
      this.changeNumericFilterValue('onlineFromHours', this.minimumHours, true);

      this.$emit('resetFilters');
    },

    closeCard() {
      this.isVisible = false;
    },

    toggleCard() {
      this.isVisible = !this.isVisible;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/card.scss';

.card-anim {
  &-enter-active,
  &-leave-active {
    transition: all $animDuration $animType;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.45);
  }
}

.card {
  &_controls {
    display: flex;
    gap: 0.5em;

    input {
      border-radius: 0.5em 0.5em 0 0;
      height: 100%;
    }
  }

  &_content {
    display: grid;
    grid-template-rows: 70px 1fr 100px 50px auto;
    min-height: 0;
    max-height: 100vh;
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

  &_regions {
    display: flex;
    justify-content: center;

    label > input {
      display: none;
    }

    label > span {
      padding: 0.25em 0.5em;
      margin: 0 0.25em;

      cursor: pointer;

      background-color: gray;

      &.checked {
        background-color: seagreen;
      }
    }
  }

  &_timestamp {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .clock {
      display: flex;
      align-items: center;
      justify-content: center;

      font-size: 1.15em;

      color: $accentCol;
      font-weight: bold;
    }

    span {
      min-width: 100px;
    }

    button {
      border: none;
      outline: none;
      background: none;
      padding: 0 0.45em;

      cursor: pointer;

      color: white;

      font-size: 1.35em;

      &:focus,
      &:hover {
        color: $accentCol;
      }
    }
  }

  &_modes {
    display: flex;
    justify-content: center;

    .option {
      margin: 0 1em;
    }
  }

  &_authors-search {
    display: inline-block;
    margin: 0 auto;
    width: 60%;
    min-width: 240px;

    input {
      width: 100%;
      padding: 0.5em;
      border: 1px solid white;
    }
  }

  &_actions {
    margin-top: 1em;

    display: flex;
    flex-direction: column;
    align-items: center;

    button {
      margin: 1em 0.25em;
    }

    .option {
      font-size: 1.1em;
    }
  }
}

.slider {
  display: flex;
  align-items: center;

  margin-bottom: 1em;

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
    max-width: 120px;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;

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
      height: 1em;
      width: 1em;

      border-radius: 50%;

      background: white;
      border: 4px solid $accentCol;

      cursor: pointer;

      @include smallScreen() {
        width: 1em;
        height: 1em;
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
