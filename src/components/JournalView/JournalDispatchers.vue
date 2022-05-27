<template>
  <section class="journal-timetables">
    <div class="journal-wrapper">
      <journal-options
        @on-filter-change="search"
        @on-input-change="search"
        @on-sorter-change="search"
        :sorter-option-ids="['timestampFrom', 'duration']"
      />

      <button class="return-btn" @click="scrollToTop" v-if="showReturnButton">
        <img :src="icons.arrow" alt="return arrow" />
      </button>

      <div class="journal-list">
        <div class="list-wrapper" ref="scrollElement">
          <transition name="warning" mode="out-in">
            <div :key="historyDataStatus.status">
              <div class="journal_warning loading" v-if="isDataLoading || isDataInit">
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
                          >{{ doc.isOnline ? $t('journal.online-since') : 'OFFLINE' }}&nbsp;</span
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
                          ({{ $t('journal.duty-lasted') }} {{ calculateDuration(doc.currentDuration!) }})
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
import { computed, defineComponent, JournalFilter, JournalSearcher, provide, reactive, Ref, ref } from 'vue';
import axios from 'axios';

import SearchBox from '@/components/Global/SearchBox.vue';
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';

import ActionButton from '@/components/Global/ActionButton.vue';
import JournalOptions from '@/components/JournalView/JournalOptions.vue';

import { URLs } from '@/scripts/utils/apiURLs';

const PROD_MODE = process.env.VUE_APP_JORUNAL_DISPATCHERS_DEV != '1' || process.env.NODE_ENV === 'production';

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

    const sorterActive = ref({ id: 'timestampFrom', dir: -1 });
    const journalFilterActive = ref({});
    const searchersValues = reactive([
      { id: 'search-dispatcher', value: '' },
      { id: 'search-station', value: '' },
    ]);

    const countFromIndex = ref(0);
    const countLimit = 15;

    provide('sorterActive', sorterActive);
    provide('journalFilterActive', journalFilterActive);
    provide('searchersValues', searchersValues);

    const scrollElement: Ref<HTMLElement | null> = ref(null);

    return {
      historyList: ref([]) as Ref<DispatcherHistoryItem[]>,
      historyDataStatus,

      isDataLoading: computed(() => historyDataStatus.value.status === DataStatus.Loading),
      isDataError: computed(() => historyDataStatus.value.status === DataStatus.Error),
      isDataInit: computed(() => historyDataStatus.value.status === DataStatus.Initialized),

      sorterActive,
      searchersValues,

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
    const query = this.$route.query;

    console.log("Mounted");
    

    if (query.sceneryName || query.dispatcherName) {
      this.searchersValues[1].value = query.sceneryName?.toString() || "";
      this.searchersValues[0].value = query.dispatcherName?.toString() || "";
      
      this.search();

      return;
    }

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
        ? this.$t('journal.hours', { hours: hoursTotal, minutes: minsInHour })
        : this.$t('journal.minutes', { minutes: minsTotal });
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
      this.fetchHistoryData({
        searchers: this.searchersValues,
      });

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

    async fetchHistoryData(
      props: {
        searchers?: JournalSearcher[];
        filter?: JournalFilter;
      } = {}
    ) {
      this.historyDataStatus.status = DataStatus.Loading;

      const queries: string[] = [];

      const dispatcher = props.searchers?.find((s) => s.id == 'search-dispatcher')?.value.trim();
      const station = props.searchers?.find((s) => s.id == 'search-station')?.value.trim();

      if (dispatcher) queries.push(`dispatcherName=${dispatcher}`);
      if (station) queries.push(`stationName=${station}`);

      // Z API: const SORT_TYPES = ['allStopsCount', 'endDate', 'beginDate', 'routeDistance'];
      if (this.sorterActive.id == 'timestampFrom') queries.push('sortBy=timestampFrom');
      else if (this.sorterActive.id == 'duration') queries.push('sortBy=duration');
      else queries.push('sortBy=timestampFrom');

      queries.push('countLimit=15');

      this.currentQuery = queries.join('&');

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

.list-wrapper {
  margin-top: 1em;
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
