<template>
  <section class="history-view">
    <div class="history-wrapper">
      <JournalOptions @changedOptions="search" />

      <div class="history_list">
        <div class="list_wrapper">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <div v-if="isDataLoading" class="history_warning">{{ $t('app.loading') }}</div>

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
                        <b class="text--primary">{{ item.trainCategoryCode }}</b>
                        {{ item.trainNo }}
                      </span>

                      <div>
                        <b>{{ item.route.replace('|', ' - ') }}</b>
                      </div>

                      <div class="scenery-list">
                        <span
                          v-for="(scenery, i) in sceneryList(item)"
                          :key="scenery.name"
                          :class="{ confirmed: scenery.confirmed }"
                        >
                          {{ i > 0 ? ' - ' : '' }} {{ scenery.name }}
                        </span>
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

                  <div style="margin: 1em 0">
                    <div>
                      <b>{{ $t('history.driver-name') }}</b>
                      {{ item.driverName }}
                    </div>
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

                    <div>
                      <b>{{ $t('history.begins-at') }}</b>
                      {{ localeDate(item.beginDate, $i18n.locale) }}
                    </div>

                    <div>
                      <b>{{ $t('history.terminates-at') }}</b>
                      {{ localeDate(item.scheduledEndDate, $i18n.locale) }}
                    </div>

                    <div v-if="item.terminated">
                      <b>{{ $t('history.terminates-at-actual') }}</b>
                      {{ localeDate(item.endDate, $i18n.locale) }}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import FilterOption from '@/scripts/interfaces/FilterOption';

const PROD_MODE = true;

const API_URL = PROD_MODE
  ? 'https://stacjownik-api-di22o.ondigitalocean.app/api/getTimetables'
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
    exitIcon: require('@/assets/icon-exit.svg'),
  }),

  setup() {
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const sorterActive = ref({ id: 'date', dir: -1 });
    const searchedDriver = ref('');
    const searchedTrain = ref('');

    provide('searchedTrain', searchedTrain);
    provide('searchedDriver', searchedDriver);
    provide('sorterActive', sorterActive);

    return {
      historyList: ref([]) as Ref<TimetableHistory[]>,
      historyDataStatus,

      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),

      searchedDriver,
      searchedTrain,
      sorterActive,

      maxCount: ref(15),

      filters: reactive({ ...initFilters }) as { [filterSection: string]: { [filterId: string]: FilterOption } },
    };
  },

  mounted() {
    this.fetchHistoryData();
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
        maxCount?: number;
      } = {}
    ) {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];

      if (!props.searchedDriver && !props.searchedTrain) queries.push('count=15');
      if (props.maxCount) queries.push(`count=${props.maxCount}`);
      if (props.searchedDriver) queries.push(`driver=${props.searchedDriver}`);
      if (props.searchedTrain) queries.push(`train=${props.searchedTrain}`);

      // Z API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'distance') queries.push('sortBy=routeDistance');
      else if (this.sorterActive.id == 'total-stops') queries.push('sortBy=allStopsCount');

      console.log(queries);

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
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out 100ms;
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
</style>
