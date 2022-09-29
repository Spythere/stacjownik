<template>
  <section class="filter-card" v-click-outside="closeCard" @keydown.esc="closeCard">
    <div class="card_controls">
      <button class="btn--filled btn--image" @click="toggleCard">
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
      <div class="card" v-if="isVisible" tabindex="0" ref="cardEl">
        <div class="card_content">
          <div class="card_title flex">{{ $t('filters.title') }}</div>

          <section class="card_options">
            <filter-option
              v-for="(option, i) in filterStore.inputs.options"
              :option="option"
              :key="i"
              @optionChange="handleChange"
            />
          </section>
          <section class="card_timestamp" style="text-align: center">
            <div>{{ $t('filters.minimum-hours-title') }}</div>
            <span class="clock">
              <button class="btn--action" @click="subHour">-</button>
              <span>{{
                minimumHours == 0
                  ? $t('filters.now')
                  : minimumHours < 8
                  ? minimumHours + $t('filters.hour')
                  : $t('filters.no-limit')
              }}</span>
              <button class="btn--action" @click="addHour">+</button>
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
            <div class="slider" v-for="(slider, i) in filterStore.inputs.sliders" :key="i">
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
            <div class="action-buttons">
              <button class="btn--action" style="width: 100%" @click="saveFilters" :data-selected="saveOptions">
                {{ $t('filters.save') }}
              </button>

              <button class="btn--action" @click="resetFilters">{{ $t('filters.reset') }}</button>
              <button class="btn--action" @click="closeCard">{{ $t('filters.close') }}</button>
            </div>
          </section>
        </div>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import keyMixin from '../../mixins/keyMixin';
import routerMixin from '../../mixins/routerMixin';
import StorageManager from '../../scripts/managers/storageManager';
import { useStationFiltersStore } from '../../store/stationFiltersStore';
import { useStore } from '../../store/store';

import ActionButton from '../Global/ActionButton.vue';
import FilterOption from './FilterOption.vue';

export default defineComponent({
  components: { ActionButton, FilterOption },
  mixins: [imageMixin, keyMixin, routerMixin],

  data: () => ({
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
    const filterStore = useStationFiltersStore();

    return {
      isVisible,
      store,
      filterStore,
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

    isVisible(value: boolean) {
      this.$nextTick(() => {
        if (value) (this.$refs['cardEl'] as HTMLDivElement).focus();
      });
    },
  },

  methods: {
    // Override keyMixin function
    onKeyDownFunction() {
      this.isVisible = !this.isVisible;
    },

    handleChange(change: { name: string; value: boolean }) {
      this.filterStore.changeFilterValue({
        name: change.name,
        value: !change.value,
      });

      if (this.saveOptions) StorageManager.setBooleanValue(change.name, change.value);
    },

    handleInput(e: Event) {
      const target = e.target as HTMLInputElement;

      this.filterStore.changeFilterValue({
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
      this.filterStore.changeFilterValue({
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

    saveFilters() {
      this.saveOptions = !this.saveOptions;

      if (!this.saveOptions) {
        StorageManager.unregisterStorage(this.STORAGE_KEY);
        return;
      }

      StorageManager.registerStorage(this.STORAGE_KEY);

      this.filterStore.inputs.options.forEach((option) => StorageManager.setBooleanValue(option.name, !option.value));
      this.filterStore.inputs.sliders.forEach((slider) => StorageManager.setNumericValue(slider.name, slider.value));
    },

    resetFilters() {
      this.authorsInputValue = '';

      this.minimumHours = 0;
      this.changeNumericFilterValue('onlineFromHours', this.minimumHours, true);
      this.filterStore.resetFilters();
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
    display: flex;
    flex-direction: column;
    gap: 1em;

    max-height: 90vh;

    padding: 1em;
  }

  &_title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

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

      font-size: 1.2em;
      margin-top: 0.5em;

      span {
        min-width: 120px;
        font-weight: bold;
        color: $accentCol;
      }

      button {
        padding: 0.2em 0.6em;
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
    .filter-option {
      max-width: 50%;
      margin: 0 auto;
    }

    .action-buttons {
      display: flex;
      gap: 0.5em;
      width: 100%;

      margin-top: 0.5em;

      button {
        width: 50%;
        margin: 0 auto;
        padding: 0.5em;

        &[data-selected='true'] {
          background-color: lightgreen;
          color: black;
        }
      }
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

    &:focus-visible ~ * {
      color: gold;
    }

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
