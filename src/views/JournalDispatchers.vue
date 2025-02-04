<template>
  <section class="journal-dispatchers">
    <JournalHeader />

    <div class="journal_wrapper">
      <div class="journal_top-bar">
        <JournalOptions
          @on-search-confirm="fetchHistoryData"
          @on-options-reset="resetOptions"
          @on-refresh-data="fetchHistoryData"
          :sorter-option-ids="['timestampFrom', 'currentDuration']"
          :data-status="dataStatus"
          :current-options-active="currentOptionsActive"
          optionsType="dispatchers"
        />

        <JournalStats :statsButtons="statsButtons" />
      </div>

      <div class="journal_refreshed-date">
        {{ $t('journal.data-refreshed-at') }}:
        {{ dataRefreshedAt?.toLocaleString($i18n.locale) ?? '---' }}
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

import { useMainStore } from '../store/mainStore';
import { LocationQuery } from 'vue-router';
import { Journal } from '../components/JournalView/typings';
import { API } from '../typings/api';
import { Status } from '../typings/common';

import JournalDispatchersList from '../components/JournalView/JournalDispatchers/JournalDispatchersList.vue';
import JournalOptions from '../components/JournalView/JournalOptions.vue';
import JournalHeader from '../components/JournalView/JournalHeader.vue';
import JournalStats from '../components/JournalView/JournalStats.vue';
import { useApiStore } from '../store/apiStore';

const statsButtons: Journal.StatsButton[] = [
  {
    tab: Journal.StatsTab.DISPATCHER_STATS,
    localeKey: 'journal.dispatcher-stats.button',
    iconName: 'user',
    disabled: true
  }
];

interface DispatchersQueryParams {
  dispatcherName?: string;
  stationName?: string;
  stationHash?: string;
  timestampFrom?: number;
  timestampTo?: number;
  dateFrom?: string;
  dateTo?: string;
  countFrom?: number;
  countLimit?: number;
  sortBy?: Journal.DispatcherSorter['id'];
}

const defaultQueryParams: DispatchersQueryParams = {
  countLimit: 30,
  sortBy: 'timestampFrom',
  countFrom: undefined,
  dispatcherName: undefined,
  stationHash: undefined,
  stationName: undefined,
  timestampFrom: undefined,
  timestampTo: undefined
};

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

    dataRefreshedAt: null as Date | null,
    currentQueryParams: {} as DispatchersQueryParams,

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
      'search-date-from': '',
      'search-date-to': ''
    } as Journal.DispatcherSearchType);

    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);
    provide('searchersValues', searchersValues);
    provide('filterList', reactive([]));

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      mainStore: useMainStore(),
      apiStore: useApiStore(),

      sorterActive,
      searchersValues,

      scrollElement
    };
  },

  watch: {
    currentQueryParams(queryParams: DispatchersQueryParams) {
      this.currentOptionsActive = Object.keys(queryParams).some(
        (k) =>
          queryParams[k as keyof DispatchersQueryParams] !=
          defaultQueryParams[k as keyof DispatchersQueryParams]
      );
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
          'search-date-from': this.searchersValues['search-date-from'] || undefined,
          'search-date-to': this.searchersValues['search-date-to'] || undefined,
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
          await this.apiStore.client!.get('api/getDispatcherStats', {
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
      this.searchersValues['search-date-from'] = options['search-date-from'] ?? '';
      this.searchersValues['search-date-to'] = options['search-date-to'] ?? '';
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
      this.currentQueryParams['countFrom'] = this.historyList.length;

      const responseData: API.DispatcherHistory.Response = await (
        await this.apiStore.client!.get(`api/getDispatchers`, { params: this.currentQueryParams })
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData() {      
      const queryParams: DispatchersQueryParams = {};

      const dispatcherName = this.searchersValues['search-dispatcher'].trim() || undefined;
      const stationName = this.searchersValues['search-station'].trim() || undefined;
      const dateFromString = this.searchersValues['search-date-from'].trim() || undefined;
      const dateToString = this.searchersValues['search-date-to'].trim() || undefined;

      queryParams['dispatcherName'] = dispatcherName;
      queryParams['dateFrom'] = dateFromString;
      queryParams['dateTo'] = dateToString ? `${dateToString}T23:00:00` : undefined;

      queryParams['countLimit'] = 30;

      if (stationName && stationName.startsWith('#'))
        queryParams['stationHash'] = stationName.slice(1);
      else queryParams['stationName'] = stationName;

      queryParams['sortBy'] = this.sorterActive.id;

      if (JSON.stringify(this.currentQueryParams) != JSON.stringify(queryParams))
        this.dataStatus = Status.Data.Loading;

      this.currentQueryParams = queryParams;

      try {
        const responseData: API.DispatcherHistory.Response = await (
          await this.apiStore.client!.get(`api/getDispatchers`, { params: this.currentQueryParams })
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
