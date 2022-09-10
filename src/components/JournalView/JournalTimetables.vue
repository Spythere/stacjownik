<template>
  <section class="journal-timetables">
    <keep-alive>
      <DriverStats v-if="statsCardOpen" @close-card="statsCardOpen = false" />
    </keep-alive>

    <div class="journal_wrapper">
      <JournalOptions
        @on-search-confirm="searchHistory"
        :sorter-option-ids="['timetableId', 'beginDate', 'distance', 'total-stops']"
        :filters="journalTimetableFilters"
      />

      <div class="list_wrapper" @scroll="handleScroll">
        <!-- <transition name="warning" mode="out-in"> -->
        <!-- <div :key="dataStatus"> -->
        <Loading v-if="dataStatus == DataStatus.Loading || dataStatus == DataStatus.Initialized" />

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
        <!-- </div> -->
        <!-- </transition> -->

        <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
        <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, JournalFilter, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import DriverStats from './DriverStats.vue';
import Loading from '../Global/Loading.vue';
import { journalTimetableFilters } from '../../data/journalFilters';
import dateMixin from '../../mixins/dateMixin';
import routerMixin from '../../mixins/routerMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { JournalFilterType } from '../../scripts/enums/JournalFilterType';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import { URLs } from '../../scripts/utils/apiURLs';
import { useStore } from '../../store/store';
import JournalOptions from './JournalOptions.vue';
import { JournalTimetableSearcher } from '../../types/JournalTimetablesTypes';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import imageMixin from '../../mixins/imageMixin';
import JournalTimetablesList from './JournalTimetablesList.vue';

const TIMETABLES_API_URL = `${URLs.stacjownikAPI}/api/getTimetables`;

export default defineComponent({
  components: { DriverStats, Loading, JournalOptions, JournalTimetablesList },
  mixins: [dateMixin, routerMixin, modalTrainMixin, imageMixin],

  name: 'JournalTimetables',

  props: {
    timetableId: {
      type: String,
    },
  },

  data: () => ({
    currentQuery: '',
    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
    statsCardOpen: false,

    timetableHistory: [] as TimetableHistory[],
    journalTimetableFilters,

    dataStatus: DataStatus.Initialized,
    dataErrorMessage: '',

    DataStatus,
  }),

  setup() {
    const sorterActive = ref({ id: 'timetableId', dir: -1 });
    const journalFilterActive = ref(journalTimetableFilters[0]);

    const searchersValues = reactive({
      'search-train': '',
      'search-driver': '',
      'search-date': '',
    } as JournalTimetableSearcher);

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

  activated() {
    if (this.timetableId) {
      this.searchersValues['search-train'] = `#${this.timetableId}`;
      this.searchHistory();
    }
  },

  mounted() {
    if (!this.timetableId) this.searchHistory();
  },

  methods: {
    handleScroll(e: Event) {
      const listElement = e.target as HTMLElement;
      const scrollTop = listElement.scrollTop;
      const elementHeight = listElement.scrollHeight - listElement.offsetHeight;

      if (!this.scrollDataLoaded || this.scrollNoMoreData || this.dataStatus != DataStatus.Loaded) return;

      if (scrollTop > elementHeight * 0.85) this.addHistoryData();
    },

    searchHistory() {
      this.fetchHistoryData({
        searchers: this.searchersValues,
        filter: this.journalFilterActive,
      });

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      const countFrom = this.timetableHistory.length;

      const responseData: TimetableHistory[] = await (
        await axios.get(`${TIMETABLES_API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.timetableHistory.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData(
      props: {
        searchers?: JournalTimetableSearcher;
        filter?: JournalFilter;
      } = {}
    ) {
      this.dataStatus = DataStatus.Loading;

      const queries: string[] = [];

      const driver = props.searchers?.['search-driver'].trim();
      const train = props.searchers?.['search-train'].trim();

      const dateString = props.searchers?.['search-date'].trim();
      const timestampFrom = dateString ? Date.parse(new Date(dateString).toISOString()) - 120 * 60 * 1000 : undefined;
      const timestampTo = timestampFrom ? timestampFrom + 86400000 : undefined;

      if (driver) queries.push(`driverName=${driver}`);
      if (train) queries.push(train.startsWith('#') ? `timetableId=${train.replace('#', '')}` : `trainNo=${train}`);
      if (timestampFrom && timestampTo) queries.push(`timestampFrom=${timestampFrom}`, `timestampTo=${timestampTo}`);

      // Z API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'distance') queries.push('sortBy=routeDistance');
      else if (this.sorterActive.id == 'total-stops') queries.push('sortBy=allStopsCount');
      else if (this.sorterActive.id == 'beginDate') queries.push('sortBy=beginDate');
      else queries.push('sortBy=timetableId');

      queries.push('countLimit=15');

      switch (props.filter?.id) {
        case JournalFilterType.abandoned:
          queries.push('fulfilled=0', 'terminated=1');
          break;

        case JournalFilterType.active:
          queries.push('terminated=0');
          break;

        case JournalFilterType.fulfilled:
          queries.push('fulfilled=1');
          break;

        default:
          break;
      }

      this.currentQuery = queries.join('&');

      try {
        const responseData: TimetableHistory[] = await (
          await axios.get(`${TIMETABLES_API_URL}?${this.currentQuery}`)
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
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalSection.scss';
</style>
