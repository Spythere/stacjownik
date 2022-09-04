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

              <div class="journal_warning" v-else-if="computedTimetableHistory.length == 0">
                {{ $t('app.no-result') }}
              </div>

              <ul v-else>
                <transition-group name="journal-list-anim">
                  <li
                    v-for="{ timetable, sceneryList, ...item } in computedTimetableHistory"
                    class="journal_item"
                    :key="timetable.timetableId"
                  >
                    <div class="journal_item-info">
                      <div class="info-top">
                        <span
                          tabindex="0"
                          @click="showTimetable(timetable)"
                          @keydown.enter="showTimetable(timetable)"
                          style="cursor: pointer"
                        >
                          <b class="text--primary">{{ timetable.trainCategoryCode }}&nbsp;</b>
                          <b>{{ timetable.trainNo }}</b>
                          | <span>{{ timetable.driverName }}</span> |
                          <span class="text--grayed">#{{ timetable.timetableId }}</span>
                        </span>

                        <span>
                          <b class="info-date">{{ localeDay(timetable.beginDate, $i18n.locale) }}</b>
                          <b
                            class="info-status"
                            :class="{
                              fulfilled:
                                timetable.fulfilled || timetable.currentDistance >= timetable.routeDistance * 0.9,
                              terminated: timetable.terminated && !timetable.fulfilled,
                              active: !timetable.terminated,
                            }"
                          >
                            {{
                              !timetable.terminated
                                ? $t('journal.timetable-active')
                                : timetable.fulfilled || timetable.currentDistance >= timetable.routeDistance * 0.9
                                ? $t('journal.timetable-fulfilled')
                                : `${$t('journal.timetable-abandoned')} ${localeTime(timetable.endDate, $i18n.locale)}`
                            }}
                          </b>
                        </span>
                      </div>

                      <div class="info-route">
                        <b>{{ timetable.route.replace('|', ' - ') }}</b>
                      </div>

                      <hr />

                      <div class="scenery-list">
                        <span
                          v-for="(scenery, i) in sceneryList"
                          :key="scenery.name"
                          :class="{ confirmed: scenery.confirmed }"
                        >
                          <span v-if="i > 0"> &gt;</span>
                          {{ scenery.name }}

                          <!-- Data odjazdu ze stacji początkowej -->
                          <span v-if="i == 0" v-html="scenery.beginDateHTML"></span>

                          <!-- Data przyjazdu do stacji końcowej -->
                          <span v-if="i == sceneryList.length - 1" v-html="scenery.endDateHTML"> </span>
                        </span>
                      </div>

                      <!-- Status RJ -->
                      <div style="margin: 0.5em 0">
                        <span>
                          <b>{{ $t('journal.route-length') }}</b>
                          {{ !timetable.fulfilled ? timetable.currentDistance + ' /' : '' }}
                          {{ timetable.routeDistance }} km
                        </span>
                        &bull;
                        <span>
                          <b>{{ $t('journal.station-count') }}</b>
                          {{ timetable.confirmedStopsCount }} /
                          {{ timetable.allStopsCount }}
                        </span>
                      </div>

                      <!-- Nick dyżurnego -->
                      <div v-if="timetable.authorName">
                        <b class="text--grayed">{{ $t('journal.dispatcher-name') }}&nbsp;</b>
                        <router-link
                          class="dispatcher-link"
                          :to="`/journal/dispatchers?dispatcherName=${timetable.authorName}`"
                        >
                          <b>{{ timetable.authorName }}</b>
                        </router-link>
                      </div>

                      <button
                        v-if="timetable.stockString"
                        class="btn--option btn--show"
                        @click="item.showStock.value = !item.showStock.value"
                      >
                        {{ $t('journal.stock-info') }}
                        <img :src="getIcon(`arrow-${item.showStock.value ? 'asc' : 'desc'}`)" alt="Arrow" />
                      </button>

                      <div class="info-extended" v-if="timetable.stockString" v-show="item.showStock.value">
                        <hr />

                        <div>
                          {{ `${$t('journal.stock-max-speed')}: ${timetable.maxSpeed}km/h` }} &bull;
                          {{ `${$t('journal.stock-length')}: ${timetable.stockLength}m` }} &bull;
                          {{ `${$t('journal.stock-mass')}: ${Math.floor(timetable.stockMass! / 1000)}t` }}
                        </div>

                        <ul class="stock-list">
                          <li v-for="(car, i) in timetable.stockString.split(';')" :key="i">
                            <img
                              @error="onImageError"
                              :src="`https://rj.td2.info.pl/dist/img/thumbnails/${car.split(':')[0]}.png`"
                              :alt="car"
                            />

                            <div>{{ car.replace(/_/g, ' ').split(':')[0] }}</div>
                          </li>
                        </ul>
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
import { JournalTimetableSearcher } from '../../types/JournalTimetablesTypes';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import imageMixin from '../../mixins/imageMixin';

