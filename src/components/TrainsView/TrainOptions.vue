<template>
  <div class="filters-options" @keydown.esc="showOptions = false">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="btn--filled btn--image" @click="toggleShowOptions" ref="button">
      <img :src="getIcon('filter2')" alt="Open filters" />
      {{ $t('options.filters') }} [F]
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
                <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear('train')" />
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
                <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear('driver')" />
              </button>
            </div>
          </div>

          <h1 class="option-title">{{ $t('options.sort-title') }}</h1>
          <div class="options_sorters">
            <div v-for="opt in translatedSorterOptions">
              <button
                class="sort-option btn--option"
                :data-selected="opt.id == sorterActive.id"
                @click="onSorterChange(opt)"
              >
                {{ opt.value.toUpperCase() }}
              </button>
            </div>
          </div>

          <h1 class="option-title" v-if="trainFilterList.length != 0">{{ $t('options.filter-title') }}</h1>
          <div class="options_filters">
            <div class="filter-option" v-for="filter in trainFilterList">
              <button class="btn--option" :data-disabled="!filter.isActive" @click="onFilterChange(filter)">
                {{ $t(`options.filter-${filter.id}`) }}
              </button>
            </div>

            <div class="filter-actions">
              <button class="btn--action" @click="clearAllFilters">{{ $t('options.filter-clear') }}</button>
              <button class="btn--action" @click="resetAllFilters">{{ $t('options.filter-reset') }}</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import keyMixin from '../../mixins/keyMixin';
import { TrainFilter } from '../../types/Trains/TrainOptionsTypes';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  mixins: [imageMixin, keyMixin],

  props: {
    sorterOptionIds: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
  },

  data() {
    return {
      showOptions: false,
    };
  },

  setup() {
    return {
      searchedTrain: inject('searchedTrain') as string,
      searchedDriver: inject('searchedDriver') as string,

      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      trainFilterList: inject('filterList') as TrainFilter[],
    };
  },

  computed: {
    translatedSorterOptions() {
      return this.$props.sorterOptionIds.map((id) => ({
        id,
        value: this.$t(`options.sort-${id}`),
      }));
    },
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
    },
  },
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

.filter-option {
  button {
    color: white;
    font-weight: bold;

    &[data-disabled='true'] {
      color: #888;
    }
  }
}

.filter-actions {
  display: flex;
  gap: 0.5em;
  width: 100%;

  margin-top: 1em;

  button {
    width: 100%;
  }
}
</style>
