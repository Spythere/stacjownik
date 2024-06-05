<template>
  <div class="scenery-timetables-history">
    <div class="top-filters">
      <button
        class="btn btn--option"
        v-for="mode in historyModeList"
        :key="mode"
        :class="{ checked: checkedHistoryMode == mode }"
        @click="checkHistoryMode(mode)"
      >
        {{ $t(`scenery.timetable-${mode}`) }}
      </button>

      <!-- <button class="btn btn--option checked">PRZEZ</button> -->

      <!-- <button class="btn btn--option checked">KOŃCZY BIEG</button> -->
    </div>

    <div class="history-wrapper">
      <Loading v-if="dataStatus != DataStatus.Loaded" />

      <div class="no-history" v-else-if="historyList.length == 0">
        {{ $t('scenery.history-list-empty') }}
      </div>

      <table class="scenery-history-table" v-else>
        <thead>
          <th>{{ $t('scenery.timetables-history-id') }}</th>
          <th style="width: 15%">{{ $t('scenery.timetables-history-number') }}</th>
          <th style="width: 25%">{{ $t('scenery.timetables-history-route') }}</th>
          <th>{{ $t('scenery.timetables-history-driver') }}</th>
          <th>{{ $t('scenery.timetables-history-author') }}</th>
          <th style="width: 20%">{{ $t('scenery.timetables-history-date') }}</th>
        </thead>

        <tbody>
          <tr v-for="historyItem in historyList" :key="historyItem.id">
            <td>
              <router-link :to="`/journal/timetables?search-train=%23${historyItem.id}`">
                #{{ historyItem.id }}
              </router-link>
            </td>
            <td>
              <b class="text--primary">{{ historyItem.trainCategoryCode }}</b>
              {{ historyItem.trainNo }}
            </td>
            <td>{{ historyItem.route.replace('|', ' -> ') }}</td>
            <td>
              <router-link :to="`/journal/timetables?search-driver=${historyItem.driverName}`">
                {{ historyItem.driverName }}
              </router-link>
            </td>

            <td>
              <router-link
                v-if="historyItem.authorName"
                :to="`/journal/timetables?search-dispatcher=${historyItem.authorName}`"
                >{{ historyItem.authorName }}
              </router-link>
              <i v-else>{{ $t('scenery.timetable-author-unknown') }}</i>
            </td>
            <td>
              <b>{{
                localeDateTime(
                  historyItem.createdAt > historyItem.beginDate
                    ? historyItem.beginDate
                    : historyItem.createdAt,
                  $i18n.locale
                )
              }}</b>
            </td>
          </tr>
        </tbody>
      </table>
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

const historyModeList = ['issuedFrom', 'terminatingAt', 'via'] as const;
type HistoryMode = (typeof historyModeList)[number];

export default defineComponent({
  name: 'SceneryTimetablesHistory',
  mixins: [dateMixin],
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
      dataStatus: Status.Data.Loading,
      DataStatus: Status.Data,

      checkedHistoryMode: 'issuedFrom' as HistoryMode
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
@import '../../styles/responsive.scss';
@import '../../styles/sceneryViewTables.scss';

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

.top-filters {
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
</style>
