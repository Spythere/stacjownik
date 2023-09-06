<template>
  <section class="journal-timetables">
    <JournalHeader />

    <div class="journal_wrapper">
      <JournalOptions
        @on-search-confirm="fetchHistoryData"
        @on-options-reset="resetOptions"
        @on-refresh-data="fetchHistoryData"
        :sorter-option-ids="['timetableId', 'beginDate', 'routeDistance', 'allStopsCount']"
        :filters="journalTimetableFilters"
        :currentOptionsActive="currentOptionsActive"
        :data-status="dataStatus"
        optionsType="timetables"
      />

      <JournalStats />

      <div class="journal_refreshed-date" v-if="dataRefreshedAt">
        {{ $t('journal.data-refreshed-at') }}: {{ dataRefreshedAt.toLocaleString($i18n.locale) }}
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
import axios from 'axios';

import imageMixin from '../mixins/imageMixin';
import dateMixin from '../mixins/dateMixin';
import routerMixin from '../mixins/routerMixin';
import modalTrainMixin from '../mixins/modalTrainMixin';

import DriverStats from '../components/JournalView/JournalDriverStats.vue';
import JournalOptions from '../components/JournalView/JournalOptions.vue';
import JournalStats from '../components/JournalView/JournalStats.vue';
import JournalHeader from '../components/JournalView/JournalHeader.vue';
import JournalTimetablesList from '../components/JournalView/JournalTimetablesList.vue';
import Loading from '../components/Global/Loading.vue';

import { DataStatus } from '../scripts/enums/DataStatus';
import { TimetableHistory } from '../scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '../scripts/utils/apiURLs';
import { useStore } from '../store/store';

import { LocationQuery } from 'vue-router';
import { TimetablesQueryParams } from '../scripts/interfaces/api/TimetablesQueryParams';
import { JournalFilterType } from '../scripts/enums/JournalFilterType';
import {
  JournalFilter,
  JournalTimetableSearchType,
  JournalTimetableSorter,
} from '../scripts/types/JournalTimetablesTypes';
import { journalTimetableFilters } from '../constants/Journal/JournalTimetablesConsts';

const TIMETABLES_API_URL = `${URLs.stacjownikAPI}/api/getTimetables`;

