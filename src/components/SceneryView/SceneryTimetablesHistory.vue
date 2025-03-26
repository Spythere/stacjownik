<template>
  <div class="scenery-timetables-history">
    <div class="history-modes">
      <button
        class="btn btn--option"
        v-for="mode in historyModeList"
        :key="mode"
        :class="{ checked: checkedHistoryMode == mode }"
        @click="checkHistoryMode(mode)"
      >
        {{ $t(`scenery.timetable-${mode}`) }}
      </button>
    </div>

    <div class="history-wrapper">
      <Loading v-if="dataStatus != DataStatus.Loaded" />

      <div v-else-if="historyList.length == 0" class="no-history">
        {{ $t('scenery.history-list-empty') }}
      </div>

      <div v-else class="journal-list">
        <div v-for="timetableHistory in historyList" :key="timetableHistory.id">
          <span>
            <div>
              <span
                class="timetable-status-indicator"
                :data-terminated="timetableHistory.terminated"
                :data-fulfilled="timetableHistory.fulfilled"
              >
                &ofcir;
              </span>
              #{{ timetableHistory.id }} |
              <b class="text--primary">{{ timetableHistory.trainCategoryCode }}</b>
              {{ timetableHistory.trainNo }}
              {{ timetableHistory.route.replace('|', ' &Rightarrow; ') }}
            </div>

            <div class="text--grayed">
              <span>
                {{ $t('scenery.timetable-issued-date') }}
                <b>
                  {{
                    localeDateTime(
                      timetableHistory.createdAt > timetableHistory.beginDate
                        ? timetableHistory.beginDate
                        : timetableHistory.createdAt,
                      $i18n.locale
                    )
                  }}
                </b></span
              >
              <span v-if="timetableHistory.authorName">
                {{ $t('scenery.timetable-issued-by') }}
                <b>
                  <router-link
                    :to="`/journal/timetables?search-dispatcher=${timetableHistory.authorName}`"
                  >
                    {{ timetableHistory.authorName }}
                  </router-link>
                </b>
              </span>

              <span>
                {{ $t('scenery.timetable-issued-for') }}
                <b>
                  <router-link
                    :to="`/journal/timetables?search-driver=${timetableHistory.driverName}`"
                  >
                    {{ timetableHistory.driverName }}
                  </router-link>
                </b>
              </span>
            </div>
          </span>

          <button
            @click="
              navigateTo(`/journal/timetables`, {
                'search-train': `#${timetableHistory.id}`
              })
            "
          >
            <img src="/images/icon-back.svg" alt="icon navigate to timetable" />
          </button>
        </div>
      </div>
    </div>

    <div class="bottom-info">
      <button class="btn btn--option" v-if="historyList.length > 0" @click="navigateToHistory()">
        {{ $t('scenery.bottom-info') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';

import Loading from '../Global/Loading.vue';
import { API } from '../../typings/api';
import { ActiveScenery, Station, Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';
import routerMixin from '../../mixins/routerMixin';
import { useMainStore } from '../../store/mainStore';

const historyModeList = ['via', 'issuedFrom', 'terminatingAt'] as const;
type HistoryMode = (typeof historyModeList)[number];

export default defineComponent({
  name: 'SceneryTimetablesHistory',
  mixins: [dateMixin, routerMixin],
  props: {
    station: {
      type: Object as PropType<Station>
    },
    onlineScenery: {
      type: Object as PropType<ActiveScenery>
    }
  },

  data() {
    return {
      historyList: [] as API.TimetableHistory.Response,
      historyModeList,

      apiStore: useApiStore(),
      mainStore: useMainStore(),
      dataStatus: Status.Data.Loading,
      DataStatus: Status.Data,

      checkedHistoryMode: 'via' as HistoryMode
    };
  },

  async activated() {
    this.fetchAPIData();
  },

  methods: {
    async fetchAPIData() {
      const stationName = this.$route.query['station'];

      if (!stationName) {
        this.historyList = [];
        this.dataStatus = Status.Data.Loaded;
        return;
      }

      const requestFilters: Record<string, any> = {};
      requestFilters[this.checkedHistoryMode] = stationName.toString();
      requestFilters.countLimit = 30;

      try {
        const response: API.TimetableHistory.Response = await (
          await this.apiStore.client!.get('api/getTimetables', {
            params: requestFilters
          })
        ).data;

        this.historyList = response;

        this.dataStatus = Status.Data.Loaded;
      } catch (error) {
        console.error(error);
      }
    },

    checkHistoryMode(mode: HistoryMode) {
      this.checkedHistoryMode = mode;
      this.dataStatus = Status.Data.Loading;
      this.fetchAPIData();
    },

    navigateToHistory() {
      this.$router.push({
        path: '/journal/timetables',
        query: {
          [`search-${this.checkedHistoryMode}`]: this.station?.name || this.onlineScenery?.name
        }
      });
    }
  },
  components: { Loading }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use '../../styles/scenery-history-table';

.scenery-timetables-history {
  height: 100%;
  overflow: auto;

  display: grid;
  gap: 1em;
  grid-template-rows: auto 1fr 40px;
}

.history-wrapper {
  position: relative;
  overflow: auto;
}

.history-modes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  gap: 0.5em;
  padding: 0.25em;

  button {
    padding: 0.35em;
    min-width: 120px;
  }
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  text-align: left;
}

.journal-list > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em;
  background-color: #2b2b2b;
  line-height: 1.5em;
}

.journal-list > div > button > img {
  width: 2em;
  transform: rotate(180deg);
}

.timetable-status-indicator {
  &[data-fulfilled='true'] {
    color: lightgreen;
  }

  &[data-terminated='false'] {
    color: lightblue;
  }

  &[data-terminated='true'][data-fulfilled='false'] {
    color: lightcoral;
  }
}
</style>
