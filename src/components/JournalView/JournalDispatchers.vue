<template>
  <section class="journal-timetables">
    <div class="journal_wrapper">
      <JournalOptions
        @on-filter-change="search"
        @on-input-change="search"
        @on-sorter-change="search"
        :sorter-option-ids="['timestampFrom', 'duration']"
      />

      <div class="timetables_wrapper" ref="scrollElement">
        <transition name="warning" mode="out-in">
          <div :key="dataStatus">
            <Loading v-if="dataStatus == (DataStatus.Loading || DataStatus.Initialized)" />

            <div v-else-if="dataStatus == DataStatus.Error" class="journal_warning error">
              {{ $t('app.error') }}
            </div>

            <div class="journal_warning" v-else-if="historyList.length == 0">
              {{ $t('app.no-result') }}
            </div>

            <div v-else>
              <JournalDispatchersList :dispatcherHistory="computedHistoryList" />

              <button
                class="btn btn--option btn--load-data"
                v-if="!scrollNoMoreData && scrollDataLoaded"
                @click="addHistoryData"
              >
                {{ $t('journal.load-data') }}
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
      <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, JournalFilter, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import ActionButton from '../../components/Global/ActionButton.vue';
import JournalOptions from '../../components/JournalView/JournalOptions.vue';
import DispatcherStats from '../../components/JournalView/DispatcherStats.vue';
import SearchBox from '../Global/SearchBox.vue';

import Loading from '../Global/Loading.vue';
import { URLs } from '../../scripts/utils/apiURLs';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { useStore } from '../../store/store';
import JournalDispatchersList from './JournalDispatchersList.vue';
import { JournalDispatcherSearcher } from '../../types/JournalDispatcherTypes';
import { DispatcherHistory } from '../../scripts/interfaces/api/DispatchersAPIData';

const DISPATCHERS_API_URL = `${URLs.stacjownikAPI}/api/getDispatchers`;

export default defineComponent({
  components: { SearchBox, ActionButton, JournalOptions, DispatcherStats, Loading, JournalDispatchersList },
  name: 'JournalDispatchers',

  props: {
    sceneryName: {
      type: String,
      required: false,
    },

    dispatcherName: {
      type: String,
      required: false,
    },
  },

  data: () => ({
    currentQuery: '',
    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,

    dataStatus: DataStatus.Initialized,
    DataStatus,

    historyList: [] as DispatcherHistory[],
  }),

  setup() {
    const sorterActive = ref({ id: 'timestampFrom', dir: -1 });
    const journalFilterActive = ref({});

    const searchersValues = reactive({
      'search-dispatcher': '',
      'search-station': '',
    } as JournalDispatcherSearcher);

    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);
    provide('searchersValues', searchersValues);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      store: useStore(),

      sorterActive,
      searchersValues,

      countFromIndex,
      countLimit,

      scrollElement,
      maxCount: ref(15),
    };
  },

  computed: {
    computedHistoryList() {
      return this.historyList.filter(
        (doc) => doc.isOnline || (doc.currentDuration && doc.currentDuration > 10 * 60000)
      );
    },
  },

  activated() {
    if (this.sceneryName || this.dispatcherName) {
      this.searchersValues['search-station'] = this.sceneryName?.toString() || '';
      this.searchersValues['search-dispatcher'] = this.dispatcherName?.toString() || '';
      this.search();
    }

    window.addEventListener('scroll', this.handleScroll);
  },

  mounted() {
    if (!this.sceneryName && !this.dispatcherName) {
      this.search();
    }
  },

  deactivated() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    closeDispatcherStatsCard() {
      this.statsCardOpen = false;
    },

    handleScroll() {
      this.showReturnButton = window.scrollY > window.innerHeight;

      const element = this.$refs.scrollElement as HTMLElement;

      if (
        element.getBoundingClientRect().bottom * 0.85 < window.innerHeight &&
        this.scrollDataLoaded &&
        !this.scrollNoMoreData &&
        this.dataStatus == DataStatus.Loaded
      )
        this.addHistoryData();
    },

    search() {
      this.fetchHistoryData({
        searchers: this.searchersValues,
      });

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      const countFrom = this.historyList.length;

      const responseData: DispatcherHistory[] = await (
        await axios.get(`${DISPATCHERS_API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData(
      props: {
        searchers?: JournalDispatcherSearcher;
        filter?: JournalFilter;
      } = {}
    ) {
      this.dataStatus = DataStatus.Loading;

      const queries: string[] = [];

      // const dispatcher = props.searchers?.find((s) => s.id == 'search-dispatcher')?.value.trim();
      // const station = props.searchers?.find((s) => s.id == 'search-station')?.value.trim();

      const dispatcher = props.searchers?.['search-dispatcher'].trim();
      const station = props.searchers?.['search-station'].trim();

      if (dispatcher) queries.push(`dispatcherName=${dispatcher}`);
      if (station) queries.push(`stationName=${station}`);

      // Z API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'timestampFrom') queries.push('sortBy=timestampFrom');
      else if (this.sorterActive.id == 'duration') queries.push('sortBy=currentDuration');
      else queries.push('sortBy=timestampFrom');

      queries.push('countLimit=15');

      this.currentQuery = queries.join('&');

      try {
        const responseData: DispatcherHistory[] = await (
          await axios.get(`${DISPATCHERS_API_URL}?${this.currentQuery}`)
        ).data;

        if (!responseData) {
          this.dataStatus = DataStatus.Error;
          return;
        }

        if (!responseData) return;

        // Response data exists
        this.historyList = responseData;

        // Stats display
        this.store.dispatcherStatsName =
          this.historyList.length > 0 && this.searchersValues['search-dispatcher'].trim()
            ? this.historyList[0].dispatcherName
            : '';

        this.dataStatus = DataStatus.Loaded;
      } catch (error) {
        this.dataStatus = DataStatus.Error;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalSection.scss';
</style>
