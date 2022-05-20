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
                  <li v-for="(doc, i) in computedHistoryList" :key="doc._id">
                    <div class="journal_day" v-if="isAnotherDay(i - 1, i)">
                      <span>{{ new Date(doc.timestampFrom).toLocaleDateString('pl-PL') }}</span>
                    </div>

                    <div
                      class="journal_item"
                      :class="{ online: doc.isOnline }"
                      @click="navigateToScenery(doc.stationName, doc.isOnline)"
                      @keydown.enter="navigateToScenery(doc.stationName, doc.isOnline)"
                      tabindex="0"
                    >
                      <span>
                        <b class="text--primary">{{ doc.dispatcherName }}</b> &bull; <b>{{ doc.stationName }}</b>
                        <span class="text--grayed">&nbsp;#{{ doc.stationHash }}&nbsp;</span>
                        <span class="region-badge" :class="doc.region">PL1</span>
                      </span>
                      <span>
                        <span :data-status="doc.isOnline"
                          >{{ doc.isOnline ? $t('history.online-since') : 'OFFLINE' }}&nbsp;</span
                        >
                        <span>
                          {{ new Date(doc.timestampFrom).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
                        </span>

                        <span v-if="doc.currentDuration && doc.isOnline">
                          ({{ calculateDuration(doc.currentDuration) }})
                        </span>

                        <span v-if="doc.timestampTo">
                          &gt;
                          {{ new Date(doc.timestampTo).toLocaleTimeString('pl-PL', { timeStyle: 'short' }) }}
                          ({{ $t('history.duty-lasted') }} {{ calculateDuration(doc.currentDuration!) }})
                        </span>
                      </span>
                    </div>

                    <!-- <div>{{ new Date(doc.timestampFrom).toLocaleDateString('pl-PL') }}</div> -->

                    <!-- <div v-if="doc.timestampTo && doc.currentDuration && doc.currentDuration <= 30*60*1000">
                      Wpis zostanie usunięty za {{ ~~((Date.now() - doc.currentDuration)) }} min.
                    </div> -->
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
import { computed, defineComponent, provide, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import { URLs } from '@/scripts/utils/apiURLs';
import { journalFilters } from '@/data/journalFilters';

const DEV_MODE = true;
const PROD_MODE = !DEV_MODE || process.env.NODE_ENV === 'production';

const DISPATCHERS_API_URL = (PROD_MODE ? `${URLs.stacjownikAPI}/api` : 'http://localhost:3001/api') + '/getDispatchers';

interface APIResponse {
  errorMessage: string | null;
  response: DispatcherHistoryItem[] | null;
}

interface DispatcherHistoryItem {
  _id: string;

  stationName: string;
  stationHash: string;
  region: string;

  dispatcherName: string;
  dispatcherId: number;

  timestampFrom: number;
  timestampTo?: number;
  currentDuration?: number;

  lastOnlineTimestamp: number;

  isOnline: boolean;
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
      historyList: ref([]) as Ref<DispatcherHistoryItem[]>,
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

  computed: {
    computedHistoryList() {
      return this.historyList.filter(
        (doc) => doc.isOnline || (doc.currentDuration && doc.currentDuration > 10 * 60000)
      ); //.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0));
    },
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
    navigateToScenery(name: string, isOnline: boolean) {
      if (!isOnline) return;

      this.$router.push(`/scenery?station=${name.trim().replace(/ /g, '_')}`);
    },

    calculateDuration(timestampMs: number) {
      const minsTotal = Math.round(timestampMs / 60000);
      const hoursTotal = Math.floor(minsTotal / 60);
      const minsInHour = minsTotal % 60;

      return minsTotal > 60
        ? this.$t('history.hours', { hours: hoursTotal, minutes: minsInHour })
        : this.$t('history.minutes', { minutes: minsTotal });
    },

    isAnotherDay(prevIndex: number, currIndex: number) {
      if (currIndex == 0) return true;

      return (
        new Date(this.computedHistoryList[prevIndex].timestampFrom).getDate() !=
        new Date(this.computedHistoryList[currIndex].timestampFrom).getDate()
      );
    },

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
      this.fetchHistoryData();

      this.scrollNoMoreData = false;
      this.scrollDataLoaded = true;
    },

    async addHistoryData() {
      this.scrollDataLoaded = false;

      const countFrom = this.historyList.length;

      const responseData: APIResponse | null = await (
        await axios.get(`${DISPATCHERS_API_URL}?${this.currentQuery}&countFrom=${countFrom}`)
      ).data;

      if (!responseData?.response) return;

      if (responseData.response.length == 0) {
        this.scrollNoMoreData = true;
        return;
      }

      this.historyList.push(...responseData.response);
      this.scrollDataLoaded = true;
    },

    async fetchHistoryData() {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];
      queries.push('countLimit=15');

      this.currentQuery = queries.join('&');

      // sorters; sortBy: duration, timestampFrom (default)
      // filters; dispatcherName, stationName

      try {
        const responseData: APIResponse | null = await (
          await axios.get(`${DISPATCHERS_API_URL}?${this.currentQuery}`)
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
@import '../../styles/responsive.scss';

.region-badge {
  padding: 0.1em 0.5em;
  border-radius: 0.5em;
  font-weight: bold;

  &.eu {
    background-color: forestgreen;
  }
}

.journal-wrapper {
  max-width: 1100px;
}

.journal_item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  flex-wrap: wrap;

  &.online {
    cursor: pointer;
  }

  span[data-status='true'] {
    color: springgreen;
  }

  span[data-status='false'] {
    color: salmon;
  }
}

.journal-current-day {
  position: sticky;
  top: -1px;

  padding: 0.5em 0;
  background-color: salmon;
}

.journal_day {
  position: relative;
  text-align: center;
  background-color: #4d4d4d;

  span {
    position: relative;
    background-color: #4d4d4d;
    z-index: 10;

    padding: 0 0.5em;
  }

  &::after {
    position: absolute;
    content: '';

    z-index: 0;

    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);

    height: 3px;
    width: 60%;
    min-width: 200px;

    background-color: white;
  }
}

@include smallScreen() {
  .journal_item {
    flex-direction: column;

    span {
      margin-top: 0.25em;
    }
  }
}
</style>
