<template>
  <div class="dropdown" @keydown.esc="showOptions = false">
    <div class="dropdown_background" v-if="showOptions" @click="showOptions = false"></div>

    <button class="filter-button btn--filled btn--image" @click="toggleShowOptions" ref="button">
      <img src="/images/icon-filter2.svg" alt="Open filters icon" />
      [F] {{ $t('options.filters') }}
      <span class="active-indicator" v-if="currentOptionsActive"></span>
    </button>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="showOptions">
        <div class="options_content">
          <h1 class="option-title">{{ $t('options.search-title') }}</h1>
          <div class="search_content">
            <div class="search-box">
              <input
                v-model="searchedTrain"
                class="search-input"
                ref="initFocusedElement"
                id="train-search"
                name="train-search"
                @focus="preventKeyDown = true"
                @blur="preventKeyDown = false"
                :placeholder="$t(`options.search-train`)"
              />
              <button class="btn btn--action search-exit" @click="onInputClear('train')">
                <img src="/images/icon-exit.svg" alt="Trains search clear icon" />
              </button>
            </div>

            <div class="search-box">
              <datalist id="search-active-driver">
                <option v-for="driverName in activeDriverNames" :value="driverName">
                  {{ driverName }}
                </option>
              </datalist>

              <input
                class="search-input"
                list="search-active-driver"
                name="search-active-driver"
                id="search-active-driver"
                :placeholder="$t(`options.search-driver`)"
                v-model="searchedDriver"
                @focus="preventKeyDown = true"
                @blur="preventKeyDown = false"
              />

              <button class="btn btn--action search-exit" @click="onInputClear('driver')">
                <img src="/images/icon-exit.svg" alt="Trains search clear icon" />
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
            <button class="btn--action" @click="resetAllFilters">
              {{ $t('options.filter-reset') }}
            </button>
          </div>
        </div>

        <div tabindex="0" @focus="showOptions = false"></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue';
import keyMixin from '../../mixins/keyMixin';
import { TrainFilter, TrainFilterSection } from './typings';
import { useMainStore } from '../../store/mainStore';

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
      store: useMainStore(),
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
    },

    activeDriverNames() {
      const driverNameSet = new Set<string>();

      this.store.trainList.forEach((train) => {
        driverNameSet.add(train.driverName);
      });

      return [...driverNameSet].sort((a, b) => a.localeCompare(b));
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

      this.sorterActive.id = 'routeDistance';
      this.sorterActive.dir = -1;

      this.searchedDriver = '';
      this.searchedTrain = '';
    },

    onInputClear(id: 'driver' | 'train') {
      if (id == 'driver') this.searchedDriver = '';
      if (id == 'train') this.searchedTrain = '';
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/dropdown';
@use '../../styles/dropdown-filters';

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
  margin-top: 1em;

  > * {
    width: 100%;
  }
}
</style>
