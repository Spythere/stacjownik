<template>
  <section class="filter-card" v-click-outside="closeCard">
    <div class="card_btn">
      <action-button @click="toggleCard">
        <img class="button_icon" :src="filterIcon" alt="icon-filter" />
        <p>{{ $t('options.filters') }}</p>
      </action-button>
    </div>

    <transition name="card-anim">
      <div class="card_content card" v-if="isVisible">
        <div class="card_exit" @click="closeCard"></div>

        <div class="options_wrapper">
          <div class="options_content">
            <div class="content_select">
              <select-box
                :itemList="translatedSorterOptions"
                :defaultItemIndex="0"
                @selected="changeSorter"
                :prefix="$t('trains.sorter-prefix')"
              />
            </div>

            <div class="content_search">
              <div class="search-box">
                <input class="search-input" v-model="searchedTrain" :placeholder="$t('trains.search-train')" />

                <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => (searchedTrain = '')" />
              </div>

              <div class="search-box">
                <input class="search-input" v-model="searchedDriver" :placeholder="$t('trains.search-driver')" />

                <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => (searchedDriver = '')" />
              </div>
            </div>
          </div>
        </div>

        <section class="card_actions flex">
          <action-button class="outlined">
            {{ $t('filters.reset') }}
          </action-button>
          <action-button class="outlined" @click="closeCard">{{ $t('filters.close') }}</action-button>
        </section>
      </div>
    </transition>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject } from '@vue/runtime-core';

import inputData from '@/data/options.json';

import ActionButton from '@/components/Global/ActionButton.vue';
import { sorterOptions } from '@/data/trainOptions';
import { TrainFilter, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { ActionButton, SelectBox },
  emits: ['changeFilterValue', 'invertFilters', 'resetFilters'],

  data: () => ({
    filterIcon: require('@/assets/icon-filter2.svg'),
    exitIcon: require('@/assets/icon-exit.svg'),

    inputs: { ...inputData },
  }),

  setup() {
    const isVisible = inject('isTrainOptionsCardVisible');

    const { t } = useI18n();

    let filterList = inject('filterList') as TrainFilter[];

    const translatedSorterOptions = computed(() =>
      sorterOptions.map(({ id }) => ({
        id,
        value: t(`trains.option-${id}`),
      }))
    );

    return {
      translatedSorterOptions,
      searchedTrain: inject('searchedTrain') as string,
      searchedDriver: inject('searchedDriver') as string,
      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      filterList,
      isVisible,
    };
  },

  methods: {
    closeCard() {
      this.isVisible = false;
    },

    toggleCard() {
      this.isVisible = !this.isVisible;
    },

    changeSorter(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
    },

    toggleFilter(filter: TrainFilter) {
      filter.isActive = !filter.isActive;
    },

    setFilterOnly(filter: TrainFilter) {
      this.filterList.forEach((f) => (f.isActive = f.id == filter.id));
    },

    resetFilters() {
      this.filterList.forEach((f) => (f.isActive = true));
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive';
@import '../../styles/card';

.card-anim {
  &-enter-active,
  &-leave-active {
    transition: all $animDuration $animType;
  }

  &-enter-from,
  &-leave-to {
    transform: translate(-50%, -50%) scale(0.85);
    opacity: 0;
  }
}

.card {
  section {
    margin: 0.5em 0;
  }

  &_title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

    margin: 0.5em 0;

    text-align: center;
  }
}
</style>
