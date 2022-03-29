<template>
  <div class="train-options">
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

    <!-- <div class="options_wrapper">
      <select-box
        :title="$t('trains.option-distance')"
        :itemList="translatedSorterOptions"
        :defaultItemIndex="0"
        :prefix="$t('trains.sorter-prefix')"
        @selected="changeSorter"
      />
    </div>

    <div class="options_wrapper">
      <div class="search-box">
        <input class="search-input" v-model="searchedTrain" :placeholder="$t('trains.search-train')" />

        <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => (searchedTrain = '')" />
      </div>

      <div class="search-box">
        <input class="search-input" v-model="searchedDriver" :placeholder="$t('trains.search-driver')" />

        <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="() => (searchedDriver = '')" />
      </div>
    </div> -->
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
        id: 'comments',
        value: 'komentarze',
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
.options {
  &_wrapper {
    display: flex;
    flex-wrap: wrap;

    @include smallScreen() {
      justify-content: center;
    }
  }

  &_content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .content_search,
    .content_select {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }

    @include smallScreen() {
      padding: 0 1em;

      .content_select {
        margin: 0 auto;
      }

      .content_search {
        justify-content: center;
      }
    }
  }
}

.content_search .search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;

    margin: 0.5em 0.5em 0.5em 0;

    @include smallScreen() {
      width: 100%;
      margin: 0.5em auto;
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
</style>
