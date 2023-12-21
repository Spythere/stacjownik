<template>
  <section class="journal-dispatchers">
    <JournalHeader />

    <div class="journal_wrapper">
      <div class="journal_top-bar">
        <JournalOptions
          @on-search-confirm="fetchHistoryData"
          @on-options-reset="resetOptions"
          @on-refresh-data="fetchHistoryData(true)"
          :sorter-option-ids="['timestampFrom', 'duration']"
          :data-status="dataStatus"
          :current-options-active="currentOptionsActive"
          optionsType="dispatchers"
        />

        <JournalStats :statsButtons="statsButtons" />
      </div>

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

import http from '../http';
import { useMainStore } from '../store/mainStore';
import { LocationQuery } from 'vue-router';
import { Journal } from '../components/JournalView/typings';
import { API } from '../typings/api';
import { Status } from '../typings/common';

import JournalDispatchersList from '../components/JournalView/JournalDispatchers/JournalDispatchersList.vue';
import JournalOptions from '../components/JournalView/JournalOptions.vue';
import JournalHeader from '../components/JournalView/JournalHeader.vue';
import JournalStats from '../components/JournalView/JournalStats.vue';

const statsButtons: Journal.StatsButton[] = [
  {
    tab: Journal.StatsTab.DISPATCHER_STATS,
    localeKey: 'journal.dispatcher-stats.button',
    iconName: 'user',
    disabled: true
  }
];

export default defineComponent({
  components: {
    JournalOptions,
    JournalHeader,
    JournalStats,
    JournalDispatchersList
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
    statsButtons,

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
    } as Journal.DispatcherSearchType);

    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);
    provide('searchersValues', searchersValues);
    provide('filterList', reactive([]));

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      mainStore: useMainStore(),

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
    },

    'mainStore.dispatcherStatsData'(stats) {
      this.statsButtons.find((sb) => sb.tab == Journal.StatsTab.DISPATCHER_STATS)!.disabled =
        stats === undefined;
    },

    async 'mainStore.dispatcherStatsName'() {
      this.fetchDispatcherStats();
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
    handleRouteParams() {
      this.$router.push({
        query: {
          'search-date': this.searchersValues['search-date'] || undefined,
          'search-station': this.searchersValues['search-station'] || undefined,
          'search-dispatcher': this.searchersValues['search-dispatcher'] || undefined
        }
      });
    },

    handleScroll(e: Event) {
      const listElement = e.target as HTMLElement;
      const scrollTop = listElement.scrollTop;
      const elementHeight = listElement.scrollHeight - listElement.offsetHeight;

      if (!this.scrollDataLoaded || this.scrollNoMoreData || this.dataStatus != Status.Data.Loaded)
        return;

      if (scrollTop > elementHeight * 0.85) this.addHistoryData();
    },

    handleQueries(query: LocationQuery) {
      this.setOptions(query as any);
    },

    async fetchDispatcherStats() {
      if (!this.mainStore.dispatcherStatsName) {
        this.mainStore.dispatcherStatsData = undefined;
        return;
      }

      try {
        const statsData: API.DispatcherStats.Response = await (
          await http.get('api/getDispatcherStats', {
            params: {
              name: this.mainStore.dispatcherStatsName
            }
          })
        ).data;

        this.mainStore.dispatcherStatsData = statsData;
      } catch (error) {
        this.mainStore.dispatcherStatsData = undefined;

        console.error('Ups! Wystąpił błąd przy próbie pobrania statystyk dyżurnego! :/');
      }
    },

    setOptions(options: { [key: string]: string }) {
      this.searchersValues['search-date'] = options['search-date'] ?? '';
      this.searchersValues['search-station'] = options['search-station'] ?? '';
      this.searchersValues['search-dispatcher'] = options['search-dispatcher'] ?? '';

      this.sorterActive.id =
        (options['sorter-active'] as Journal.DispatcherSorterKey) ?? 'timestampFrom';
    },

    resetOptions() {
      this.setOptions({});
      this.sorterActive.id = 'timestampFrom';
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      this.countFromIndex = this.historyList.length;

      const responseData: API.DispatcherHistory.Response = await (
        await http.get(`api/getDispatchers?${this.currentQuery}&countFrom=${this.countFromIndex}`)
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
          await http.get(`api/getDispatchers?${this.currentQuery}`)
        ).data;

        if (!responseData) {
          this.dataStatus = Status.Data.Error;
          return;
        }

        if (!responseData) return;

        // Response data exists
        this.historyList = responseData;

        // Stats display
        this.mainStore.dispatcherStatsName =
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
