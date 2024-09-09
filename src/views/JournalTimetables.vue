<template>
  <section class="journal-timetables">
    <JournalHeader />

    <div class="journal_wrapper">
      <div class="journal_top-bar">
        <JournalOptions
          @onOptionsReset="resetOptions"
          @onRefreshData="fetchHistoryData"
          :sorter-option-ids="['timetableId', 'beginDate', 'routeDistance', 'allStopsCount']"
          :filters="journalTimetableFilters"
          :currentOptionsActive="currentOptionsActive"
          :data-status="dataStatus"
          optionsType="timetables"
        />

        <JournalStats :statsButtons="statsButtons" />
      </div>

      <div class="journal_refreshed-date">
        {{ $t('journal.data-refreshed-at') }}:
        {{ dataRefreshedAt?.toLocaleString($i18n.locale) ?? '---' }}
      </div>

      <div class="list_wrapper" @scroll="handleScroll">
        <JournalTimetablesList
          :timetableHistory="timetableHistory"
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

import dateMixin from '../mixins/dateMixin';
import routerMixin from '../mixins/routerMixin';

import JournalOptions from '../components/JournalView/JournalOptions.vue';
import JournalStats from '../components/JournalView/JournalStats.vue';
import JournalHeader from '../components/JournalView/JournalHeader.vue';

import { useMainStore } from '../store/mainStore';

import { LocationQuery } from 'vue-router';

import JournalTimetablesList from '../components/JournalView/JournalTimetables/JournalTimetablesList.vue';
import { Journal } from '../components/JournalView/typings';
import { Status } from '../typings/common';
import { API } from '../typings/api';
import { useApiStore } from '../store/apiStore';

export const journalTimetableFilters: Journal.TimetableFilter[] = [
  {
    id: Journal.TimetableFilterId.ALL_STATUSES,
    filterSection: Journal.FilterSection.TIMETABLE_STATUS,
    isActive: true,
    default: true
  },

  {
    id: Journal.TimetableFilterId.ACTIVE,
    filterSection: Journal.FilterSection.TIMETABLE_STATUS,
    isActive: false,
    default: false
  },

  {
    id: Journal.TimetableFilterId.FULFILLED,
    filterSection: Journal.FilterSection.TIMETABLE_STATUS,
    isActive: false,
    default: false
  },

  {
    id: Journal.TimetableFilterId.ABANDONED,
    filterSection: Journal.FilterSection.TIMETABLE_STATUS,
    isActive: false,
    default: false
  },

  {
    id: Journal.TimetableFilterId.ALL_SPECIALS,
    filterSection: Journal.FilterSection.SPECIAL,
    isActive: true,
    default: true
  },

  {
    id: Journal.TimetableFilterId.TWR,
    filterSection: Journal.FilterSection.SPECIAL,
    isActive: false,
    default: false
  },

  {
    id: Journal.TimetableFilterId.SKR,
    filterSection: Journal.FilterSection.SPECIAL,
    isActive: false,
    default: false
  },
  {
    id: Journal.TimetableFilterId.TWR_SKR,
    filterSection: Journal.FilterSection.SPECIAL,
    isActive: false,
    default: false
  }
];

interface TimetablesQueryParams {
  driverName?: string;
  trainNo?: string;
  timetableId?: string;

  authorName?: string;
  // timestampFrom?: number;
  // timestampTo?: number;

  dateFrom?: string;
  dateTo?: string;

  issuedFrom?: string;
  terminatingAt?: string;
  via?: string;

  countFrom?: number;
  countLimit?: number;

  fulfilled?: number;
  terminated?: number;

  twr?: number;
  skr?: number;

  sortBy?: Journal.TimetableSorter['id'];
}