const TIMETABLES_API_URL = `${URLs.stacjownikAPI}/api/getTimetables`;

export default defineComponent({
  components: { DriverStats, Loading, JournalOptions },
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
    window.addEventListener('scroll', this.handleScroll);

    if (this.timetableId) {
      this.searchersValues['search-train'] = `#${this.timetableId}`;
      this.search();
    }
  },

  mounted() {
    if (!this.timetableId) this.search();
  },

  deactivated() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  computed: {
    computedTimetableHistory() {
      return this.timetableHistory.map((timetable) => ({
        timetable,
        sceneryList: this.getSceneryList(timetable),
        showStock: ref(false),
      }));
    },
  },

  methods: {
    showTimetable(timetable: TimetableHistory) {
      if (timetable.terminated) return;

      this.selectModalTrain(timetable.driverName + timetable.trainNo.toString());
      // this.navigateTo('/trains', {
      //   trainNo: timetable.trainNo,
      //   driverName: timetable.driverName,
      // });
    },

    closeCard() {
      this.statsCardOpen = false;
    },

    getSceneryList(timetable: TimetableHistory) {
      return timetable.sceneriesString.split('%').map((name, i) => {
        const beginDateHTML =
          ' (o. ' +
          (timetable.beginDate != timetable.scheduledBeginDate
            ? `<s class='text--grayed'>${this.localeTime(timetable.beginDate, this.$i18n.locale)}</s> `
            : '') +
          `<span>${this.localeTime(timetable.scheduledBeginDate, this.$i18n.locale)}</span>)`;

        const endDateHTML =
          ' (p. ' +
          (timetable.endDate != timetable.scheduledEndDate && timetable.fulfilled
            ? `<s class='text--grayed'>${this.localeTime(
                timetable.fulfilled ? timetable.endDate : timetable.scheduledEndDate,
                this.$i18n.locale
              )}</s> `
            : '') +
          `<span>${this.localeTime(
            timetable.fulfilled || (timetable.terminated && !timetable.fulfilled)
              ? timetable.scheduledEndDate
              : timetable.endDate,
            this.$i18n.locale
          )}</span>)`;

        const abandonedDateHTML = ` (porz. ${this.localeTime(
          timetable.fulfilled ? timetable.scheduledEndDate : timetable.endDate,
          this.$i18n.locale
        )})`;

        return { name, confirmed: i < timetable.confirmedStopsCount, beginDateHTML, endDateHTML, abandonedDateHTML };
      });
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = this.getImage('unknown.png');
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
        this.timetableHistory = responseData;

        // Stats display
        this.store.driverStatsName =
          this.timetableHistory.length > 0 && this.searchersValues['search-driver'].trim()
            ? this.timetableHistory[0].driverName
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
@import '../../styles/responsive.scss';

hr {
  margin: 0.25em 0;
}

.info {
  &-date {
    margin-right: 0.5em;
  }

  &-status {
    padding: 0.05em 0.35em;
    color: black;

    &.terminated {
      background-color: salmon;
    }

    &.fulfilled {
      background-color: lightgreen;
    }

    &.active {
      background-color: lightblue;
    }
  }

  &-top {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  &-route {
    margin: 0.25em 0;
  }

  &-extended {
    margin-top: 0.5em;
  }
}

ul.stock-list {
  display: flex;
  align-items: flex-end;
  overflow: auto;
  padding-bottom: 0.5em;
  margin-top: 1em;

  li > div {
    text-align: center;
    color: #aaa;
    font-size: 0.9em;
  }
}

.scenery-list {
  color: #adadad;
  span.confirmed {
    color: #a3eba3;
  }
}

.btn--show {
  display: flex;
  margin-top: 1em;
  font-weight: bold;
  padding: 0.2em 0.45em;

  img {
    height: 1.3em;
  }
}

@include smallScreen {
  .info-top {
    flex-direction: column;

    span {
      margin: 0.1em auto;
    }
  }

  .info-extended {
    text-align: center;
  }

  .info-route {
    display: flex;
    justify-content: center;
  }

  .btn--show {
    margin: 1em auto 0 auto;
  }
}
</style>
