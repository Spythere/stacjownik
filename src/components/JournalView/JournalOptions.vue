<template>
  <div class="journal-options">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="btn--open" @click="showOptions = !showOptions">
      <img :src="getIcon('filter2')" alt="Open filters" />
      FILTRY
    </button>

    <transition name="options-anim">
      <div class="options_wrapper" v-if="showOptions">
        <div class="options_content">
          <h1>{{ $t('options.sort-title') }}</h1>

          <div class="options_sorters">
            <div v-for="opt in translatedSorterOptions">
              <button class="sort-option" :data-selected="opt.id == sorterActive.id" @click="onSorterChange(opt)">
                {{ opt.value.toUpperCase() }}
              </button>
            </div>
          </div>

          <h1 v-if="filters.length != 0">{{ $t('options.filter-title') }}</h1>
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

          <h1>{{ $t('options.search-title') }}</h1>
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
                  :placeholder="$t(`options.${propName}`)"
                  v-model="searchersValues[propName]"
                />

                <button class="search-exit">
                  <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear(propName)" />
                </button>
              </div>
            </div>

            <div class="search_actions">
              <action-button class="search-button" @click="onSearchConfirm">
                {{ $t('options.search-button') }}
              </action-button>

              <action-button class="search-button" @click="onResetButtonClick">
                {{ $t('options.reset-button') }}
              </action-button>
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
import { JournalFilter } from '../../types/Journal/JournalTimetablesTypes';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['onSearchConfirm', 'onOptionsReset'],
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

  data() {
    return {
      showOptions: false,
    };
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
        value: this.$t(`options.sort-${id}`),
      }));
    },
  },

  methods: {
    onSorterChange(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
      this.$emit('onSearchConfirm');
    },

    onFilterChange(filter: JournalFilter) {
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

    onResetButtonClick() {
      this.$emit('onOptionsReset');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/search_box.scss';
@import '../../styles/variables.scss';

.options-anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  &-enter-active,
  &-leave-active {
    transition: all 150ms ease;
  }
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  z-index: 10;
}

.journal-options {
  position: relative;
}

.options_wrapper {
  position: absolute;

  background-color: #111111ee;
  box-shadow: 0 0 10px 2px #111;

  width: 100%;
  max-width: 500px;

  padding: 1em;

  z-index: 100;
}

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

.options_sorters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  padding: 0.25em 0.25em 0 0;
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

.sort-option[data-selected='true'] {
  color: $accentCol;
  font-weight: bold;
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

.search_content > div {
  margin: 0.5em auto;
}

.search_content > button {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}

.search_actions {
  display: flex;

  button {
    margin: 0.25em 0.5em;
  }
}

@include smallScreen() {
  h1 {
    text-align: center;

    &::before {
      width: 75%;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .options_wrapper {
    max-width: 100%;
  }

  .btn--open {
    margin: 0 auto;
  }

  .filter-option,
  .sort-option {
    margin: 0.25em 0.25em;
  }

  .options_filters,
  .options_sorters {
    justify-content: center;
  }

  // .options {
  //   &_wrapper {
  //     justify-content: center;
  //     align-items: center;
  //   }

  //   &_content {
  //     padding: 0 1em;

  //     flex-direction: column;

  //     .content_select {
  //       margin: 0 auto;
  //       padding: 0;
  //     }

  //     .content_search {
  //       justify-content: center;
  //     }
  //   }
  // }
}
</style>