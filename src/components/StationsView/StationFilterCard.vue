<template>
  <section class="filter-card" v-click-outside="closeCard" @keydown.esc="closeCard">
    <div class="card_controls">
      <button class="card-button btn--filled btn--image" @click="toggleCard">
        <img class="button_icon" src="/images/icon-filter2.svg" alt="filter icon" />
        <p>[F] {{ $t('options.filters') }}</p>
        <span class="active-indicator" v-if="changedFilters.length != 0"></span>
      </button>
    </div>

    <transition name="card-anim">
      <div class="card" v-if="isVisible" ref="cardRef" @keydown.r="resetFilters">
        <div class="card_content" tabindex="0" @scroll="onScroll" ref="cardContentRef">
          <div class="card_title flex">{{ $t('filters.title') }}</div>
          <p class="card_info" v-html="$t('filters.desc')"></p>

          <div class="changed-filters" :data-active="changedFilters.length > 0">
            <template v-if="changedFilters.length > 0">
              {{ $t('filters.changed-filters-count') }} <b>{{ changedFilters.length }}</b>
            </template>
            <template v-else>{{ $t('filters.no-changed-filters') }}</template>
          </div>

          <section class="card_input-search">
            <datalist id="sceneries">
              <option
                v-for="scenery in sortedStationList"
                :key="scenery.name"
                :value="scenery.name"
              ></option>
            </datalist>

            <input
              v-model="chosenSearchScenery"
              id="scenery-search"
              list="sceneries"
              :placeholder="$t('filters.sceneries-placeholder')"
              @change="handleSceneriesInput"
              @focus="preventKeyDown = true"
              @blur="preventKeyDown = false"
            />

            <button class="btn--action" @click="handleSceneriesInput">
              {{ $t('filters.search-button-title') }}
            </button>
          </section>

          <section class="card_input-search authors">
            <select id="author" name="authors" v-model="filters['authors']">
              <option value="">{{ $t('filters.authors-placeholder') }}</option>
              <option v-for="(author, i) in authorsOptions" :key="i" :value="author">
                {{ author }}
              </option>
            </select>

            <button class="btn--action btn--image" @click="resetAuthorsInput">
              <img src="/images/icon-exit.svg" alt="reset authors search" />
            </button>
          </section>

          <section class="card_input-search">
            <select type="text" id="projects" name="projects" v-model="filters['projects']">
              <option value="">{{ $t('filters.projects-placeholder') }}</option>
              <option v-for="(project, i) in projectsOptions" :key="i" :value="project">
                {{ project }}
              </option>
            </select>

            <button class="btn--action btn--image" @click="resetProjectsInput">
              <img src="/images/icon-exit.svg" alt="reset projects search" />
            </button>
          </section>

          <section class="card_options">
            <div
              class="option-section"
              v-for="(sectionFilters, sectionKey) in filtersSections"
              :key="sectionKey"
            >
              <h3 class="text--primary">
                <span class="active-indicator" v-if="!areSectionFiltersDefault(sectionKey)"></span>
                {{ $t(`filters.sections.${sectionKey}`) }}
                <button @click="resetSectionFilters(sectionKey)">RESET</button>
              </h3>

              <hr />

              <div class="section-filters">
                <label
                  v-for="filterKey in sectionFilters"
                  @dblclick="setSingleSectionFilter(sectionKey, filterKey)"
                >
                  <input
                    type="checkbox"
                    :checked="filters[filterKey]"
                    v-model="filters[filterKey]"
                    :class="sectionKey"
                    :name="filterKey"
                    :id="filterKey"
                  />
                  <span>
                    {{ $t(`filters.${filterKey}`) }}
                  </span>
                </label>
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
                  : minimumHours < 7
                    ? minimumHours + $t('filters.hour')
                    : $t('filters.no-limit')
              }}</span>
              <button class="btn--action" @click="addHour">+</button>
            </span>
          </section>

          <section class="card_sliders">
            <div class="slider" v-for="(slider, i) in sliderStates" :key="i">
              <input
                class="slider-input"
                type="range"
                :name="slider.id"
                :id="slider.id"
                :min="slider.minRange"
                :max="slider.maxRange"
                :step="slider.step"
                v-model.number="filters[slider.id]"
              />
              <span class="slider-value">{{ filters[slider.id] }}</span>
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
              :disabled="changedFilters.length == 0"
              :data-disabled="changedFilters.length == 0"
              @click="resetFilters"
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
import { useMainStore } from '../../store/mainStore';

