<template>
  <section class="scenery-timetables-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <table class="scenery-history-table" v-else-if="historyList.length">
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
    <div ref="bottomDiv"></div>
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
    };
  },

  mounted() {
    this.mountObserver(this.fireObserverAction, this.$refs['bottomDiv'] as Element);
  },

  unmounted() {
    this.unmountObserver();
  },

  activated() {
    if (this.historyList.length == 0) this.fetchAPIData();
  },

  methods: {
    async fetchAPIData(countFrom = 0, countLimit = 15) {
      try {
        const requestString = `${URLs.stacjownikAPI}/api/getIssuedTimetables?name=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: SceneryTimetableHistory = await (await axios.get(requestString)).data;

        this.historyList.push(...historyAPIData.timetables);
        this.dataStatus = DataStatus.Loaded;
      } catch (error) {
        console.error(error);
      }
    },

    fireObserverAction() {
      if (this.historyList.length > 0 && this.dataStatus == DataStatus.Loaded)
        this.fetchAPIData(this.historyList.length);
    },
  },
  components: { Loading },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/sceneryViewTables.scss';
</style>
