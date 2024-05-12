<template>
  <section class="filter-card" v-click-outside="closeCard" @keydown.esc="closeCard">
    <div class="card_controls">
      <button class="btn--filled btn--image" @click="toggleCard">
        <img class="button_icon" src="/images/icon-filter2.svg" alt="filter icon" />
        [F] {{ $t('options.filters') }}
        <span class="active-indicator" v-if="!filterStore.areFiltersAtDefault"></span>
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
          <option
            v-for="scenery in sortedStationList"
            :key="scenery.name"
            :value="scenery.name"
          ></option>
        </datalist>
      </label>
    </div>

    <transition name="card-anim">
      <div class="card" v-if="isVisible" tabindex="0" ref="cardRef" @keydown.r="resetFilters">
        <div class="card_content" @scroll="onScroll" ref="cardContentRef">
          <div class="card_title flex">{{ $t('filters.title') }}</div>
          <p class="card_info" v-html="$t('filters.desc')"></p>

          <section class="card_options">
            <div
              class="option-section"
              v-for="section in filterStore.inputs.optionSections"
              :key="section"
            >
              <h3 class="text--primary">
                {{ $t(`filters.sections.${section}`) }}

                <button @click="filterStore.resetSectionOptions(section)">RESET</button>
              </h3>

              <hr />

              <div class="section-inputs">
                <FilterOption
                  v-for="(option, i) in filterStore.inputs.options.filter(
                    (o) => o.section == section
                  )"
                  v-model:optionValue="option.value"
                  :option="option"
                  :key="i"
                />
              </div>
            </div>
          </section>

          <section class="card_timestamp">
            <h3 class="section-header">{{ $t('filters.minimum-hours-title') }}</h3>

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

          <datalist id="authors">
            <option v-for="(author, i) in authors" :key="i" :value="author"></option>
          </datalist>

          <section class="card_authors-search">
            <h3 class="section-header">{{ $t('filters.authors-search') }}</h3>

            <form action="javascript:void(0);" @submit="handleAuthorsInput">
              <input
                type="text"
                id="author"
                list="authors"
                name="authors"
                :placeholder="$t('filters.authors-placeholder')"
                v-model="authorsInputValue"
                @focus="preventKeyDown = true"
                @blur="preventKeyDown = false"
              />

              <button class="btn--action">{{ $t('filters.authors-button-title') }}</button>
            </form>
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
                :step="slider.step"
                v-model="slider.value"
                @change="handleInput"
              />
              <span class="slider-value">{{ slider.value }}</span>
              <div class="slider-content">
                {{ $t(`filters.sliders.${slider.id}`) }}
              </div>
            </div>
          </section>
        </div>

        <section class="card_actions">
          <div class="action-buttons">
            <button
              class="btn--action"
              style="width: 100%"
              @click="saveFilters"
              :data-selected="saveOptions"
            >
              {{ $t('filters.save') }}
            </button>

            <button
              class="btn--action"
              @click="resetFilters"
              :disabled="filterStore.areFiltersAtDefault"
              :data-disabled="filterStore.areFiltersAtDefault"
            >
              [R] {{ $t('filters.reset') }}
            </button>
            <button class="btn--action" @click="closeCard">{{ $t('filters.close') }}</button>
          </div>
        </section>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import keyMixin from '../../mixins/keyMixin';
import routerMixin from '../../mixins/routerMixin';
import { useStationFiltersStore } from '../../store/stationFiltersStore';
import { useMainStore } from '../../store/mainStore';

import FilterOption from './FilterOption.vue';
import StorageManager from '../../managers/storageManager';

