<template>
  <div class="filters-options">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="btn--image" @click="showOptions = !showOptions" ref="button">
      <img :src="getIcon('filter2')" alt="Open filters" />
      {{ $t('options.filters') }} [F]
    </button>

    <transition name="options-anim">
      <div class="options_wrapper" v-if="showOptions">
        <div class="options_content">
          <h1 class="option-title">{{ $t('options.search-title') }}</h1>
          <div class="search_content">
            <div class="search" v-for="(_, propName) in searchersValues" :key="propName">
              <label v-if="propName == 'search-date'" for="date">{{ $t('options.search-date') }}</label>

              <div class="search-box">
                <input
                  v-if="propName == 'search-date'"
                  class="search-input"
                  id="date"
                  type="date"
                  min="2022-02-01"
                  @keydown.enter="onSearchConfirm"
                  v-model="searchersValues[propName]"
                />

                <input
                  v-else
                  class="search-input"
                  @keydown.enter="onSearchConfirm"
                  @focus="preventKeyDown = true"
                  @blur="preventKeyDown = false"
                  :placeholder="$t(`options.${propName}`)"
                  v-model="searchersValues[propName]"
                />

                <button class="search-exit">
                  <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear(propName)" />
                </button>
              </div>
            </div>

            <div class="search_actions">
              <action-button class="search-button" @click="onResetButtonClick">
                {{ $t('options.reset-button') }}
              </action-button>

              <action-button class="search-button" @click="onSearchButtonConfirm">
                {{ $t('options.search-button') }}
              </action-button>
            </div>
          </div>

          <h1 class="option-title">{{ $t('options.sort-title') }}</h1>
          <div class="options_sorters">
            <div v-for="opt in translatedSorterOptions">
              <button class="sort-option" :data-selected="opt.id == sorterActive.id" @click="onSorterChange(opt)">
                {{ opt.value.toUpperCase() }}
              </button>
            </div>
          </div>

          <h1 class="option-title" v-if="filters.length != 0">{{ $t('options.filter-title') }}</h1>
          <div class="options_filters">
            <button
              v-for="filter in filters"
              class="filter-option btn--option"
              :class="{ checked: journalFilterActive.id === filter.id }"
              :id="filter.id"
              @click="onFilterChange(filter)"
            >
              {{ $t(`options.filter-${filter.id}`) }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, Prop, PropType } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import keyMixin from '../../mixins/keyMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { JournalTimetableFilter } from '../../types/Journal/JournalTimetablesTypes';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['onSearchConfirm', 'onOptionsReset'],
  mixins: [imageMixin, keyMixin],

  props: {
    sorterOptionIds: {
      type: Array as PropType<Array<string>>,
      required: true,
    },

    filters: {
      type: Array as PropType<JournalTimetableFilter[]>,
      default: [],
    },

    dataStatus: {
      type: Number as PropType<DataStatus>,
      default: DataStatus.Initialized,
    },
  },

  data() {
    return {
      showOptions: false,
      DataStatus,
    };
  },

  setup() {
    return {
      searchersValues: inject('searchersValues') as { [key: string]: string },
      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      journalFilterActive: inject('journalFilterActive') as JournalTimetableFilter,
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
      this.showOptions = !this.showOptions;

      this.$nextTick(() => {
        if (this.showOptions) (this.$refs['button'] as HTMLButtonElement)?.focus();
      });
    },

    focusEnd() {
      console.log('focus end');
    },

    onSorterChange(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
      this.$emit('onSearchConfirm');
    },

    onFilterChange(filter: JournalTimetableFilter) {
      this.journalFilterActive = filter;
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
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/filters_options.scss';
</style>
