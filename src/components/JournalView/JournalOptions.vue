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
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import ActionButton from '../Global/ActionButton.vue';
import SelectBox from '../Global/SelectBox.vue';

export default defineComponent({
  components: { SelectBox, ActionButton },
  emits: ['changedOptions'],

  data: () => ({
    exitIcon: require('@/assets/icon-exit.svg'),
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
    };
  },

  methods: {
    changeSorter(item: { id: string | number; value: string }) {
      this.sorterActive.id = item.id;
      this.sorterActive.dir = -1;

      this.$emit('changedOptions');
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

.journal-options {
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
