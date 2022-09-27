<template>
  <section class="scenery-timetables-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <div class="list-warning" v-else-if="sceneryHistoryList.length == 0">{{ $t('scenery.history-list-empty') }}</div>
    <ul class="history-list" v-else>
      <li class="list-item" v-for="historyItem in sceneryHistoryList">
        <div>
          <b>{{ localeDay(historyItem.beginDate, $i18n.locale) }}</b>
          {{ localeTime(historyItem.beginDate, $i18n.locale) }}
        </div>

        <div>
          <router-link :to="`/journal/timetables?timetableId=${historyItem.timetableId}`">
            <span class="text--grayed"> #{{ historyItem.timetableId }} </span>
            <b class="text--primary">&nbsp;{{ historyItem.trainCategoryCode }} {{ historyItem.trainNo }}</b>
            <div>{{ historyItem.driverName }}</div>
          </router-link>
        </div>

        <div>{{ historyItem.route.replace('|', ' -> ') }}</div>
        <!-- <div>{{ historyItem.routeDistance }} km</div> -->
        <div>
          {{ $t('scenery.timetable-author-title') }}:
          <b v-if="historyItem.authorName">{{ historyItem.authorName }}</b>
          <i v-else>{{ $t('scenery.timetable-author-unknown') }}</i>
        </div>

        <!-- <div v-if="historyItem.authorId">{{ historyItem.authorName }}</div> -->
      </li>
    </ul>
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
  mounted() {
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

.list-item {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 1fr;
  gap: 1em;
  align-items: center;

  background-color: #353535;
  padding: 0.5em;
  margin: 0.5em 0;

  line-height: 1.5em;
}

@include smallScreen {
  .list-item {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