import FilterOption from './FilterOption.vue';
import StorageManager from '../../managers/storageManager';

import {
  filtersSections,
  sliderStates,
  initFilters,
  getChangedFilters
} from '../../managers/stationFilterManager';

import { StationFilterSection } from '../../managers/stationFilterManager';
import { computed } from 'vue';
import { watch } from 'vue';

const STORAGE_KEY = 'options_saved';

export default defineComponent({
  components: { FilterOption },
  mixins: [keyMixin, routerMixin],

  data: () => ({
    saveOptions: false,

    filtersSections,
    sliderStates,

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

    const filters = inject('StationsView_filters') as Record<string, any>;

    const changedFilters = computed(() => getChangedFilters(filters));

    // Save filters to persistent storage
    watch(filters, (value) => {
      if (!StorageManager.isRegistered(STORAGE_KEY)) return;

      Object.keys(value).forEach((filterKey) => {
        StorageManager.setValue(filterKey, filters[filterKey]);
      });
    });

    return {
      isVisible,
      store,
      filters,
      changedFilters
    };
  },

  mounted() {
    this.saveOptions = StorageManager.isRegistered(STORAGE_KEY);

    if (StorageManager.isRegistered('onlineFromHours') && this.saveOptions) {
      this.minimumHours = StorageManager.getNumericValue('onlineFromHours');
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

    authorsOptions() {
      return this.store.stationList
        .reduce((acc, station) => {
          if (station.generalInfo?.hidden === true) return acc;

          station.generalInfo?.authors?.forEach((author) => {
            if (author.trim() != '' && !acc.includes(author.toLocaleLowerCase()))
              acc.push(author.toLocaleLowerCase());
          });

          return acc;
        }, [] as string[])
        .sort((a, b) => a.localeCompare(b));
    },

    projectsOptions() {
      return this.store.stationList
        .reduce((acc, station) => {
          if (!station.generalInfo || !station.generalInfo.project || station.generalInfo.hidden)
            return acc;
          if (!acc.includes(station.generalInfo.project.trim()))
            acc.push(station.generalInfo.project.trim());

          return acc;
        }, [] as string[])
        .sort((a, b) => a.localeCompare(b));
    }
  },

  watch: {
    isVisible(value: boolean) {
      this.$nextTick(() => {
        if (value) {
          (this.$refs['cardContentRef'] as HTMLDivElement).scrollTop = this.scrollTop;
          (this.$refs['cardContentRef'] as HTMLDivElement).focus();
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

    resetAuthorsInput() {
      this.filters['authors'] = '';
    },

    resetProjectsInput() {
      this.filters['projects'] = '';
    },

    handleSceneriesInput() {
      const chosenStation = this.store.stationList.find(
        ({ name }) => name == this.chosenSearchScenery
      );

      if (chosenStation) {
        this.$router.push(`/scenery?station=${chosenStation.name.replace(/ /g, '_')}`);
        this.chosenSearchScenery = '';
        this.isVisible = false;
      }
    },

    subHour() {
      this.minimumHours = this.minimumHours < 1 ? 7 : this.minimumHours - 1;
      this.filters['onlineFromHours'] = this.minimumHours;
    },

    addHour() {
      this.minimumHours = this.minimumHours > 6 ? 0 : this.minimumHours + 1;
      this.filters['onlineFromHours'] = this.minimumHours;
    },

    saveFilters() {
      this.saveOptions = !this.saveOptions;

      if (!this.saveOptions) {
        StorageManager.unregisterStorage(STORAGE_KEY);
        return;
      }

      StorageManager.registerStorage(STORAGE_KEY);

      Object.keys(this.filters).forEach((filterKey) => {
        StorageManager.setValue(filterKey, this.filters[filterKey]);
      });
    },

    resetFilters() {
      if (this.preventKeyDown) return;

      // Reset local model values
      this.minimumHours = 0;

      // Reset global filters
      Object.keys(this.filters).forEach((filterKey) => {
        this.filters[filterKey] = (initFilters as any)[filterKey];
      });
    },

    areSectionFiltersDefault(sectionKey: StationFilterSection) {
      return filtersSections[sectionKey].every((filterKey) => {
        return this.filters[filterKey] == initFilters[filterKey];
      });
    },

    resetSectionFilters(sectionKey: StationFilterSection) {
      filtersSections[sectionKey].forEach((filterKey) => {
        this.filters[filterKey] = initFilters[filterKey];
      });
    },

    setSingleSectionFilter(sectionKey: StationFilterSection, chosenKey: string) {
      filtersSections[sectionKey].forEach((filterKey) => {
        if (typeof this.filters[filterKey] === 'boolean')
          this.filters[filterKey] = filterKey != chosenKey;
      });
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
@use '../../styles/responsive';
@use '../../styles/card';
@use '../../styles/animations';

h3.section-header {
  text-align: center;
  margin: 0.5em 0;
}

.card {
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 1px;
}

.card_info {
  background-color: #111;
  padding: 0.5em;
}

.changed-filters {
  background-color: #111;
  padding: 0.5em;

  &[data-active='true'] {
    color: lightgreen;
  }
}

.card_controls {
  display: flex;
  gap: 0.5em;
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
  color: var(--clr-primary);

  text-align: center;
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
      color: var(--clr-primary);
    }

    button {
      padding: 0.2em 0.6em;
    }
  }
}

.card_input-search {
  display: flex;
  align-items: center;
  gap: 0.5em;

  button {
    height: 100%;
  }

  input,
  select {
    width: 100%;
    padding: 0.5em;
    border: 1px solid #aaa;
  }

  &.authors {
    margin-top: 1em;
  }
}

.section-filters {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em;
  margin: 1em 0;
}

.section-filters > label {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  span {
    cursor: pointer;
    display: inline-block;
    width: 100%;
    text-align: center;
    padding: 0.25em;
    font-weight: bold;
    background-color: forestgreen;
  }

  span:hover {
    background-color: #22aa22;
  }

  input[type='checkbox'] {
    cursor: pointer;
    position: absolute;
    opacity: 0;

    &:checked + span {
      background-color: #444;

      &:hover {
        background-color: #555;
      }
    }

    &:focus-visible + span {
      outline: 1px solid var(--clr-primary);
    }
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

.slider {
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  align-items: center;
  gap: 0.25em;

  margin-bottom: 1em;

  &-value {
    color: var(--clr-primary);
    padding: 0.1em 0.2em;
    text-align: center;
  }

  &-input {
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border: none;
    outline: none;

    min-width: 25%;

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
      border: 3px solid var(--clr-primary);
      background-color: #333;

      @include responsive.smallScreen {
        width: 15px;
        height: 15px;
        margin-top: -5px;
        border: 3px solid var(--clr-primary);
      }
    }

    &::-moz-range-thumb {
      height: 1em;
      width: 1em;

      border-radius: 50%;

      background: white;
      border: 4px solid var(--clr-primary);

      cursor: pointer;

      @include responsive.smallScreen {
        width: 1em;
        height: 1em;
        border: 3px solid var(--clr-primary);
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

@include responsive.smallScreen {
  .slider {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    &-input {
      width: 90%;
    }

    &-content {
      text-align: center;
    }
  }

  .card_controls > button > p {
    display: none;
  }
}
</style>