export default defineComponent({
  components: {
    JournalOptions,
    JournalStats,
    JournalHeader,
    JournalTimetablesList
  },
  mixins: [dateMixin, routerMixin],

  name: 'JournalTimetables',

  props: {
    timetableId: {
      type: String
    }
  },

  data: () => ({
    journalTimetableFilters,
    mainStore: useMainStore(),
    apiStore: useApiStore(),

    statsButtons: [
      {
        tab: Journal.StatsTab.DAILY_STATS,
        localeKey: 'journal.daily-stats.button',
        iconName: 'stats',
        disabled: false
      },
      {
        tab: Journal.StatsTab.DRIVER_STATS,
        localeKey: 'journal.driver-stats.button',
        iconName: 'train',
        disabled: true
      }
    ],

    currentQueryParams: {} as TimetablesQueryParams,
    dataRefreshedAt: null as Date | null,

    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,
    currentOptionsActive: false,

    timetableHistory: [] as API.TimetableHistory.Response,

    dataStatus: Status.Data.Loading,
    dataErrorMessage: ''
  }),

  setup() {
    const sorterActive: Journal.TimetableSorter = reactive({ id: 'timetableId', dir: 'desc' });

    const initFilters: readonly Journal.TimetableFilter[] = JSON.parse(
      JSON.stringify(journalTimetableFilters)
    );

    const filterList: Journal.TimetableFilter[] = reactive(JSON.parse(JSON.stringify(initFilters)));

    const searchersValues = reactive({
      'search-train': '',
      'search-driver': '',
      'search-dispatcher': '',
      'search-issuedFrom': '',
      'search-via': '',
      'search-terminatingAt': '',
      'search-date': ''
    } as Journal.TimetableSearchType);

    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('searchersValues', searchersValues);
    provide('sorterActive', sorterActive);
    provide('filterList', filterList);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      sorterActive,
      searchersValues,
      filterList,
      initFilters,

      countFromIndex,
      countLimit,

      scrollElement
    };
  },

  watch: {
    currentQueryParams(q: TimetablesQueryParams) {
      this.currentOptionsActive = Object.values(q).some((v) => v !== undefined);
    },

    'mainStore.driverStatsData'(driverStats) {
      this.statsButtons.find((sb) => sb.tab == Journal.StatsTab.DRIVER_STATS)!.disabled =
        driverStats === undefined;
    },

    async 'mainStore.driverStatsName'() {
      this.fetchDriverStats();
    }
  },

  // Handle route updates for route-links
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
      this.setOptions(query as any);
    },

    async fetchDriverStats() {
      if (!this.mainStore.driverStatsName) {
        this.mainStore.driverStatsData = undefined;
        this.mainStore.driverStatsStatus = Status.Data.Initialized;
        return;
      }

      try {
        this.mainStore.driverStatsStatus = Status.Data.Loading;

        const statsData: API.DriverStats.Response = await (
          await this.apiStore.client!.get(
            `api/getDriverInfo?name=${this.mainStore.driverStatsName}`
          )
        ).data;

        this.mainStore.driverStatsData = statsData;
        this.mainStore.driverStatsStatus = Status.Data.Loaded;
      } catch (error) {
        this.mainStore.driverStatsData = undefined;
        this.mainStore.driverStatsStatus = Status.Data.Error;
        console.error('Ups! Wystąpił błąd przy próbie pobrania statystyk maszynisty! :/');
      }
    },

    setOptions(options: { [key: string]: string }) {
      Object.keys(this.searchersValues).forEach((v) => {
        this.searchersValues[v as Journal.TimetableSearchKey] = options[v] ?? '';
      });

      this.sorterActive.id =
        (options['sorter-active'] as Journal.TimetableSorterKey) ?? 'timetableId';

      this.filterList.forEach((f) => {
        f.isActive =
          options[f.filterSection] === f.id ||
          (options[f.filterSection] === undefined && f.default);
      });
    },

    resetOptions() {
      this.setOptions({});
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      this.currentQueryParams['countFrom'] = this.timetableHistory.length;

      const responseData: API.TimetableHistory.Response = await (
        await this.apiStore.client!.get('api/getTimetables', {
          params: { ...this.currentQueryParams }
        })
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.timetableHistory.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData() {
      const driverName = this.searchersValues['search-driver'].trim() || undefined;
      const trainNo = this.searchersValues['search-train'].trim() || undefined;
      const authorName = this.searchersValues['search-dispatcher'].trim() || undefined;
      const dateFrom = this.searchersValues['search-date'].trim() || undefined;
      const issuedFrom = this.searchersValues['search-issuedFrom'].trim() || undefined;
      const via = this.searchersValues['search-via'].trim() || undefined;
      const terminatingAt = this.searchersValues['search-terminatingAt'].trim() || undefined;

      let dateTo: string | undefined = undefined;

      if (dateFrom) {
        const d = new Date(dateFrom);
        d.setDate(d.getDate() + 1);

        dateTo = d.toISOString().split('T')[0];
      }
      // const timestampFrom = dateString ? Date.parse(new Date(dateString).toISOString()) : undefined;
      // const timestampTo = timestampFrom ? timestampFrom + 86400000 : undefined;

      const queryParams: TimetablesQueryParams = {};

      this.filterList
        .filter((f) => f.isActive)
        .forEach((f) => {
          switch (f.id) {
            case Journal.TimetableFilterId.ABANDONED:
              queryParams['fulfilled'] = 0;
              queryParams['terminated'] = 1;
              break;

            case Journal.TimetableFilterId.ACTIVE:
              queryParams['fulfilled'] = undefined;
              queryParams['terminated'] = 0;
              break;

            case Journal.TimetableFilterId.FULFILLED:
              queryParams['terminated'] = undefined;
              queryParams['fulfilled'] = 1;
              break;

            case Journal.TimetableFilterId.ALL_STATUSES:
              queryParams['terminated'] = undefined;
              queryParams['fulfilled'] = undefined;
              break;

            case Journal.TimetableFilterId.ALL_SPECIALS:
              queryParams['twr'] = undefined;
              queryParams['skr'] = undefined;
              break;

            case Journal.TimetableFilterId.TWR:
              queryParams['twr'] = 1;
              queryParams['skr'] = 0;
              break;

            case Journal.TimetableFilterId.SKR:
              queryParams['twr'] = 0;
              queryParams['skr'] = 1;
              break;

            case Journal.TimetableFilterId.TWR_SKR:
              queryParams['twr'] = 1;
              queryParams['skr'] = 1;
              break;

            default:
              break;
          }
        });

      queryParams['driverName'] = driverName;
      queryParams[trainNo?.startsWith('#') ? 'timetableId' : 'trainNo'] = trainNo?.replace('#', '');
      queryParams['countFrom'] = undefined;
      queryParams['countLimit'] = undefined;

      queryParams['authorName'] = authorName;
      queryParams['dateFrom'] = dateFrom;
      queryParams['dateTo'] = dateTo;
      queryParams['issuedFrom'] = issuedFrom;
      queryParams['terminatingAt'] = terminatingAt;
      queryParams['via'] = via;

      queryParams['issuedFrom'] = issuedFrom;
      queryParams['sortBy'] =
        this.sorterActive.id != 'timetableId' ? this.sorterActive.id : undefined;

      if (JSON.stringify(this.currentQueryParams) != JSON.stringify(queryParams))
        this.dataStatus = Status.Data.Loading;

      this.currentQueryParams = queryParams;

      try {
        const responseData: API.TimetableHistory.Response = await (
          await this.apiStore.client!.get('api/getTimetables', {
            params: this.currentQueryParams
          })
        ).data;

        if (!responseData) {
          this.dataStatus = Status.Data.Error;
          this.dataErrorMessage = 'Brak danych!';
          return;
        }

        if (!responseData) return;

        // Response data exists
        this.timetableHistory = responseData;

        // Stats display
        this.mainStore.driverStatsName =
          this.timetableHistory.length > 0 && this.searchersValues['search-driver'].trim()
            ? this.timetableHistory[0].driverName
            : '';

        this.dataStatus = Status.Data.Loaded;
        this.dataRefreshedAt = new Date();
      } catch (error) {
        this.dataStatus = Status.Data.Error;
        this.dataErrorMessage = 'Ups! Coś poszło nie tak!';
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
