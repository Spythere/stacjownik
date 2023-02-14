<template>
  <section class="scenery-timetables-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <table v-else-if="sceneryHistoryList.length">
      <thead>
        <th>{{ $t('scenery.timetables-history-id')  }}</th>
        <th>{{ $t('scenery.timetables-history-number')}}</th>
        <th>{{ $t('scenery.timetables-history-route')}}</th>
        <th>{{ $t('scenery.timetables-history-driver')}}</th>
        <th>{{ $t('scenery.timetables-history-author')}}</th>
        <th>{{ $t('scenery.timetables-history-date')}}</th>
      </thead>

      <tbody>
        <tr v-for="historyItem in sceneryHistoryList" @click="test">
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

    <div class="list-warning" v-else>{{ $t('scenery.history-list-empty') }}</div>

    <!-- <ul class="history-list" v-else>
      <li class="list-item" v-for="historyItem in sceneryHistoryList">
        <div>
          <b>{{ localeDay(historyItem.beginDate, $i18n.locale) }}</b>
          {{ localeTime(historyItem.beginDate, $i18n.locale) }}
        </div>

        <div>
          <router-link :to="`/journal/timetables?timetableId=${historyItem.id}`">
            <span class="text--grayed"> #{{ historyItem.id }} </span>
            <b class="text--primary">&nbsp;{{ historyItem.trainCategoryCode }} {{ historyItem.trainNo }}</b>
            <div>{{ historyItem.driverName }}</div>
          </router-link>
        </div>

        <div>{{ historyItem.route.replace('|', ' -> ') }}</div>
        <div>
          {{ $t('scenery.timetable-author-title') }}:
          <b v-if="historyItem.authorName">{{ historyItem.authorName }}</b>
          <i v-else>{{ $t('scenery.timetable-author-unknown') }}</i>
        </div>

      </li>
    </ul> -->
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
        const requestString = `${URLs.stacjownikAPI}/api/getSceneryTimetables?name=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: SceneryTimetableHistory = await (await axios.get(requestString)).data;

        this.sceneryHistoryList = historyAPIData.sceneryTimetables;
        this.dataStatus = DataStatus.Loaded;
      } catch (error) {
        console.error(error);
      }
    },

    test() {
      console.log('test');
    },
  },
  components: { Loading },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/SceneryView/styles.scss';

.list-warning {
  padding: 1em 0.5em;
  background-color: #444;
  font-size: 1.2em;
}

.history-list {
  padding: 0 0.5em;
}

table {
  width: 100%;
  border-collapse: collapse;

  thead {
    position: sticky;
    top: 0;
    background-color: #222222;
  }

  th {
    padding: 0.5em;
  }

  tr {
    background-color: #353535;
    border: none;
  }

  td {
    padding: 0.75em;
    border-bottom: solid 5px #111;
  }
}

@include smallScreen {
  .list-item {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
