<template>
  <div class="journal-options">
    <div class="options_wrapper">
      <div class="options_content">
        <div class="content_select">
          <select-box
            :itemList="translatedSorterOptions"
            :defaultItemIndex="0"
            @selected="onSorterChange"
            :prefix="$t('journal.sort-prefix')"
          />
        </div>

        <div class="content_search">
          <div class="search-box" v-for="search in searchersValues" :key="search.id">
            <input
              class="search-input"
              :placeholder="$t(`journal.${search.id}`)"
              v-model="search.value"
              @keydown.enter="onInputSearch"
            />

            <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="onInputClear(search.id)" />
          </div>
          <!-- <div class="search-box">
            <input
              class="search-input"
              v-model="searchedTrain"
              :placeholder="$t('journal.search-train')"
              @keydown.enter="search"
            />

            <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="clearTrain" />
          </div>

          <div class="search-box">
            <input
              class="search-input"
              v-model="searchedDriver"
              :placeholder="$t('journal.search-driver')"
              @keydown.enter="search"
            />

            <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="clearDriver" />
          </div> -->

          <action-button class="search-button" @click="onInputSearch">
            {{ $t('journal.search') }}
          </action-button>
        </div>
      </div>

      <div class="options_filters">
        <button
          v-for="filter in filters"
          class="journal-filter-option btn--option"
          :class="{ checked: journalFilterActive.id === filter.id }"
          :id="filter.id"
          @click="onFilterChange(filter)"
        >
          {{ $t(`journal.filter-${filter.id}`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, JournalFilter, PropType } from 'vue';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['onSorterChange', 'onInputChange', 'onFilterChange'],
  props: {
    sorterOptionIds: {
      type: Array as PropType<Array<string>>,
      required: true,
    },

    filters: {
      type: Array as PropType<JournalFilter[]>,
      default: [],
    },
  },

  data: () => ({
    exitIcon: require('@/assets/icon-exit.svg'),
  }),

  setup() {
    return {
      searchersValues: inject('searchersValues') as {id: string; value: string}[],
      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      journalFilterActive: inject('journalFilterActive') as JournalFilter,
    };
  },

  computed: {
    translatedSorterOptions() {
      return this.$props.sorterOptionIds.map((id) => ({
        id,
        value: this.$t(`journal.option-${id}`),
      }));
    },
  },

  methods: {
    onSorterChange(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;

      this.$emit('onSorterChange');
    },

    onFilterChange(filter: JournalFilter) {
      this.journalFilterActive = filter;
      this.$emit('onFilterChange');
    },

    onInputSearch() {      
      this.$emit('onInputChange');
    },

    onInputClear(id: string) {
      this.searchersValues.find(s => s.id == id)!.value = "";
      this.onInputSearch();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive';
@import '../../styles/option.scss';

.options {
  &_wrapper {
    display: flex;
    flex-direction: column;
  }

  &_content {
    display: flex;
    flex-wrap: wrap;

    .content_search,
    .content_select {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      padding: 0.25em 0.25em 0 0;
    }
  }

  &_filters {
    display: flex;
    flex-wrap: wrap;
    margin: 0.5em 0 0 0;

    .journal-filter-option {
      margin: 0 0.25em 0 0;

      &#abandoned {
        color: salmon;
      }

      &#fulfilled {
        color: lightgreen;
      }

      &#active {
        color: lightblue;
      }
    }
  }
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;
    margin-right: 0.25em;
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

@include smallScreen() {
  .journal-options {
    width: 100%;
  }
  .options {
    &_wrapper {
      justify-content: center;
      align-items: center;
    }

    &_content {
      padding: 0 1em;

      flex-direction: column;

      .content_select {
        margin: 0 auto;
        padding: 0;
      }

      .content_search {
        justify-content: center;
      }
    }

    &_filters {
      justify-content: center;

      .journal-filter-option {
        margin: 0.25em 0.25em;
      }
    }
  }

  .search {
    &-box,
    &-button {
      margin: 0.5em 0 0 0;
    }

    &-box {
      width: 100%;
    }

    &-button {
      width: 80%;
      max-width: 300px;
    }
  }
}
</style>
