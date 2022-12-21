<template>
  <section class="journal-timetables">
    <JournalHeader />

    <div class="journal_wrapper">
      <JournalOptions
        @on-search-confirm="searchHistory"
        @on-options-reset="resetOptions"
        :sorter-option-ids="['timestampFrom', 'duration']"
        :data-status="dataStatus"
        :current-options-active="currentOptionsActive"
      />

      <div class="list_wrapper" @scroll="handleScroll">
        <!-- <transition name="warning" mode="out-in"> -->
        <!-- <div :key="dataStatus"> -->
        <Loading v-if="dataStatus == DataStatus.Initialized || dataStatus == DataStatus.Loading" />

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
            v-if="!scrollNoMoreData && scrollDataLoaded && computedHistoryList.length > 15"
            @click="addHistoryData"
          >
            {{ $t('journal.load-data') }}
          </button>
        </div>
        <!-- </div>
        </transition> -->

        <div class="journal_warning" v-if="scrollNoMoreData">
          {{ $t('journal.no-further-data') }}
        </div>

        <div class="journal_warning" v-else-if="!scrollDataLoaded">
          {{ $t('journal.loading-further-data') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import ActionButton from '../components/Global/ActionButton.vue';
import JournalOptions from '../components/JournalView/JournalOptions.vue';
import DispatcherStats from '../components/JournalView/DispatcherStats.vue';
import SearchBox from '../components/Global/SearchBox.vue';

import Loading from '../components/Global/Loading.vue';
import { URLs } from '../scripts/utils/apiURLs';
import { DataStatus } from '../scripts/enums/DataStatus';
import { useStore } from '../store/store';
import JournalDispatchersList from '../components/JournalView/JournalDispatchersList.vue';
import { JournalDispatcherSearcher, JournalDispatcherSorter } from '../types/Journal/JournalDispatcherTypes';
import { DispatcherHistory } from '../scripts/interfaces/api/DispatchersAPIData';
import { JournalTimetableFilter } from '../types/Journal/JournalTimetablesTypes';
import JournalHeader from '../components/JournalView/JournalHeader.vue';

const DISPATCHERS_API_URL = `${URLs.stacjownikAPI}/api/getDispatchers`;

export default defineComponent({
  components: {
    SearchBox,
    ActionButton,
    JournalOptions,
    DispatcherStats,
    Loading,
    JournalDispatchersList,
    JournalHeader,
  },
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
    currentQueryArray: [] as string[],

    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,
    currentOptionsActive: false,

    dataStatus: DataStatus.Initialized,
    DataStatus,

    historyList: [] as DispatcherHistory[],
  }),

  setup() {
    const sorterActive: JournalDispatcherSorter = reactive({ id: 'timestampFrom', dir: -1 });
    const journalFilterActive = ref({});

    const searchersValues = reactive({
      'search-dispatcher': '',
      'search-station': '',
      'search-date': '',
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

  watch: {
    currentQueryArray(q: string[]) {
      this.currentOptionsActive =
        q.length > 2 || q.some((qv) => qv.startsWith('sortBy=') && qv.split('=')[1] != 'timestampFrom');
    },
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
      this.searchHistory();
    }
  },

  mounted() {
    if (!this.sceneryName && !this.dispatcherName) {
      this.searchHistory();
    }
  },

  methods: {
    handleScroll(e: Event) {
      const listElement = e.target as HTMLElement;
      const scrollTop = listElement.scrollTop;
      const elementHeight = listElement.scrollHeight - listElement.offsetHeight;

      if (!this.scrollDataLoaded || this.scrollNoMoreData || this.dataStatus != DataStatus.Loaded) return;

      if (scrollTop > elementHeight * 0.85) this.addHistoryData();
    },

    resetOptions() {
      this.searchersValues['search-station'] = '';
      this.searchersValues['search-dispatcher'] = '';
      this.searchersValues['search-date'] = '';
      this.sorterActive.id = 'timestampFrom';

      this.searchHistory();
    },

    searchHistory() {
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
        filter?: JournalTimetableFilter;
      } = {}
    ) {
      this.dataStatus = DataStatus.Loading;

      const queries: string[] = [];

      const dispatcher = props.searchers?.['search-dispatcher'].trim();
      const station = props.searchers?.['search-station'].trim();
      const dateString = props.searchers?.['search-date'].trim();
      const timestampFrom = dateString ? Date.parse(new Date(dateString).toISOString()) - 120 * 60 * 1000 : undefined;
      const timestampTo = timestampFrom ? timestampFrom + 86400000 : undefined;

      if (dispatcher) queries.push(`dispatcherName=${dispatcher}`);
      if (station) queries.push(`stationName=${station}`);
      if (timestampFrom && timestampTo) queries.push(`timestampFrom=${timestampFrom}`, `timestampTo=${timestampTo}`);

      // Z API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'timestampFrom') queries.push('sortBy=timestampFrom');
      else if (this.sorterActive.id == 'duration') queries.push('sortBy=currentDuration');
      else queries.push('sortBy=timestampFrom');

      queries.push('countLimit=30');

      this.currentQuery = queries.join('&');
      this.currentQueryArray = queries;

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
@import '../styles/JournalSection.scss';
</style>

