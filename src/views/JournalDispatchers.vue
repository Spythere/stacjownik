<template>
  <section class="journal-timetables">
    <JournalHeader />

    <div class="journal_wrapper">
      <JournalOptions
        @on-search-confirm="fetchHistoryData"
        @on-options-reset="resetOptions"
        @on-refresh-data="fetchHistoryData"
        :sorter-option-ids="['timestampFrom', 'duration']"
        :data-status="dataStatus"
        :current-options-active="currentOptionsActive"
        optionsType="dispatchers"
      />

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
          </div>
        </transition>

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
import { JournalDispatcherSearcher, JournalDispatcherSorter } from '../scripts/types/JournalDispatcherTypes';
import { DispatcherHistory } from '../scripts/interfaces/api/DispatchersAPIData';
import JournalHeader from '../components/JournalView/JournalHeader.vue';
import { LocationQuery } from 'vue-router';

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

    dataStatus: DataStatus.Loading,
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
      if ('sceneryName' in query) this.searchersValues['search-station'] = `${query.sceneryName}`;
      if ('dispatcherName' in query) this.searchersValues['search-dispatcher'] = `${query.dispatcherName}`;
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

    async fetchHistoryData() {
      const queries: string[] = [];

      const dispatcher = this.searchersValues['search-dispatcher'].trim();
      const station = this.searchersValues['search-station'].trim();
      const dateString = this.searchersValues['search-date'].trim();

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

      if (this.currentQuery != queries.join('&')) this.dataStatus = DataStatus.Loading;

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

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/JournalSection.scss';
</style>