export default defineComponent({
  components: { FilterOption },
  mixins: [keyMixin, routerMixin],

  data: () => ({
    saveOptions: false,
    STORAGE_KEY: 'options_saved',

    authorsInputValue: '',
    minimumHours: 0,

    currentRegion: { id: '', value: '' },

    delayInputTimer: -1,
    chosenSearchScenery: '',

    scrollTop: 0,
    lastFocusedEl: null as HTMLElement | null
  }),

  setup() {
    const isVisible = inject('isFilterCardVisible');
    const store = useMainStore();
    const filterStore = useStationFiltersStore();

    return {
      isVisible,
      store,
      filterStore
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

  computed: {
    sortedStationList() {
      return this.store.stationList
        .filter((s) =>
          s.name.toLocaleLowerCase().includes(this.chosenSearchScenery.toLocaleLowerCase())
        )
        .sort((s1, s2) => (s1.name > s2.name ? 1 : -1));
    },

    currentOptionsActive() {
      return true;
    },

    authors() {
      return this.store.stationList
        .reduce((acc, station) => {
          station.generalInfo?.authors?.forEach((author) => {
            if (author.trim() != '' && !acc.includes(author.toLocaleLowerCase()))
              acc.push(author.toLocaleLowerCase());
          });

          return acc;
        }, [] as string[])
        .sort((a, b) => a.localeCompare(b));
    }
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
        if (value) {
          (this.$refs['cardRef'] as HTMLDivElement).focus();
          (this.$refs['cardContentRef'] as HTMLDivElement).scrollTop = this.scrollTop;
        }
      });
    }
  },

  methods: {
    // Override keyMixin function
    onKeyDownFunction() {
      this.isVisible = !this.isVisible;
    },

    onScroll(e: Event) {
      this.scrollTop = (e.target as HTMLElement).scrollTop;
    },

    handleInput(e: Event) {
      const target = e.target as HTMLInputElement;

      this.filterStore.changeFilterValue(target.name, target.value);

      if (this.saveOptions) StorageManager.setStringValue(target.name, target.value);
    },

    handleAuthorsInput() {
      this.filterStore.changeFilterValue('authors', this.authorsInputValue);

      if (this.saveOptions) StorageManager.setStringValue('authors', this.authorsInputValue);
    },

    changeNumericFilterValue(name: string, value: number, saveToStorage = false) {
      this.filterStore.changeFilterValue(name, value);
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

      this.filterStore.inputs.options.forEach((option) =>
        StorageManager.setBooleanValue(option.name, !option.value)
      );
      this.filterStore.inputs.sliders.forEach((slider) =>
        StorageManager.setNumericValue(slider.name, slider.value)
      );
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
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/card.scss';
@import '../../styles/animations.scss';

h3.section-header {
  text-align: center;
  margin: 0.5em 0;
}

.card {
  display: grid;
  grid-template-rows: 1fr auto;
}

.card_info {
  background-color: #111;
  padding: 0.5em;
}

.card_controls {
  display: flex;
  gap: 0.5em;

  input {
    border-radius: 0.5em 0.5em 0 0;
    height: 100%;
  }
}

.card_content {
  padding: 1em 0.5em;

  display: flex;
  flex-direction: column;

  gap: 1em;
  overflow: auto;
}

.card_title {
  font-size: 2em;
  font-weight: 700;
  color: $accentCol;

  text-align: center;
}

.card_regions {
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

.card_timestamp {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .clock {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 1.2em;
    text-align: center;

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

.card_authors-search {
  margin: 1em 0;

  form {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5em;
    width: 100%;
    margin-top: 1em;
  }

  input {
    width: 70%;
    max-width: 400px;
    padding: 0.5em;
    outline: 1px solid white;
  }
}

.card_actions {
  padding: 0.5em;

  .action-buttons {
    display: flex;
    gap: 0.5em;

    margin-top: 0.5em;

    button {
      width: 100%;
      margin: 0 auto;
      padding: 0.5em;

      &[data-selected='true'] {
        background-color: forestgreen;
      }
    }
  }
}

.option-section h3 {
  display: flex;
  align-items: center;
  margin-bottom: 0.25em;

  gap: 0.5em;

  button {
    padding: 0.15em;
    color: coral;
  }
}

.section-inputs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em;
  margin: 1em 0;
}

.quick-actions div {
  display: flex;
  margin: 1em 0;
  gap: 1em;
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