export default defineComponent({
  components: { DriverStats, Loading, JournalOptions, JournalTimetablesList, JournalStats, JournalHeader },
  mixins: [dateMixin, routerMixin, modalTrainMixin, imageMixin],

  name: 'JournalTimetables',

  props: {
    timetableId: {
      type: String,
    },
  },

  data: () => ({
    currentQueryParams: {} as TimetablesQueryParams,
    dataRefreshedAt: null as Date | null,

    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,
    currentOptionsActive: false,

    timetableHistory: [] as TimetableHistory[],
    journalTimetableFilters,

    dataStatus: DataStatus.Loading,
    dataErrorMessage: '',

    DataStatus,
  }),

  setup() {
    const sorterActive: JournalTimetableSorter = reactive({ id: 'timetableId', dir: 'desc' });
    // const journalFilterActive = ref(journalTimetableFilters[0]);
    const initFilters: readonly JournalFilter[] = JSON.parse(JSON.stringify(journalTimetableFilters));
    const filterList: JournalFilter[] = reactive(JSON.parse(JSON.stringify(initFilters)));

    const searchersValues = reactive({
      'search-train': '',
      'search-driver': '',
      'search-dispatcher': '',
      'search-issuedFrom': '',
      'search-date': '',
    } as JournalTimetableSearchType);

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

      scrollElement,

      store: useStore(),
    };
  },

  watch: {
    currentQueryParams(q: TimetablesQueryParams) {
      this.currentOptionsActive = Object.values(q).some((v) => v !== undefined);
    },
  },

  // Handle route updates for route-links
  beforeRouteUpdate(to, _) {
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

      if (!this.scrollDataLoaded || this.scrollNoMoreData || this.dataStatus != DataStatus.Loaded) return;

      if (scrollTop > elementHeight * 0.85) this.addHistoryData();
    },

    handleQueries(query: LocationQuery) {
      const queryKeys = Object.keys(query);

      if (queryKeys.includes('timetableId')) this.setSearchers('', '', `#${query.timetableId}`, '', '');
      if (queryKeys.includes('issuedFrom')) this.setSearchers('', '', '', '', `${query.issuedFrom}`);
      if (queryKeys.includes('authorName')) this.setSearchers('', '', '', `${query.authorName}`, '');
    },

    setSearchers(date: string, driver: string, train: string, dispatcher: string, issuedFrom: string) {
      this.searchersValues['search-date'] = date;
      this.searchersValues['search-driver'] = driver;
      this.searchersValues['search-train'] = train;
      this.searchersValues['search-dispatcher'] = dispatcher;
      this.searchersValues['search-issuedFrom'] = issuedFrom;
    },

    resetOptions() {
      this.setSearchers('', '', '', '', '');

      this.sorterActive.id = 'timetableId';

      this.filterList.forEach(
        (f) => (f.isActive = this.initFilters.find((initFilter) => initFilter.id == f.id)?.isActive || false)
      );

      this.fetchHistoryData();
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      this.currentQueryParams['countFrom'] = this.timetableHistory.length;

      const responseData: TimetableHistory[] = await (
        await axios.get(`${TIMETABLES_API_URL}`, {
          params: { ...this.currentQueryParams },
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
      const dateString = this.searchersValues['search-date'].trim() || undefined;
      const issuedFrom = this.searchersValues['search-issuedFrom'].trim() || undefined;

      const timestampFrom = dateString ? Date.parse(new Date(dateString).toISOString()) - 120 * 60 * 1000 : undefined;
      const timestampTo = timestampFrom ? timestampFrom + 86400000 : undefined;

      const queryParams: TimetablesQueryParams = {};

      this.filterList
        .filter((f) => f.isActive)
        .forEach((f) => {
          switch (f.id) {
            case JournalFilterType.ABANDONED:
              queryParams['fulfilled'] = 0;
              queryParams['terminated'] = 1;
              break;

            case JournalFilterType.ACTIVE:
              queryParams['fulfilled'] = undefined;
              queryParams['terminated'] = 0;
              break;

            case JournalFilterType.FULFILLED:
              queryParams['terminated'] = undefined;
              queryParams['fulfilled'] = 1;
              break;

            case JournalFilterType.ALL:
              queryParams['terminated'] = undefined;
              queryParams['fulfilled'] = undefined;
              break;

            case JournalFilterType.TWR_SKR:
              queryParams['twr'] = undefined;
              queryParams['skr'] = undefined;
              break;

            case JournalFilterType.TWR:
              queryParams['twr'] = 1;
              queryParams['skr'] = undefined;
              break;

            case JournalFilterType.SKR:
              queryParams['twr'] = undefined;
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
      queryParams['timestampFrom'] = timestampFrom;
      queryParams['timestampTo'] = timestampTo;
      queryParams['issuedFrom'] = issuedFrom;
      queryParams['sortBy'] = this.sorterActive.id != 'timetableId' ? this.sorterActive.id : undefined;

      if (JSON.stringify(this.currentQueryParams) != JSON.stringify(queryParams)) this.dataStatus = DataStatus.Loading;

      this.currentQueryParams = queryParams;

      try {
        const responseData: TimetableHistory[] = await (
          await axios.get(`${TIMETABLES_API_URL}`, {
            params: this.currentQueryParams,
          })
        ).data;

        if (!responseData) {
          this.dataStatus = DataStatus.Error;
          this.dataErrorMessage = 'Brak danych!';
          return;
        }

        if (!responseData) return;

        // Response data exists
        this.timetableHistory = responseData;

        // Stats display
        this.store.driverStatsName =
          this.timetableHistory.length > 0 && this.searchersValues['search-driver'].trim()
            ? this.timetableHistory[0].driverName
            : '';

        this.dataStatus = DataStatus.Loaded;
        this.dataRefreshedAt = new Date();
      } catch (error) {
        this.dataStatus = DataStatus.Error;
        this.dataErrorMessage = 'Ups! Coś poszło nie tak!';
      }

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/JournalSection.scss';
</style>
