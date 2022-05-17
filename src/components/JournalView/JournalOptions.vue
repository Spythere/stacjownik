<template>
  <div class="journal-options">
    <div class="options_wrapper">
      <div class="options_content">
        <div class="content_select">
          <select-box
            :itemList="translatedSorterOptions"
            :defaultItemIndex="0"
            @selected="changeSorter"
            :prefix="$t('journal.sort-prefix')"
          />
        </div>

        <div class="content_search">
          <div class="search-box">
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
          </div>

          <action-button class="search-button" @click="search">
            {{ $t('history.search') }}
          </action-button>
        </div>
      </div>

      <div class="options_filters">
        <button
          v-for="filter in journalFilters"
          class="journal-filter-option btn--option"
          :class="{ checked: journalFilterActive.id === filter.id }"
          :id="filter.id"
          @click="changeJournalFilter(filter)"
        >
          {{ $t(`journal.filter-${filter.id}`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { journalFilters } from '@/data/journalFilters';
import { computed, defineComponent, inject, JournalFilter } from 'vue';
import { useI18n } from 'vue-i18n';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['changedOptions', 'changedFilter'],

  data: () => ({
    exitIcon: require('@/assets/icon-exit.svg'),
    journalFilters,
  }),

  setup() {
    const { t } = useI18n();

    const sorterOptions = ['timetableId', 'beginDate', 'distance', 'total-stops'];

    const translatedSorterOptions = computed(() =>
      sorterOptions.map((id) => ({
        id,
        value: t(`journal.option-${id}`),
      }))
    );

    return {
      translatedSorterOptions,

      searchedTrain: inject('searchedTrain') as string,
      searchedDriver: inject('searchedDriver') as string,
      sorterActive: inject('sorterActive') as { id: string | number; dir: number },
      journalFilterActive: inject('journalFilterActive') as JournalFilter
    };
  },

  methods: {
    changeSorter(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;

      this.$emit('changedOptions');
    },

    changeJournalFilter(filter: JournalFilter) {
      this.journalFilterActive = filter;
      this.$emit('changedFilter');
    },

    search() {
      this.$emit('changedOptions');
    },

    clearDriver() {
      this.searchedDriver = '';
      this.search();
    },

    clearTrain() {
      this.searchedTrain = '';
      this.search();
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
