<template>
  <section class="journal-timetables">
    <keep-alive>
      <DriverStats v-if="statsCardOpen" @close-card="closeCard" />
    </keep-alive>

    <div class="journal-wrapper">
      <div class="journal_top-bar">
        <JournalOptions
          @on-input-change="search"
          @on-filter-change="search"
          @on-sorter-change="search"
          :sorter-option-ids="['timetableId', 'beginDate', 'distance', 'total-stops']"
          :filters="journalTimetableFilters"
        />
      </div>

      <div class="journal-list">
        <div class="list-wrapper" ref="scrollElement">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <Loading v-if="isDataLoading || isDataInit" />

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
                          :to="`/journal/dispatchers?dispatcherName=${item.authorName}`"
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
import { computed, defineComponent, JournalFilter, provide, reactive, Ref, ref } from 'vue';
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

const TIMETABLES_API_URL = `${URLs.stacjownikAPI}/api/getTimetables`;

type JournalTimetableSearcher = {
  [key in 'search-driver' | 'search-train']: string;
};

export default defineComponent({
  components: { DriverStats, Loading, JournalOptions },
  mixins: [dateMixin, routerMixin],

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

    journalTimetableFilters,
  }),

  setup() {
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const sorterActive = ref({ id: 'timetableId', dir: -1 });
    const journalFilterActive = ref(journalTimetableFilters[0]);

    const searchersValues = reactive({
      'search-train': '',
      'search-driver': '',
    } as JournalTimetableSearcher);

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
      store: useStore(),
    };
  },

  activated() {
    window.addEventListener('wheel', this.handleScroll);

    if (this.timetableId) {
      this.searchersValues['search-train'] = `#${this.timetableId}`;
      this.search();
    }
  },

  mounted() {
    if (!this.timetableId) this.search();
  },

  deactivated() {
    window.removeEventListener('wheel', this.handleScroll);
  },

  methods: {
    navigateToTimetable(historyItem: TimetableHistory) {
      if (historyItem.terminated) return;

      this.navigateTo('/trains', {
        trainNo: historyItem.trainNo,
        driverName: historyItem.driverName,
      });
    },

    closeCard() {
      this.statsCardOpen = false;
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
        this.historyDataStatus.status == DataStatus.Loaded
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

      const responseData: TimetableHistory[] = await (
        await axios.get(`${TIMETABLES_API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

      if (!responseData) return;

      if (responseData.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData(
      props: {
        searchers?: JournalTimetableSearcher;
        filter?: JournalFilter;
      } = {}
    ) {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];

      const driver = props.searchers?.['search-driver'].trim();
      const train = props.searchers?.['search-train'].trim();

      if (driver) queries.push(`driverName=${driver}`);
      if (train) queries.push(train.startsWith('#') ? `timetableId=${train.replace('#', '')}` : `trainNo=${train}`);

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
          this.historyDataStatus.status = DataStatus.Error;
          this.historyDataStatus.error = 'Brak danych!';
          return;
        }

        if (!responseData) return;

        // Response data exists
        this.historyList = responseData;

        // Stats display
        this.store.driverStatsName =
          this.historyList.length > 0 && this.searchersValues['search-driver'].trim()
            ? this.historyList[0].driverName
            : '';

        this.historyDataStatus.status = DataStatus.Loaded;
      } catch (error) {
        this.historyDataStatus.status = DataStatus.Error;
        this.historyDataStatus.error = 'Ups! Coś poszło nie tak!';

        console.error(error);
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
