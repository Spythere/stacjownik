<template>
  <section class="history-view">
    <div class="history-wrapper">
      <JournalOptions @changedOptions="search" />

      <div class="history_list">
        <div class="list_wrapper" ref="scrollElement">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <!-- <div v-if="isDataLoading" class="history_warning"></div> -->

              <div v-if="!isDataLoading && isDataError" class="history_warning error">
                {{ $t('app.error') }}
              </div>

              <div class="history_warning" v-if="!isDataLoading && !isDataError && historyList.length == 0">
                {{ $t('app.no-result') }}
              </div>

              <ul v-if="!isDataLoading && !isDataError">
                <li v-for="(item, i) in historyList" :key="item.timetableId" :style="`--delay: ${i * 50}ms`">
                  <div class="history_item-top">
                    <span>
                      <span @click="navigateToTrain(!item.terminated ? item.trainNo : null)" style="cursor: pointer">
                        <b class="text--primary">{{ item.trainCategoryCode }}&nbsp;</b>
                        <b>{{ item.trainNo }}</b>
                        | <span>{{ item.driverName }}</span> | <span class="text--grayed">#{{ item.timetableId }}</span>
                      </span>

                      <div>
                        <b>{{ item.route.replace('|', ' - ') }}</b>
                      </div>

                      <hr style="margin: 0.25em 0" />

                      <div class="scenery-list">
                        <span
                          v-for="(scenery, i) in sceneryList(item)"
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
                          {{ localeTime(item.scheduledBeginDate, $i18n.locale) }}
                        </s>
                        <span>{{ localeTime(item.beginDate, $i18n.locale) }} </span>&bull;

                        <!-- Data przyjazdu na stację końcową / porzucenia -->
                        <b v-if="(item.fulfilled && item.terminated) || !item.terminated"
                          >{{ item.route.split('|').slice(-1)[0] }}:</b
                        >
                        <i v-else>{{ $t('history.timetable-abandoned') }} </i>

                        <s v-if="item.endDate != item.scheduledEndDate && item.terminated" class="text--grayed">
                          {{ localeTime(item.scheduledEndDate, $i18n.locale) }}
                        </s>
                        <span>{{ localeTime(item.endDate, $i18n.locale) }} </span>
                      </div>
                    </span>

                    <b
                      class="history_item-status"
                      :class="{
                        fulfilled: item.fulfilled || item.currentDistance >= item.routeDistance * 0.9,
                        terminated: item.terminated && !item.fulfilled,
                        active: !item.terminated,
                      }"
                    >
                      {{
                        !item.terminated
                          ? $t('history.timetable-active')
                          : item.fulfilled || item.currentDistance >= item.routeDistance * 0.9
                          ? $t('history.timetable-fulfilled')
                          : $t('history.timetable-abandoned')
                      }}
                    </b>
                  </div>

                  <div style="margin-top: 1em;">
                    <div>{{ $t('history.timetable-day') }} {{ localeDay(item.beginDate, $i18n.locale) }}</div>

                    <!-- Nick dyżurnego -->
                    <div v-if="item.authorName" class="text--grayed">
                      <b>{{ $t('history.dispatcher-name') }} {{ item.authorName }}</b>
                    </div>
                  </div>

                  <div style="margin-top: 1em;">
                    <div>
                      <b>{{ $t('history.route-length') }}</b>
                      {{ !item.fulfilled ? item.currentDistance + ' /' : '' }}
                      {{ item.routeDistance }} km
                    </div>

                    <div>
                      <b>{{ $t('history.station-count') }}</b>
                      {{ item.confirmedStopsCount }} /
                      {{ item.allStopsCount }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>

      <div class="history-loading" v-if="isDataLoading">
        <img :src="icons.loading" alt="loading icon" />
        <span class="loading-label">{{ $t('app.loading') }}</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import FilterOption from '@/scripts/interfaces/FilterOption';
import { URLs } from '@/scripts/utils/apiURLs';

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

const initFilters = {
  status: {
    active: {
      id: 'active',
      name: 'status',
      value: false,
      defaultValue: false,
    },

    abandoned: {
      id: 'abandoned',
      name: 'status',
      value: false,
      defaultValue: false,
    },

    fulfilled: {
      id: 'fulfilled',
      name: 'status',
      value: true,
      defaultValue: true,
    },
  },
};

export default defineComponent({
  components: { SearchBox, ActionButton, JournalOptions },
  mixins: [dateMixin],

  data: () => ({
    icons: {
      loading: require('@/assets/icon-loading.svg'),
    },
  }),

  setup() {
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const sorterActive = ref({ id: 'timetableId', dir: -1 });
    const searchedDriver = ref('');
    const searchedTrain = ref('');
    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    const handleScroll = (e: Event) => {
      if (!scrollElement.value) return;

      const element = scrollElement.value;

      if (element.getBoundingClientRect().bottom * 0.9 < window.innerHeight) {
        // console.log('gituwa');
        // historyDataStatus.value.status = DataStatus.Loading
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      historyList: ref([]) as Ref<TimetableHistory[]>,
      historyDataStatus,

      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),

      searchedDriver,
      searchedTrain,
      sorterActive,

      countFromIndex,
      countLimit,

      scrollElement,
      maxCount: ref(15),

      filters: reactive({ ...initFilters }) as { [filterSection: string]: { [filterId: string]: FilterOption } },
    };
  },

  mounted() {
    setTimeout(() => {
      this.fetchHistoryData();
    }, 250);
  },

  methods: {
    sceneryList(historyItem: TimetableHistory) {
      return historyItem.sceneriesString
        .split('%')
        .map((name, i) => ({ name, confirmed: i < historyItem.confirmedStopsCount }));
    },
    navigateToTrain(trainNo: number | null) {
      if (!trainNo) return;

      this.$router.push({
        name: 'TrainsView',
        query: { train: trainNo.toString() },
      });
    },

    search() {
      this.fetchHistoryData({
        searchedDriver: this.searchedDriver,
        searchedTrain: this.searchedTrain,
      });
    },

    keyPressed({ keyCode }) {
      if (keyCode == 13) this.search();
    },

    async fetchHistoryData(
      props: {
        searchedDriver?: string;
        searchedTrain?: string;
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

      try {
        const responseData: APIResponse | null = await (await axios.get(`${API_URL}?${queries.join('&')}`)).data;

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
@import '../styles/responsive.scss';
@import '../styles/option.scss';

.warning {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 200ms ease-in-out;
  }

  &-leave-active {
    transition: all 200ms ease-in-out;
  }
}

.history-view {
  height: 100%;

  display: flex;
  justify-content: center;
}

.history-wrapper {
  width: 1300px;

  padding: 1em 0.5em;
}

.history_item {
  &-top {
    display: flex;
    justify-content: space-between;

    padding: 0.2em 0;

    .scenery-list {
      span {
        color: #adadad;

        &.confirmed {
          color: rgb(163, 235, 163);
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

.history_search {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  @include smallScreen() {
    justify-content: center;
    flex-direction: column;
  }
}

.history_warning {
  text-align: center;
  font-size: 1.3em;

  &.error {
    background-color: var(--clr-error);
  }
}

.schedule-dates > * {
  margin-right: 0.25em;
}

li,
.history_warning {
  background: #202020;
  padding: 1em;
  margin: 1em 0;
}

@include smallScreen() {
  .history-view {
    font-size: 1.25em;
  }
}

.history-loading {
  margin-top: 2em;

  img {
    margin: 0 auto;
    display: block;

    width: 8em;
  }

  text-align: center;

  .loading-label {

    background: #333;
    color: white;

    padding: 0.5em 0.5em;
    font-size: 1.3em;

    border-radius: 1em;
  }
}
</style>
