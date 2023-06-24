<template>
  <section class="scenery-dispatchers-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <table class="scenery-history-table" v-else-if="historyList.length">
      <thead>
        <!-- <th>{{ $t('scenery.timetables-history-id') }}</th>
        <th>{{ $t('scenery.timetables-history-number') }}</th>
        <th>{{ $t('scenery.timetables-history-route') }}</th>
        <th>{{ $t('scenery.timetables-history-driver') }}</th>
        <th>{{ $t('scenery.timetables-history-author') }}</th>
        <th>{{ $t('scenery.timetables-history-date') }}</th> -->

        <th>Hash</th>
        <th>Dyżurny</th>
        <th>Poziom</th>
        <th>Ocena</th>
        <th>Data</th>
      </thead>

      <tbody>
        <tr v-for="historyItem in historyList">
          <td>#{{ historyItem.stationHash }}</td>
          <td>
            <router-link :to="`/journal/dispatchers?dispatcherName=${historyItem.dispatcherName}`">
              <b>{{ historyItem.dispatcherName }}</b>
            </router-link>
          </td>
          <td>
            <b
              v-if="historyItem.dispatcherLevel !== null"
              class="level-badge dispatcher"
              :style="calculateExpStyle(historyItem.dispatcherLevel, historyItem.dispatcherIsSupporter)"
            >
              {{ historyItem.dispatcherLevel >= 2 ? historyItem.dispatcherLevel : 'L' }}
            </b>
          </td>
          <td class="text--primary">
            <b>{{ historyItem.dispatcherRate }}</b>
          </td>
          <td style="min-width: 300px">
            <div v-if="historyItem.timestampTo">
              <b>{{ $d(historyItem.timestampFrom) }}</b>

              {{ timestampToString(historyItem.timestampFrom) }}
              - {{ timestampToString(historyItem.timestampTo) }} ({{ calculateDuration(historyItem.currentDuration) }})
            </div>

            <div class="dispatcher-online" v-else>
              {{ $t('journal.online-since') }}
              <b>{{ timestampToString(historyItem.timestampFrom) }}</b>
              ({{ calculateDuration(historyItem.currentDuration) }})
            </div>
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
import { DispatcherHistory } from '../../scripts/interfaces/api/DispatchersAPIData';
import Station from '../../scripts/interfaces/Station';
import { URLs } from '../../scripts/utils/apiURLs';
import Loading from '../Global/Loading.vue';
import styleMixin from '../../mixins/styleMixin';
import listObserverMixin from '../../mixins/listObserverMixin';

export default defineComponent({
  name: 'SceneryDispatchersHistory',
  mixins: [dateMixin, styleMixin, listObserverMixin],
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true,
    },
  },

  data() {
    return {
      historyList: [] as DispatcherHistory[],
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
    async fetchAPIData(countFrom = 0, countLimit = 30) {
      try {
        const requestString = `${URLs.stacjownikAPI}/api/getDispatchers?stationName=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: DispatcherHistory[] = await (await axios.get(requestString)).data;

        this.historyList.push(...historyAPIData);
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

.level-badge {
  margin: 0 auto;
}

.dispatcher-online {
  color: springgreen;
}

@include smallScreen {
  .history-list {
    font-size: 1.1em;
  }
  .list-item {
    align-items: center;
    flex-direction: column;
  }
}
</style>
