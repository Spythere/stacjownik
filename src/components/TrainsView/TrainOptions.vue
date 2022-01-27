<template>
  <div class="train-options">
    <div class="options_wrapper">
      <select-box
        :title="$t('trains.option-distance')"
        :itemList="translatedSorterOptions"
        :defaultItemIndex="0"
        :prefix="$t('trains.sorter-prefix')"
        @selected="changeSorter"
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
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
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
      {
        id: 'timetable',
        value: 'numer pociągu',
      },
    ];

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
    };
  },

  methods: {
    changeSorter(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;
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

.options_wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  margin-bottom: 0.5em;

  @include smallScreen() {
    justify-content: center;
    flex-direction: column;
  }
}

.select-box {
  margin: 0.5em 0;
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;

    margin: 0.5em 0 0.5em 0.5em;

    @include smallScreen() {
      width: 85%;
    }
  }

  &-input {
    border: none;

    min-width: 85%;
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
</style>
