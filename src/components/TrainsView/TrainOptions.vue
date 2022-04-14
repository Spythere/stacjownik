<template>
  <div class="train-options">
    <div class="options_wrapper">
      <div class="options_content">
        <select-box
          :itemList="translatedSorterOptions"
          :defaultItemIndex="0"
          @selected="changeSorter"
          :prefix="$t('trains.sorter-prefix')"
        />

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

    <div class="filters">
      <span
        :class="{ active: filter.isActive }"
        class="filter"
        v-for="filter in filterList"
        :key="filter.id"
        tabindex="0"
        @contextmenu="
          (e) => {
            e.preventDefault();
            return false;
          }
        "
        @click.left="toggleFilter(filter)"
        @keydown.enter="toggleFilter(filter)"
        @click.right="setFilterOnly(filter)"
        @keydown.space="setFilterOnly(filter)"
      >
        {{ $t(`trains.filter-${filter.id}`) }}
      </span>

      <span class="filter reset-btn" @click="resetFilters" tabindex="0">
        {{ $t('trains.filter-reset') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, TrainFilter } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox },
  emits: ['changeSearchedTrain', 'changeSearchedDriver', 'changeSorter'],

  data: () => ({
    exitIcon: require('@/assets/icon-exit.svg'),
  }),

  setup() {
    const { t } = useI18n();

    const sorterOptions = [
      {
        id: 'distance',
        value: 'kilometraż',
      },
      {
        id: 'progress',
        value: 'przebyta trasa',
      },
      {
        id: 'delay',
        value: 'opóźnienie',
      },
      {
        id: 'mass',
        value: 'masa',
      },
      {
        id: 'speed',
        value: 'prędkość',
      },
      {
        id: 'length',
        value: 'długość',
      },
    ];

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
    };
  },

  methods: {
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

.train-options {
  @include smallScreen() {
    width: 100%;
  }
}

.options {
  &_wrapper {
    display: flex;
    flex-wrap: wrap;

    @include smallScreen() {
      padding: 0 1em;

      justify-content: center;
    }
  }

  &_content {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    & > * {
        margin-right: 0.25em;
        margin-top: 0.25em;
    }

    @include smallScreen() {
      margin: 0 auto;
      justify-content: center;
    }
  }
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;


    @include smallScreen() {
      flex-grow: 2;
    }
  }

  &-input {
    border: none;

    min-width: 100%;
    padding: 0.35em 0.5em;
  }

  &-exit {
    position: absolute;
    cursor: pointer;

    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    width: 1em;
  }
}

.filters {
  display: flex;
  flex-wrap: wrap;

  margin-top: 0.5em;

  @include smallScreen() {
    justify-content: center;
  }
}

.filter {
  background: #333;
  padding: 0.2em 0.25em;
  margin: 0.25em 0.25em 0 0;
  font-weight: bold;

  cursor: pointer;
  color: gray;

  &.active {
    color: var(--clr-primary);
  }

  &.reset-btn {
    color: salmon;
  }
}
</style>
