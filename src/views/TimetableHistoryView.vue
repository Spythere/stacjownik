<template>
  <section class="history-view">
    <div class="history-wrapper">
      <h2>{{ $t('history.title') }}</h2>
      <form class="history_search" action="javascript:void(0);">
        <div class="search-box">
          <input
            class="search-input"
            v-model="searchedTrain"
            :placeholder="$t('history.search-train')"
            @submit="test"
          />
          <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="clearTrain" />
        </div>
        <div class="search-box">
          <input class="search-input" v-model="searchedDriver" :placeholder="$t('history.search-driver')" />
          <img class="search-exit" :src="exitIcon" alt="exit-icon" @click="clearDriver" />
        </div>
        <action-button class="search-button" @click="search">
          {{ $t('history.search') }}
        </action-button>
      </form>

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

                      <div class="text--grayed">
                        {{ item.sceneriesString.replaceAll('%', ' - ') }}
                      </div>
                    </span>

                    <b
                      class="history_item-status"
                      :class="{
                        fulfilled: item.fulfilled,
                        terminated: item.terminated && !item.fulfilled,
                        active: !item.terminated,
                      }"
                    >
                      {{
                        !item.terminated
                          ? $t('history.timetable-active')
                          : item.fulfilled
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
import { computed, defineComponent, Ref, ref } from 'vue';
import axios from 'axios';

import ActionButton from '@/components/Global/ActionButton.vue';
import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

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

export default defineComponent({
  components: { SearchBox, ActionButton },
  mixins: [dateMixin],

  data: () => ({
    exitIcon: require('@/assets/icon-exit.svg'),
  }),
  setup() {
    const historyList: Ref<TimetableHistory[]> = ref([]);
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> = ref({
      status: DataStatus.Loading,
      error: null,
    });

    const searchedDriver = ref('');
    const searchedTrain = ref('');
    const maxCount = ref(15);

    const fetchHistoryData = async (
      props: {
        searchedDriver?: string;
        searchedTrain?: string;
        maxCount?: number;
      } = {}
    ) => {
      historyDataStatus.value.status = DataStatus.Loading;

      const queries: string[] = [];

      if (!props.searchedDriver && !props.searchedTrain) queries.push('count=15');
      if (props.maxCount) queries.push(`count=${props.maxCount}`);
      if (props.searchedDriver) queries.push(`driver=${props.searchedDriver}`);
      if (props.searchedTrain) queries.push(`train=${props.searchedTrain}`);

      try {
        const responseData: APIResponse | null = await (await axios.get(`${API_URL}?${queries.join('&')}`)).data;

        if (!responseData) {
          historyDataStatus.value.status = DataStatus.Error;
          historyDataStatus.value.error = 'Brak danych!';
          return;
        }

        if (responseData.errorMessage) {
          historyDataStatus.value.status = DataStatus.Error;
          historyDataStatus.value.error = responseData.errorMessage;

          return;
        }

        if (!responseData.response) return;

        // Response data exists
        historyList.value = responseData.response;
        historyDataStatus.value.status = DataStatus.Loaded;
      } catch (error) {
        historyDataStatus.value.status = DataStatus.Error;
        historyDataStatus.value.error = 'Ups! Coś poszło nie tak!';
      }
    };

    // on created
    fetchHistoryData();

    return {
      historyList,
      searchedDriver,
      searchedTrain,
      maxCount,
      fetchHistoryData,
      historyDataStatus,
      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),
    };
  },

  methods: {
    navigateToTrain(trainNo: number | null) {
      if (!trainNo) return;

      this.$router.push({
        name: 'TrainsView',
        query: { train: trainNo.toString() },
      });
    },

    clearDriver() {
      this.searchedDriver = '';

      this.search();
    },

    test() {
      console.log('xd');
    },

    clearTrain() {
      this.searchedTrain = '';

      this.search();
    },

    async search() {
      this.fetchHistoryData({
        searchedDriver: this.searchedDriver,
        searchedTrain: this.searchedTrain,
      });
    },

    keyPressed({ keyCode }) {
      if (keyCode == 13) this.search();
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive.scss';

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
  width: 1000px;
  padding: 2em 1em;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.history_item {
  &-top {
    display: flex;
    justify-content: space-between;

    padding: 0.2em 0;
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

  margin-bottom: 0.5em;

  @include smallScreen() {
    justify-content: center;
    flex-direction: column;
  }
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;

    margin: 0.5em 0 0.5em 0.5em;

    @include smallScreen() {
      width: 85%;
    }
  }

  &-input {
    border: none;

    min-width: 85%;
    padding: 0.35em 0.5em;
  }

  &-exit {
    position: absolute;
    cursor: pointer;

    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    width: 1em;
  }
}

.search-button {
  margin-left: 0.5em;
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

  .search-button {
    margin-left: 0;
    margin-top: 0.5em;
  }
}
</style>
