<template>
  <div class="journal-options">
    <button class="btn--open">
      <img :src="getIcon('filter2')" alt="Open filters" />

      FILTRY
    </button>

    <div class="options_wrapper">
      <div class="options_content">
        <h1>SORTUJ WG:</h1>

        <div class="content_select">
          <!-- <select-box
            :itemList="translatedSorterOptions"
            :defaultItemIndex="0"
            @selected="onSorterChange"
            :prefix="$t('journal.sort-prefix')"
          /> -->

          <div v-for="opt in translatedSorterOptions">
            <button class="sort-option">{{ opt.value.toUpperCase() }}</button>
          </div>
        </div>

        <h1>SZUKAJ:</h1>

        <div class="content_search">
          <div class="search-box" v-for="(value, propName) in searchersValues" :key="propName">
            <input
              class="search-input"
              :placeholder="$t(`journal.${propName}`)"
              v-model="searchersValues[propName]"
              @keydown.enter="onInputSearch"
            />

            <button class="search-exit">
              <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear(propName)" />
            </button>
          </div>

          <div class="search-box">
            <input class="search-input" placeholder="Data" type="date" />

            <button class="search-exit">
              <img :src="getIcon('exit')" alt="exit-icon" />
            </button>
          </div>

          <action-button class="search-button" @click="onInputSearch">
            {{ $t('journal.search') }}
          </action-button>
        </div>
      </div>

      <h1>FILTRUJ WG:</h1>
      <div class="options_filters">
        <button
          v-for="filter in filters"
          class="filter-option btn--option"
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
import imageMixin from '../../mixins/imageMixin';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['onSorterChange', 'onInputChange', 'onFilterChange'],
  mixins: [imageMixin],

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

  setup() {
    return {
      searchersValues: inject('searchersValues') as { [key: string]: string },
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

    onInputClear(id: any) {
      this.searchersValues[id] = '';
      this.onInputSearch();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/search_box.scss';
@import '../../styles/variables.scss';

.btn--open {
  display: flex;

  padding: 0.4em 1em;
  font-weight: bold;
  font-size: 1em;

  border-radius: 0.75em 0.75em 0 0;

  img {
    height: 1.3em;
    margin-right: 0.5em;
  }
}

h1 {
  position: relative;
  font-size: 1.1em;
  margin: 0.7em 0 0.25em 0;

  &::before {
    content: '';
    position: absolute;
    top: -4px;

    width: 50%;
    height: 2px;
    background-color: white;
    border-radius: 2px;
  }
}

.journal-options {
  position: relative;
}

.options_wrapper {
  position: absolute;

  background-color: #111111dd;
  padding: 1em;

  z-index: 100;
}

.content_select {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 0.25em 0.25em 0 0;
}

.content_search > div {
  margin: 0.5em auto;
}

.content_search > button {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.options_filters {
  display: flex;
  flex-wrap: wrap;
  margin: 0.5em 0 0 0;
}

.sort-option,
.filter-option {
  margin: 0 0.25em 0 0;
}

.filter-option {
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

      .filter-option {
        margin: 0.25em 0.25em;
      }
    }
  }
}
</style>
