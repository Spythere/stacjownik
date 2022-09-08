<template>
  <div class="train-options">
    <div class="bg" v-if="showOptions" @click="showOptions = false"></div>

    <button class="btn--open" @click="showOptions = !showOptions">
      <img :src="getIcon('filter2')" alt="Open filters" />
      FILTRY
    </button>

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

        <h1 v-if="trainFilterList.length != 0">{{ $t('options.filter-title') }}</h1>

        <div class="options_filters">
          <div class="filter-option" v-for="filter in trainFilterList">
            <button class="btn--option" :data-disabled="!filter.isActive" @click="onFilterChange(filter)">
              {{ $t(`options.filter-${filter.id}`) }}
            </button>
          </div>
        </div>

        <div class="options_filters">
          <div class="filter-option">
            <button @click="clearAllFilters">WYŁĄCZ WSZYSTKIE FILTRY</button>
          </div>

          <div class="filter-option">
            <button @click="resetAllFilters">ZRESETUJ FILTRY</button>
          </div>
        </div>

        <h1>{{ $t('options.search-title') }}</h1>

        <div class="content_search">
          <div class="search-box">
            <input class="search-input" :placeholder="$t(`options.search-train`)" v-model="searchedTrain" />

            <button class="search-exit">
              <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear('train')" />
            </button>
          </div>

          <div class="search-box">
            <input class="search-input" :placeholder="$t(`options.search-driver`)" v-model="searchedDriver" />

            <button class="search-exit">
              <img :src="getIcon('exit')" alt="exit-icon" @click="onInputClear('driver')" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue';
import imageMixin from '../../mixins/imageMixin';
import { TrainFilter } from '../../types/TrainOptionsTypes';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  mixins: [imageMixin],

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

    test(e: Event) {
      console.log(e.target);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/search_box.scss';
@import '../../styles/variables.scss';

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

  margin-bottom: 0.5em;
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
  margin: 0.25em 0.25em 0.25em 0;
}

.sort-option[data-selected='true'] {
  color: $accentCol;
  font-weight: bold;
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

  .options_filters,
  .options_sorters {
    justify-content: center;
  }
}
</style>
