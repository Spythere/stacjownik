<template>
  <section class="scenery-dispatchers-history scenery-section">
    <Loading v-if="dataStatus != 2" />

    <div class="list-warning" v-else-if="dispatcherHistoryList.length == 0">{{ $t('scenery.history-list-empty') }}</div>

    <ul class="history-list" v-else>
      <li class="list-item" v-for="historyItem in dispatcherHistoryList">
        <div>
          <router-link :to="`/journal/dispatchers?dispatcherName=${historyItem.dispatcherName}`">
            <span class="text--grayed">#{{ historyItem.stationHash }}&nbsp;</span>
            <b>{{ historyItem.dispatcherName }}</b>
          </router-link>
        </div>

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
      </li>
    </ul>
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

export default defineComponent({
  name: 'SceneryDispatchersHistory',
  mixins: [dateMixin],
  props: {
    station: {
      type: Object as PropType<Station>,
      required: true,
    },
  },
  data() {
    return {
      dispatcherHistoryList: [] as DispatcherHistory[],
      dataStatus: DataStatus.Loading,
    };
  },
  mounted() {
    this.fetchAPIData();
  },
  methods: {
    async fetchAPIData(countFrom = 0, countLimit = 30) {
      try {
        const requestString = `${URLs.stacjownikAPI}/api/getDispatchers?stationName=${this.station.name}&countFrom=${countFrom}&countLimit=${countLimit}`;
        const historyAPIData: DispatcherHistory[] = await (await axios.get(requestString)).data;

        this.dispatcherHistoryList = historyAPIData;
        this.dataStatus = DataStatus.Loaded;

        console.log(this.dispatcherHistoryList);
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

.dispatcher-online {
  color: springgreen;
}

@include smallScreen {
  .history-list {
    font-size: 1.2em;
  }
  .list-item {
    align-items: center;
    flex-direction: column;
  }
}
</style>

