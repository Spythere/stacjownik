<template>
  <section class="scenery-timetables-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <table class="scenery-history-table" v-else-if="sceneryHistoryList.length">
      <thead>
        <th>{{ $t('scenery.timetables-history-id') }}</th>
        <th>{{ $t('scenery.timetables-history-number') }}</th>
        <th>{{ $t('scenery.timetables-history-route') }}</th>
        <th>{{ $t('scenery.timetables-history-driver') }}</th>
        <th>{{ $t('scenery.timetables-history-author') }}</th>
        <th>{{ $t('scenery.timetables-history-date') }}</th>
      </thead>

      <tbody>
        <tr v-for="historyItem in sceneryHistoryList">
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
              :to="`/journal/dispatchers?dispatcherName=${historyItem.authorName}`"
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

    <div class="no-history" v-else>{{ $t('scenery.history-list-empty') }}</div>
  </section>
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

export default defineComponent({
  name: 'SceneryTimetablesHistory',
  mixins: [dateMixin],
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true,
    },
  },
  data() {
    return {
      sceneryHistoryList: [] as TimetableHistory[],
      dataStatus: DataStatus.Loading,
    };
  },
  activated() {
    this.fetchAPIData();
  },
  methods: {
    async fetchAPIData(countFrom = 0, countLimit = 15) {
      try {
        const requestString = `${URLs.stacjownikAPI}/api/getIssuedTimetables?name=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: SceneryTimetableHistory = await (await axios.get(requestString)).data;

        this.sceneryHistoryList = historyAPIData.timetables;
        this.dataStatus = DataStatus.Loaded;
      } catch (error) {
        console.error(error);
      }
    },
  },
  components: { Loading },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/sceneryViewTables.scss';
</style>
