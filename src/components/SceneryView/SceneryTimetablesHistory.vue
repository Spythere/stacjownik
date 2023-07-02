<template>
  <section class="scenery-table-section">
    <Loading v-if="dataStatus != DataStatus.Loaded" />
    <div class="no-history" v-else-if="historyList.length == 0">{{ $t('scenery.history-list-empty') }}</div>

    <table class="scenery-history-table" v-else>
      <thead>
        <th>{{ $t('scenery.timetables-history-id') }}</th>
        <th>{{ $t('scenery.timetables-history-number') }}</th>
        <th>{{ $t('scenery.timetables-history-route') }}</th>
        <th>{{ $t('scenery.timetables-history-driver') }}</th>
        <th>{{ $t('scenery.timetables-history-author') }}</th>
        <th>{{ $t('scenery.timetables-history-date') }}</th>
      </thead>

      <tbody>
        <tr v-for="historyItem in historyList">
          <td>
            <router-link :to="`/journal/timetables?timetableId=${historyItem.id}`">#{{ historyItem.id }}</router-link>
          </td>
          <td>
            <b class="text--primary">{{ historyItem.trainCategoryCode }}</b> <br />
            {{ historyItem.trainNo }}
          </td>
          <td>{{ historyItem.route.replace('|', ' -> ') }}</td>
          <td>{{ historyItem.driverName }}</td>
          <td>
            <router-link
              v-if="historyItem.authorName"
              :to="`/journal/timetables?authorName=${historyItem.authorName}`"
              >{{ historyItem.authorName }}
            </router-link>
            <i v-else>{{ $t('scenery.timetable-author-unknown') }}</i>
          </td>
          <td>
            <b>{{ localeDay(historyItem.beginDate, $i18n.locale) }}</b>
            {{ localeTime(historyItem.beginDate, $i18n.locale) }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <div class="bottom-info">
    <button class="btn btn--option" v-if="historyList.length > 0" @click="navigateToHistory()">
      {{ $t('scenery.bottom-info') }}
    </button>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { TimetableHistory, SceneryTimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import Station from '../../scripts/interfaces/Station';
import { URLs } from '../../scripts/utils/apiURLs';
import Loading from '../Global/Loading.vue';
import listObserverMixin from '../../mixins/listObserverMixin';

export default defineComponent({
  name: 'SceneryTimetablesHistory',
  mixins: [dateMixin, listObserverMixin],
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true,
    },
  },

  data() {
    return {
      historyList: [] as TimetableHistory[],
      dataStatus: DataStatus.Loading,
      DataStatus,
    };
  },

  async activated() {
    const fetchedHistory = await this.fetchAPIData();
    if (fetchedHistory) this.historyList = fetchedHistory.timetables;
  },

  methods: {
    async fetchAPIData(countFrom = 0, countLimit = 15): Promise<SceneryTimetableHistory | null> {
      try {
        const requestString = `${URLs.stacjownikAPI}/api/getIssuedTimetables?name=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: SceneryTimetableHistory = await (await axios.get(requestString)).data;

        this.dataStatus = DataStatus.Loaded;
        return historyAPIData;
      } catch (error) {
        console.error(error);
        return null;
      }
    },

    navigateToHistory() {
      this.$router.push(`/journal/timetables?issuedFrom=${this.station.name}`);
    },
  },
  components: { Loading },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/sceneryViewTables.scss';
</style>
