<template>
  <section class="scenery-timetables-history">
    <Loading v-if="dataStatus != 2" />
    <ul class="history-list" v-else>
      <li class="list-item" v-for="historyItem in sceneryHistoryList">
        <div>
          <span class="text--grayed"> #{{ historyItem.timetableId }} </span>
          <b class="text--primary">&nbsp;{{ historyItem.trainCategoryCode }} {{ historyItem.trainNo }}</b>
          {{ historyItem.driverName }}

          <div>Odjazd: {{ localeDate(historyItem.beginDate, $i18n.locale) }}</div>
        </div>

        <div style="text-align: right">
          {{ historyItem.route.replace('|', ' -> ') }} | {{ historyItem.routeDistance }} km
          <div v-if="historyItem.authorName">
            Autor:
            <b>{{ historyItem.authorName }}</b>
          </div>
        </div>
        <!-- <div v-if="historyItem.authorId">{{ historyItem.authorName }}</div> -->
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import dateMixin from '@/mixins/dateMixin';
import { DataStatus } from '@/scripts/enums/DataStatus';
import { SceneryTimetableHistory, TimetableHistory } from '@/scripts/interfaces/api/TimetablesAPIData';
import Station from '@/scripts/interfaces/Station';
import { URLs } from '@/scripts/utils/apiURLs';
import axios from 'axios';
import { defineComponent, PropType } from 'vue';
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
.scenery-timetables-history {
  position: relative;
  height: 100%;
  overflow-y: scroll;
}

.history-list {
  padding: 0 0.5em;
}

.list-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  text-align: left;
  background-color: #353535;
  padding: 0.5em;
  margin: 0.5em 0;

  line-height: 1.5em;
}
</style>
