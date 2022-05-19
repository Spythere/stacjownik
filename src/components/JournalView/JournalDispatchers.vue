<template>
  <section class="journal-timetables">
    <div class="journal-wrapper">
      <button class="return-btn" @click="scrollToTop" v-if="showReturnButton">
        <img :src="icons.arrow" alt="return arrow" />
      </button>

      <div class="journal-list">
        <div class="list-wrapper" ref="scrollElement">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <div class="journal_loading" v-if="isDataLoading || isDataInit">
                <img :src="icons.loading" alt="loading icon" />
                <span class="loading-label">{{ $t('app.loading') }}</span>
              </div>

              <div v-else-if="isDataError" class="journal_warning error">
                {{ $t('app.error') }}
              </div>

              <div class="journal_warning" v-else-if="historyList.length == 0">
                {{ $t('app.no-result') }}
              </div>

              <ul v-else>
                <transition-group name="journal-list-anim">
                  <li v-for="(item, i) in historyList" :key="item.timetableId">
                    {{  item.driverName }}
                  </li>
                </transition-group>
              </ul>
            </div>
          </transition>
        </div>
      </div>

      <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
      <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, JournalFilter, provide, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import { URLs } from '@/scripts/utils/apiURLs';
import { journalFilters } from '@/data/journalFilters';
import { JournalFilterType } from '@/scripts/enums/JournalFilterType';

const PROD_MODE = true;

const API_URL = PROD_MODE ? `${URLs.stacjownikAPI}/api/getTimetables` : 'http://localhost:3001/api/getTimetables';

interface APIResponse {
  errorMessage: string | null;
  response: TimetableHistory[] | null;
}

interface TimetableHistory {
  timetableId: number;
  trainNo: number;
  trainCategoryCode: string;
  driverId: number;
  driverName: string;
  route: string;
  twr: number;
  skr: number;
  sceneriesString: string;

  routeDistance: number;
  currentDistance: number;

  confirmedStopsCount: number;
  allStopsCount: number;

  beginDate: string;
  endDate: string;

  scheduledBeginDate: string;
  scheduledEndDate: string;

  terminated: boolean;
  fulfilled: boolean;

  authorName?: string;
  authorId?: number;
}

export default defineComponent({
  components: { SearchBox, ActionButton, JournalOptions },
  mixins: [dateMixin],

  data: () => ({
    icons: {
      loading: require('@/assets/icon-loading.svg'),
      arrow: require('@/assets/icon-arrow-asc.svg'),
    },

    currentQuery: '',
    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,
  }),

  setup() {
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const sorterActive = ref({ id: 'timetableId', dir: -1 });
    const journalFilterActive = ref(journalFilters[0]);

    const searchedDriver = ref('');
    const searchedTrain = ref('');
    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      historyList: ref([]) as Ref<TimetableHistory[]>,
      historyDataStatus,

      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),
      isDataInit: computed(() => historyDataStatus.value.status === DataStatus.Initialized),

      searchedDriver,
      searchedTrain,
      sorterActive,
      journalFilterActive,

      countFromIndex,
      countLimit,

      scrollElement,
      maxCount: ref(15),
    };
  },

  mounted() {
    this.fetchHistoryData();
  },

  activated() {
    window.addEventListener('scroll', this.handleScroll);
  },

  deactivated() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  methods: {
    handleScroll() {
      this.showReturnButton = window.scrollY > window.innerHeight;

      const element = this.$refs.scrollElement as HTMLElement;

      if (
        element.getBoundingClientRect().bottom * 0.85 < window.innerHeight &&
        this.scrollDataLoaded &&
        !this.scrollNoMoreData
      )
        this.addHistoryData();
    },

    scrollToTop() {
      window.scrollTo({ top: 0 });
    },

    search() {
      this.fetchHistoryData({
        searchedDriver: this.searchedDriver,
        searchedTrain: this.searchedTrain,
        filter: this.journalFilterActive,
      });

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      const countFrom = this.historyList.length;

      const responseData: APIResponse | null = await (
        await axios.get(`${API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

      console.log('Loading...');

      if (!responseData?.response) return;

      if (responseData.response.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData.response);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData(
      props: {
        searchedDriver?: string;
        searchedTrain?: string;
        filter?: JournalFilter;
      } = {}
    ) {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];

      if (props.searchedDriver) queries.push(`driver=${props.searchedDriver}`);
      if (props.searchedTrain) queries.push(`train=${props.searchedTrain}`);

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
        const responseData: APIResponse | null = await (await axios.get(`${API_URL}?${this.currentQuery}`)).data;

        if (!responseData) {
          this.historyDataStatus.status = DataStatus.Error;
          this.historyDataStatus.error = 'Brak danych!';
          return;
        }

        if (responseData.errorMessage) {
          this.historyDataStatus.status = DataStatus.Error;
          this.historyDataStatus.error = responseData.errorMessage;

          return;
        }

        if (!responseData.response) return;

        // Response data exists
        this.historyList = responseData.response;

        this.historyDataStatus.status = DataStatus.Loaded;
      } catch (error) {
        this.historyDataStatus.status = DataStatus.Error;
        this.historyDataStatus.error = 'Ups! Coś poszło nie tak!';
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/JournalSection.scss';

// .journal_item {

// }
</style>
