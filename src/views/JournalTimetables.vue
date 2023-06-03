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

      <div class="list_wrapper" @scroll="handleScroll">
        <transition name="status-anim" mode="out-in">
          <div :key="dataStatus">
            <div class="journal_warning" v-if="store.isOffline">
              {{ $t('app.offline') }}
            </div>

            <Loading v-else-if="dataStatus == DataStatus.Loading" />

            <div v-else-if="dataStatus == DataStatus.Error" class="journal_warning error">
              {{ $t('app.error') }}
            </div>

            <div v-else-if="timetableHistory.length == 0" class="journal_warning">
              {{ $t('app.no-result') }}
            </div>

            <div v-else>
              <JournalTimetablesList :timetableHistory="timetableHistory" />

              <button
                class="btn btn--option btn--load-data"
                v-if="!scrollNoMoreData && scrollDataLoaded && timetableHistory.length >= 15"
                @click="addHistoryData"
              >
                {{ $t('journal.load-data') }}
              </button>
            </div>
          </div>
        </transition>

        <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
        <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import DriverStats from '../components/JournalView/JournalDriverStats.vue';
import Loading from '../components/Global/Loading.vue';
import { JournalTimetableSorter } from '../types/Journal/JournalTimetablesTypes';
import dateMixin from '../mixins/dateMixin';
import routerMixin from '../mixins/routerMixin';
import { DataStatus } from '../scripts/enums/DataStatus';
import { TimetableHistory } from '../scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '../scripts/utils/apiURLs';
import { useStore } from '../store/store';
import JournalOptions from '../components/JournalView/JournalOptions.vue';
import { JournalTimetableSearchType } from '../types/Journal/JournalTimetablesTypes';
import modalTrainMixin from '../mixins/modalTrainMixin';
import imageMixin from '../mixins/imageMixin';
import JournalTimetablesList from '../components/JournalView/JournalTimetablesList.vue';
import { journalTimetableFilters } from '../constants/Journal/JournalTimetablesConsts';
import JournalStats from '../components/JournalView/JournalStats.vue';
import JournalHeader from '../components/JournalView/JournalHeader.vue';
import { LocationQuery } from 'vue-router';
import { TimetablesQueryParams } from '../scripts/interfaces/api/TimetablesQueryParams';
import { JournalFilterType } from '../scripts/enums/JournalFilterType';

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
    const journalFilterActive = ref(journalTimetableFilters[0]);

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
    provide('journalFilterActive', journalFilterActive);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      sorterActive,
      journalFilterActive,
      searchersValues,

      countFromIndex,
      countLimit,

      scrollElement,

      store: useStore(),
    };
  },

  watch: {
    currentQueryArray(q: string[]) {
      this.currentOptionsActive = q.length >= 2 || q.some((qv) => qv.startsWith('sortBy=') && qv.split('=')[1]);
    },
  },

  // Handle route updates for route-links
  beforeRouteUpdate(to, _) {
    this.handleQueries(to.query);
    this.fetchHistoryData();

    console.log('test');
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
      if ('timetableId' in query) this.searchersValues['search-train'] = `#${query.timetableId}`;
    },

    setSearchers(date: string, driver: string, train: string, dispatcher: string) {
      this.searchersValues['search-date'] = date;
      this.searchersValues['search-driver'] = driver;
      this.searchersValues['search-train'] = train;
      this.searchersValues['search-dispatcher'] = dispatcher;
    },

    resetOptions() {
      this.setSearchers('', '', '', '');

      this.journalFilterActive = this.journalTimetableFilters[0];
      this.sorterActive.id = 'timetableId';

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

      switch (this.journalFilterActive.id) {
        case JournalFilterType.abandoned:
          this.currentQueryParams['fulfilled'] = 0;
          this.currentQueryParams['terminated'] = 1;
          break;

        case JournalFilterType.active:
          this.currentQueryParams['terminated'] = 0;
          break;

        case JournalFilterType.fulfilled:
          this.currentQueryParams['fulfilled'] = 1;
          break;

        default:
          break;
      }

      this.currentQueryParams['driverName'] = driverName;
      this.currentQueryParams['trainNo'] = trainNo;

      this.currentQueryParams['countFrom'] = undefined;
      this.currentQueryParams['countLimit'] = undefined;

      this.currentQueryParams['authorName'] = authorName;
      this.currentQueryParams['timestampFrom'] = timestampFrom;
      this.currentQueryParams['timestampTo'] = timestampTo;
      this.currentQueryParams['issuedFrom'] = issuedFrom;
      this.currentQueryParams['sortBy'] = this.sorterActive.id != 'timetableId' ? this.sorterActive.id : undefined;

      this.dataStatus = DataStatus.Loading;

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
