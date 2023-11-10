<template>
  <section class="journal-dispatchers">
    <JournalHeader />

    <div class="journal_wrapper">
      <JournalOptions
        @on-search-confirm="fetchHistoryData"
        @on-options-reset="resetOptions"
        @on-refresh-data="fetchHistoryData(true)"
        :sorter-option-ids="['timestampFrom', 'duration']"
        :data-status="dataStatus"
        :current-options-active="currentOptionsActive"
        optionsType="dispatchers"
      />

      <div class="journal_refreshed-date" v-if="dataRefreshedAt">
        {{ $t('journal.data-refreshed-at') }}: {{ dataRefreshedAt.toLocaleString($i18n.locale) }}
      </div>

      <div class="list_wrapper" @scroll="handleScroll">
        <JournalDispatchersList
          :dispatcherHistory="computedHistoryList"
          :addHistoryData="addHistoryData"
          :dataStatus="dataStatus"
          :scrollDataLoaded="scrollDataLoaded"
          :scrollNoMoreData="scrollNoMoreData"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import JournalOptions from '../components/JournalView/JournalOptions.vue';
import { URLs } from '../scripts/utils/apiURLs';
import { useStore } from '../store/mainStore';
import JournalDispatchersList from '../components/JournalView/JournalDispatchersList.vue';

import JournalHeader from '../components/JournalView/JournalHeader.vue';
import { LocationQuery } from 'vue-router';
import { Journal } from '../components/JournalView/typings';
import { API } from '../typings/api';
import { Status } from '../typings/common';

const DISPATCHERS_API_URL = `${URLs.stacjownikAPI}/api/getDispatchers`;

export default defineComponent({
  components: {
    JournalOptions,
    JournalDispatchersList,
    JournalHeader
  },
  name: 'JournalDispatchers',

  props: {
    sceneryName: {
      type: String,
      required: false
    },

    dispatcherName: {
      type: String,
      required: false
    }
  },

  data: () => ({
    currentQuery: '',
    currentQueryArray: [] as string[],
    dataRefreshedAt: null as Date | null,

    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,
    currentOptionsActive: false,

    dataStatus: Status.Data.Loading,

    historyList: [] as API.DispatcherHistory.Response
  }),

  setup() {
    const sorterActive: Journal.DispatcherSorter = reactive({ id: 'timestampFrom', dir: -1 });
    const journalFilterActive = ref({});

    const searchersValues = reactive({
      'search-dispatcher': '',
      'search-station': '',
      'search-date': ''
    } as Journal.DispatcherSearcher);

    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);
    provide('searchersValues', searchersValues);
    provide('filterList', reactive([]));

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      store: useStore(),

      sorterActive,
      searchersValues,

      countFromIndex,
      countLimit,

      scrollElement,
      maxCount: ref(15)
    };
  },

  watch: {
    currentQueryArray(q: string[]) {
      this.currentOptionsActive =
        q.length > 2 ||
        q.some((qv) => qv.startsWith('sortBy=') && qv.split('=')[1] != 'timestampFrom');
    }
  },

  computed: {
    computedHistoryList() {
      return this.historyList.filter(
        (doc) => doc.isOnline || (doc.currentDuration && doc.currentDuration > 10 * 60000)
      );
    }
  },

  beforeRouteUpdate(to) {
    this.handleQueries(to.query);
    this.fetchHistoryData();
  },

  activated() {
    this.handleQueries(this.$route.query);
    this.fetchHistoryData();
  },

  methods: {
    handleScroll(e: Event) {
      const listElement = e.target as HTMLElement;
      const scrollTop = listElement.scrollTop;
      const elementHeight = listElement.scrollHeight - listElement.offsetHeight;

      if (!this.scrollDataLoaded || this.scrollNoMoreData || this.dataStatus != Status.Data.Loaded)
        return;

      if (scrollTop > elementHeight * 0.85) this.addHistoryData();
    },

    handleQueries(query: LocationQuery) {
      const queryKeys = Object.keys(query);

      if (queryKeys.includes('sceneryName')) this.setSearchers('', `${query.sceneryName}`, '');
      if (queryKeys.includes('dispatcherName'))
        this.setSearchers('', '', `${query.dispatcherName}`);
    },

    setSearchers(date: string, station: string, dispatcher: string) {
      this.searchersValues['search-date'] = date;
      this.searchersValues['search-station'] = station;
      this.searchersValues['search-dispatcher'] = dispatcher;
    },

    resetOptions() {
      this.setSearchers('', '', '');
      this.sorterActive.id = 'timestampFrom';

      this.fetchHistoryData();
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      this.countFromIndex = this.historyList.length;

      const responseData: API.DispatcherHistory.Response = await (
        await axios.get(
          `${DISPATCHERS_API_URL}?${this.currentQuery}&countFrom=${this.countFromIndex}`
        )
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData(reset = false) {
      const queries: string[] = [];

      const dispatcher = this.searchersValues['search-dispatcher'].trim();
      const station = this.searchersValues['search-station'].trim();
      const dateString = this.searchersValues['search-date'].trim();

      const timestampFrom = dateString
        ? Date.parse(new Date(dateString).toISOString()) - 120 * 60 * 1000
        : undefined;
      const timestampTo = timestampFrom ? timestampFrom + 86400000 : undefined;

      if (dispatcher) queries.push(`dispatcherName=${dispatcher}`);
      if (station) queries.push(`stationName=${station}`);
      if (timestampFrom && timestampTo)
        queries.push(`timestampFrom=${timestampFrom}`, `timestampTo=${timestampTo}`);

      // API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'timestampFrom') queries.push('sortBy=timestampFrom');
      else if (this.sorterActive.id == 'duration') queries.push('sortBy=currentDuration');
      else queries.push('sortBy=timestampFrom');

      queries.push('countLimit=30');

      if (this.currentQuery != queries.join('&')) this.dataStatus = Status.Data.Loading;

      this.currentQuery = queries.join('&');
      this.currentQueryArray = queries;

      try {
        if (reset) this.dataStatus = Status.Data.Loading;

        const responseData: API.DispatcherHistory.Response = await (
          await axios.get(`${DISPATCHERS_API_URL}?${this.currentQuery}`)
        ).data;

        if (!responseData) {
          this.dataStatus = Status.Data.Error;
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

        this.dataRefreshedAt = new Date();
        this.dataStatus = Status.Data.Loaded;
      } catch (error) {
        this.dataStatus = Status.Data.Error;
      }

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../styles/JournalSection.scss';
</style>
