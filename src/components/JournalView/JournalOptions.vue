<template>
  <div class="filters-options" @keydown.esc="showOptions = false">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <div class="actions-bar">
      <button
        class="filter-button btn--filled btn--image"
        @click="showOptions = !showOptions"
        ref="button"
      >
        <img :src="getIcon('filter2')" alt="Open filters" />
        {{ $t('options.filters') }} [F]
        <span class="active-indicator" v-if="currentOptionsActive"></span>
      </button>

      <button class="filter-button btn--filled btn--image" @click="refreshData">
        <img :src="getIcon('refresh')" alt="Refresh data" />
        {{ $t('general.refresh') }}
      </button>
    </div>

    <datalist id="search-driver">
      <option v-for="(sugg, i) in driverSuggestions" :key="i" :value="sugg"></option>
    </datalist>

    <datalist id="search-dispatcher">
      <option v-for="(sugg, i) in dispatcherSuggestions" :key="i" :value="sugg"></option>
    </datalist>

    <transition name="options-anim">
      <div class="options_wrapper" v-if="showOptions">
        <div class="options_content">
          <h1 class="option-title">{{ $t('options.search-title') }}</h1>
          <div class="search_content">
            <div class="search" v-for="(_, propName) in searchersValues" :key="propName">
              <label v-if="propName == 'search-date'" for="date">{{
                $t(`options.search-${optionsType}-date`)
              }}</label>

              <div class="search-box">
                <input
                  class="search-input"
                  v-model="searchersValues[propName]"
                  @keydown.enter="onSearchConfirm"
                  @focus="preventKeyDown = true"
                  @blur="preventKeyDown = false"
                  :placeholder="$t(`options.${propName}`)"
                  :type="propName == 'search-date' ? 'date' : 'text'"
                  :min="propName == 'search-date' ? '2022-02-01' : undefined"
                  :list="propName.toString()"
                />

                <button class="search-exit" v-if="propName != 'search-date'">
                  <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear(propName)" />
                </button>
              </div>
            </div>
          </div>

          <h1 class="option-title">{{ $t('options.sort-title') }}</h1>
          <div class="options_sorters">
            <div v-for="opt in translatedSorterOptions" :key="opt.id">
              <button
                class="sort-option btn--option"
                :data-selected="opt.id == sorterActive.id"
                @click="onSorterChange(opt)"
              >
                {{ opt.value.toUpperCase() }}
              </button>
            </div>
          </div>

          <h1 class="option-title" v-if="filters.length != 0">{{ $t('options.filter-title') }}</h1>

          <div class="options_filter-sections" v-if="filters.length != 0 && filterList">
            <section class="filter-section" v-for="section in JournalFilterSection" :key="section">
              <p>{{ $t(`options.filter-section-${section}`) }}</p>

              <div class="options_filters">
                <button
                  v-for="filter in filterList.filter((f) => f.filterSection == section)"
                  :key="filter.id"
                  class="filter-option btn--option"
                  :class="{ checked: filter.isActive }"
                  :id="filter.id"
                  @click="onFilterChange(filter)"
                >
                  {{ $t(`options.filter-${filter.id}`) }}
                </button>
              </div>
            </section>
          </div>

          <div class="options_actions">
            <button class="btn--action" @click="onResetButtonClick">
              {{ $t('options.reset-button') }}
            </button>
            <button class="btn--action" @click="onSearchButtonConfirm">
              {{ $t('options.search-button') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, inject, PropType } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import keyMixin from '../../mixins/keyMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { DriverStatsAPIData } from '../../scripts/interfaces/api/DriverStatsAPIData';
import { URLs } from '../../scripts/utils/apiURLs';
import { useStore } from '../../store/store';
import { JournalFilterSection } from '../../scripts/enums/JournalFilterType';
import { JournalFilter } from '../../scripts/types/JournalTimetablesTypes';

export default defineComponent({
  emits: ['onSearchConfirm', 'onOptionsReset', 'onRefreshData'],
  mixins: [imageMixin, keyMixin],

  props: {
    sorterOptionIds: {
      type: Array as PropType<Array<string>>,
      required: true
    },

    filters: {
      type: Array as PropType<JournalFilter[]>,
      default: () => []
    },

    dataStatus: {
      type: Number as PropType<DataStatus>,
      default: DataStatus.Initialized
    },

    currentOptionsActive: {
      type: Boolean,
      default: false
    },

    optionsType: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      showOptions: false,
      JournalFilterSection,

      driverSuggestions: [] as string[],
      dispatcherSuggestions: [] as string[],

      searchTimeout: 0,
      store: useStore(),

      DataStatus
    };
  },

  setup() {
    return {
      searchersValues: inject('searchersValues') as { [key: string]: string },
      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      filterList: inject('filterList') as JournalFilter[] | undefined
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

  watch: {
    async driverStatsName() {
      await this.fetchDriverStats();

      // if (value) this.store.currentStatsTab = 'driver';
    },

    async 'searchersValues.search-driver'(value: string | undefined) {
      clearTimeout(this.searchTimeout);

      if (!value || value == '') return;
      if (value.length < 3) return;

      this.startSearchTimeout('driver', value);
    },

    async 'searchersValues.search-dispatcher'(value: string | undefined) {
      if (!value || value == '') return;
      if (value.length < 3) return;

      this.startSearchTimeout('dispatcher', value);
    }
  },

  methods: {
    async fetchDriverStats() {
      this.store.driverStatsData = undefined;

      if (!this.store.driverStatsName) {
        this.store.driverStatsStatus = DataStatus.Initialized;
        return;
      }

      try {
        this.store.driverStatsStatus = DataStatus.Loading;

        const statsData: DriverStatsAPIData = await (
          await axios.get(
            `${URLs.stacjownikAPI}/api/getDriverInfo?name=${this.store.driverStatsName}`
          )
        ).data;

        this.store.driverStatsData = statsData;
        this.store.driverStatsStatus = DataStatus.Loaded;
      } catch (error) {
        this.store.driverStatsStatus = DataStatus.Error;
        console.error('Ups! Wystąpił błąd przy próbie pobrania statystyk maszynisty! :/');
      }
    },

    refreshData() {
      this.$emit('onRefreshData');
    },

    startSearchTimeout(type: 'driver' | 'dispatcher', value: string) {
      if (this[`${type}Suggestions`].includes(value)) return;

      window.clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(async () => {
        try {
          const suggestions: string[] = await (
            await axios.get(`${URLs.stacjownikAPI}/api/get${type}Suggestions?name=${value}`)
          ).data;

          this[`${type}Suggestions`] = suggestions;
        } catch (error) {
          this[`${type}Suggestions`] = [];
        }
      }, 450);
    },

    // Override keyMixin function
    onKeyDownFunction() {
      this.showOptions = !this.showOptions;

      this.$nextTick(() => {
        if (this.showOptions) (this.$refs['button'] as HTMLButtonElement)?.focus();
      });
    },

    onSorterChange(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
      this.$emit('onSearchConfirm');
    },

    onFilterChange(filter: JournalFilter) {
      // this.journalFilterActive = filter;
      this.filterList
        ?.filter((f) => f.filterSection === filter.filterSection)
        .forEach((f) => (f.isActive = false));
      filter.isActive = true;

      this.$emit('onSearchConfirm');
    },

    onInputClear(id: any) {
      this.searchersValues[id] = '';
      this.$emit('onSearchConfirm');
    },

    onSearchConfirm() {
      this.$emit('onSearchConfirm');
    },

    onSearchButtonConfirm() {
      this.showOptions = false;
      this.$emit('onSearchConfirm');
    },

    onResetButtonClick() {
      this.$emit('onOptionsReset');
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/filters_options.scss';
</style>
