<template>
  <div class="filters-options" @keydown.esc="showOptions = false">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleShowOptions" ref="button">
      <img src="/images/icon-filter2.svg" alt="Open filters icon" />
      {{ $t('options.filters') }} [F]
      <span class="active-indicator" v-if="currentOptionsActive"></span>
    </button>

    <transition name="options-anim">
      <div class="options_wrapper" v-if="showOptions">
        <div class="options_content">
          <h1 class="option-title">{{ $t('options.search-title') }}</h1>
          <div class="search_content">
            <div class="search-box">
              <input
                class="search-input"
                ref="initFocusedElement"
                @focus="preventKeyDown = true"
                @blur="preventKeyDown = false"
                :placeholder="$t(`options.search-train`)"
                v-model="searchedTrain"
              />
              <button class="search-exit">
                <img
                  src="/images/icon-exit.svg"
                  alt="Trains search clear icon"
                  @click="onInputClear('train')"
                />
              </button>
            </div>

            <div class="search-box">
              <input
                class="search-input"
                @focus="preventKeyDown = true"
                @blur="preventKeyDown = false"
                :placeholder="$t(`options.search-driver`)"
                v-model="searchedDriver"
              />
              <button class="search-exit">
                <img
                  src="/images/icon-exit.svg"
                  alt="Driver search clear icon"
                  @click="onInputClear('driver')"
                />
              </button>
            </div>
          </div>

          <h1 class="option-title">{{ $t('options.sort-title') }}</h1>
          <div class="options_sorters">
            <button
              v-for="opt in translatedSorterOptions"
              :key="opt.id"
              class="sort-option btn--option"
              :data-selected="opt.id == sorterActive.id"
              @click="onSorterChange(opt)"
            >
              {{ opt.value.toUpperCase() }}
            </button>
          </div>

          <h1 class="option-title" v-if="trainFilterList.length != 0">
            {{ $t('options.filter-title') }}
          </h1>

          <div class="options_filters">
            <div v-for="section in Object.keys(TrainFilterSection)" :key="section">
              <button
                class="btn--option"
                v-for="filter in trainFilterList.filter((f) => f.section == section)"
                :key="filter.id"
                :data-inactive="!filter.isActive"
                @click="onFilterChange(filter)"
              >
                {{ $t(`options.filter-${filter.id}`) }}
              </button>
            </div>
          </div>

          <div class="filter-actions">
            <div></div>
            <button class="btn--action" @click="resetAllFilters">
              {{ $t('options.filter-reset') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue';
import keyMixin from '../../mixins/keyMixin';
import { TrainFilter, TrainFilterSection } from './typings';

export default defineComponent({
  mixins: [keyMixin],

  props: {
    sorterOptionIds: {
      type: Array as PropType<Array<string>>,
      required: true
    },

    currentOptionsActive: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      showOptions: false,
      lastSelectedFilter: null as TrainFilter | null,
      TrainFilterSection
    };
  },

  setup() {
    return {
      searchedTrain: inject('searchedTrain') as string,
      searchedDriver: inject('searchedDriver') as string,

      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      trainFilterList: inject('filterList') as TrainFilter[]
    };
  },

  computed: {
    translatedSorterOptions() {
      return this.$props.sorterOptionIds.map((id) => ({
        id,
        value: this.$t(`options.sort-${id}`)
      }));
    }
  },

  methods: {
    // Override keyMixin function
    onKeyDownFunction() {
      this.toggleShowOptions();
    },

    toggleShowOptions() {
      this.showOptions = !this.showOptions;

      this.$nextTick(() => {
        if (this.showOptions) (this.$refs['button'] as HTMLButtonElement)?.focus();
      });
    },

    onSorterChange(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
    },

    onFilterChange(filter: TrainFilter) {
      filter.isActive = !filter.isActive;
      this.lastSelectedFilter = filter;
    },

    clearAllFilters() {
      this.trainFilterList.forEach((filter) => {
        filter.isActive = false;
      });
    },

    resetAllFilters() {
      this.trainFilterList.forEach((filter) => {
        filter.isActive = true;
      });
    },

    onInputClear(id: 'driver' | 'train') {
      if (id == 'driver') this.searchedDriver = '';
      if (id == 'train') this.searchedTrain = '';
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/filters_options.scss';

.search_content > div {
  margin: 0.5em auto;
}

.search_content > button {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.options_sorters {
  display: flex;
  grid-template-columns: repeat(3, 1fr);
}

.options_filters > div {
  display: flex;
  width: 100%;

  gap: 0.5em;

  button {
    width: 100%;
    color: springgreen;
    font-weight: bold;

    &[data-inactive='true'] {
      color: #aaa;
    }
  }
}

.filter-actions {
  display: flex;
  gap: 0.5em;
  width: 100%;

  margin-top: 1em;

  > * {
    width: 100%;
  }
}
</style>
