<template>
  <section class="journal-timetables">
    <div class="journal-wrapper">
      <JournalOptions
        @on-input-change="search"
        @on-filter-change="search"
        @on-sorter-change="search"
        :sorter-option-ids="['timetableId', 'beginDate', 'distance', 'total-stops']"
        :filters="journalTimetableFilters"
      />

      <button class="return-btn" @click="scrollToTop" v-if="showReturnButton">
        <img :src="icons.arrow" alt="return arrow" />
      </button>

      <div class="journal-list">
        <div class="list-wrapper" ref="scrollElement">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <div class="journal_loading" v-if="isDataLoading || isDataInit">
                {{ $t('app.loading') }}
              </div>

              <div v-else-if="isDataError" class="journal_warning error">
                {{ $t('app.error') }}
              </div>

              <div class="journal_warning" v-else-if="historyList.length == 0">
                {{ $t('app.no-result') }}
              </div>

              <ul v-else>
                <transition-group name="journal-list-anim">
                  <li v-for="(item, i) in historyList" class="journal_item" :key="item.timetableId">
                    <div class="journal_item-top">
                      <span>
                        <span
                          tabindex="0"
                          @click="navigateToTimetable(item)"
                          @keydown.enter="navigateToTimetable(item)"
                          style="cursor: pointer"
                        >
                          <b class="text--primary">{{ item.trainCategoryCode }}&nbsp;</b>
                          <b>{{ item.trainNo }}</b>
                          | <span>{{ item.driverName }}</span> |
                          <span class="text--grayed">#{{ item.timetableId }}</span>
                        </span>

                        <div>
                          <b>{{ item.route.replace('|', ' - ') }}</b>
                        </div>

                        <hr style="margin: 0.25em 0" />

                        <div class="scenery-list">
                          <span
                            v-for="(scenery, i) in getSceneryList(item)"
                            :key="scenery.name"
                            :class="{ confirmed: scenery.confirmed }"
                          >
                            {{ i > 0 ? ' > ' : '' }} {{ scenery.name }}
                          </span>
                        </div>

                        <div class="schedule-dates">
                          <!-- Data odjazdu ze stacji początkowej -->
                          <b>{{ item.route.split('|')[0] }}:</b>
                          <s v-if="item.beginDate != item.scheduledBeginDate" class="text--grayed">
                            {{ localeTime(item.beginDate, $i18n.locale) }}
                          </s>
                          <span>{{ localeTime(item.scheduledBeginDate, $i18n.locale) }} </span>&bull;

                          <!-- Data przyjazdu na stację końcową / porzucenia -->
                          <b v-if="(item.fulfilled && item.terminated) || !item.terminated">
                            {{ item.route.split('|').slice(-1)[0] }}:
                          </b>
                          <i v-else>{{ $t('journal.timetable-abandoned') }} </i>

                          <s v-if="item.endDate != item.scheduledEndDate && item.terminated" class="text--grayed">
                            {{ localeTime(item.fulfilled ? item.endDate : item.scheduledEndDate, $i18n.locale) }}
                          </s>
                          <span
                            >{{ localeTime(item.fulfilled ? item.scheduledEndDate : item.endDate, $i18n.locale) }}
                          </span>
                        </div>
                      </span>

                      <b
                        class="journal_item-status"
                        :class="{
                          fulfilled: item.fulfilled || item.currentDistance >= item.routeDistance * 0.9,
                          terminated: item.terminated && !item.fulfilled,
                          active: !item.terminated,
                        }"
                      >
                        {{
                          !item.terminated
                            ? $t('journal.timetable-active')
                            : item.fulfilled || item.currentDistance >= item.routeDistance * 0.9
                            ? $t('journal.timetable-fulfilled')
                            : $t('journal.timetable-abandoned')
                        }}
                      </b>
                    </div>

                    <div style="margin-top: 1em">
                      <div>
                        {{ $t('journal.timetable-day') }} <b>{{ localeDay(item.beginDate, $i18n.locale) }}</b>
                      </div>

                      <!-- Nick dyżurnego -->
                      <div v-if="item.authorName">
                        <b class="text--grayed">{{ $t('journal.dispatcher-name') }}&nbsp;</b>
                        <router-link
                          class="dispatcher-link"
                          :to="`/journal?view=dispatchers&dispatcherName=${item.authorName}`"
                          >{{ item.authorName }}</router-link
                        >
                      </div>
                    </div>

                    <div style="margin-top: 1em">
                      <div>
                        <b>{{ $t('journal.route-length') }}</b>
                        {{ !item.fulfilled ? item.currentDistance + ' /' : '' }}
                        {{ item.routeDistance }} km
                      </div>

                      <div>
                        <b>{{ $t('journal.station-count') }}</b>
                        {{ item.confirmedStopsCount }} /
                        {{ item.allStopsCount }}
                      </div>
                    </div>
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
import { computed, defineComponent, JournalFilter, JournalSearcher, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import { URLs } from '@/scripts/utils/apiURLs';
import { journalTimetableFilters } from '@/data/journalFilters';
import { JournalFilterType } from '@/scripts/enums/JournalFilterType';
import routerMixin from '@/mixins/routerMixin';

const PROD_MODE = process.env.VUE_APP_JOURNAL_TIMETABLES_DEV != '1' || process.env.NODE_ENV === 'production';

const TIMETABLES_API_URL = PROD_MODE
  ? `${URLs.stacjownikAPI}/api/getTimetables`
  : 'http://localhost:3001/api/getTimetables';

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
  mixins: [dateMixin, routerMixin],

  data: () => ({
    icons: {
      arrow: require('@/assets/icon-arrow-asc.svg'),
    },

    currentQuery: '',
    scrollDataLoaded: true,
    scrollNoMoreData: false,

    showReturnButton: false,

    journalTimetableFilters,
  }),

  setup() {
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const sorterActive = ref({ id: 'timetableId', dir: -1 });
    const journalFilterActive = ref(journalTimetableFilters[0]);

    const searchersValues = reactive([
      { id: 'search-train', value: '' },
      { id: 'search-driver', value: '' },
    ]);
    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('searchersValues', searchersValues);
    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      historyList: ref([]) as Ref<TimetableHistory[]>,
      historyDataStatus,

      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),
      isDataInit: computed(() => historyDataStatus.value.status === DataStatus.Initialized),

      sorterActive,
      journalFilterActive,
      searchersValues,

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
    navigateToTimetable(historyItem: TimetableHistory) {
      if (historyItem.terminated) return;

      this.navigateToTrain(historyItem.trainNo, historyItem.driverName);
    },

    getSceneryList(historyItem: TimetableHistory) {
      return historyItem.sceneriesString
        .split('%')
        .map((name, i) => ({ name, confirmed: i < historyItem.confirmedStopsCount }));
    },

    handleScroll() {
      this.showReturnButton = window.scrollY > window.innerHeight;

      const element = this.$refs.scrollElement as HTMLElement;

      if (
        element.getBoundingClientRect().bottom * 0.85 < window.innerHeight &&
        this.scrollDataLoaded &&
        !this.scrollNoMoreData &&
        window.scrollY > window.innerHeight
      )
        this.addHistoryData();
    },

    scrollToTop() {
      window.scrollTo({ top: 0 });
    },

    search() {
      this.fetchHistoryData({
        searchers: this.searchersValues,
        filter: this.journalFilterActive,
      });

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      const countFrom = this.historyList.length;

      const responseData: APIResponse | null = await (
        await axios.get(`${TIMETABLES_API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

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
        searchers?: JournalSearcher[];
        filter?: JournalFilter;
      } = {}
    ) {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];

      const driver = props.searchers?.find((s) => s.id == 'search-driver')?.value.trim();
      const train = props.searchers?.find((s) => s.id == 'search-train')?.value.trim();

      if (driver) queries.push(`driver=${driver}`);
      if (train) queries.push(`train=${train}`);

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
        const responseData: APIResponse | null = await (
          await axios.get(`${TIMETABLES_API_URL}?${this.currentQuery}`)
        ).data;

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

.journal_item {
  &-top {
    display: flex;
    justify-content: space-between;

    padding: 0.2em 0;

    .scenery-list {
      span {
        color: #adadad;

        &.confirmed {
          color: #a3eba3;
        }
      }
    }
  }

  &-status {
    &.terminated {
      color: salmon;
    }

    &.fulfilled {
      color: lightgreen;
    }

    &.active {
      color: lightblue;
    }
  }
}

.dispatcher-link {
  font-weight: bold;
}
</style>
