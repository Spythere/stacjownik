<template>
  <section class="scenery-table-section">
    <Loading v-if="dataStatus != DataStatus.Loaded && historyList.length == 0" />

    <div class="no-history" v-else-if="historyList.length == 0">
      {{ $t('scenery.history-list-empty') }}
    </div>

    <table class="scenery-history-table" v-else>
      <thead>
        <th>{{ $t('scenery.dispatchers-history-hash') }}</th>
        <th>{{ $t('scenery.dispatchers-history-dispatcher') }}</th>
        <th>{{ $t('scenery.dispatchers-history-level') }}</th>
        <th>{{ $t('scenery.dispatchers-history-rate') }}</th>
        <th>{{ $t('scenery.dispatchers-history-date') }}</th>
      </thead>

      <tbody>
        <tr v-for="historyItem in historyList" :key="historyItem.id">
          <td>#{{ historyItem.stationHash }}</td>
          <td>
            <router-link
              :to="`/journal/dispatchers?search-dispatcher=${historyItem.dispatcherName}`"
            >
              <b>{{ historyItem.dispatcherName }}</b>
            </router-link>
          </td>
          <td>
            <b
              v-if="historyItem.dispatcherLevel !== null"
              class="level-badge dispatcher"
              :style="
                calculateExpStyle(historyItem.dispatcherLevel, historyItem.dispatcherIsSupporter)
              "
            >
              {{ historyItem.dispatcherLevel >= 2 ? historyItem.dispatcherLevel : 'L' }}
            </b>

            <b v-else>?</b>
          </td>
          <td class="text--primary">
            <b>{{ historyItem.dispatcherRate }}</b>
          </td>
          <td style="min-width: 300px">
            <div v-if="historyItem.timestampTo">
              <b>{{ $d(historyItem.timestampFrom) }}</b>

              {{ timestampToString(historyItem.timestampFrom) }}
              - {{ timestampToString(historyItem.timestampTo) }} ({{
                calculateDuration(historyItem.currentDuration)
              }})
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
  </section>

  <div class="bottom-info">
    <button class="btn btn--option" v-if="historyList.length > 0" @click="navigateToHistory">
      {{ $t('scenery.bottom-info') }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import Loading from '../Global/Loading.vue';
import styleMixin from '../../mixins/styleMixin';
import { API } from '../../typings/api';
import { ActiveScenery, Station, Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  name: 'SceneryDispatchersHistory',
  mixins: [dateMixin, styleMixin],
  components: { Loading },
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
      historyList: [] as API.DispatcherHistory.Response,
      dataStatus: Status.Data.Loading,
      DataStatus: Status.Data,
      apiStore: useApiStore()
    };
  },

  async activated() {
    // if (this.historyList.length == 0) {
    const fetchedHistory = await this.fetchAPIData();
    if (fetchedHistory) this.historyList = fetchedHistory;
    // }
  },

  methods: {
    async fetchAPIData(
      countFrom = 0,
      countLimit = 30
    ): Promise<API.DispatcherHistory.Response | null> {
      if (!this.station && !this.onlineScenery) {
        this.dataStatus = Status.Data.Loaded;
        return null;
      }

      try {
        this.dataStatus = Status.Data.Loading;

        const requestString = `api/getDispatchers?stationName=${
          this.station?.name || this.onlineScenery?.name
        }&countFrom=${countFrom}&countLimit=${countLimit}`;

        const historyAPIData: API.DispatcherHistory.Response = await (
          await this.apiStore.client!.get(requestString)
        ).data;

        this.dataStatus = Status.Data.Loaded;
        return historyAPIData;
      } catch (error) {
        this.dataStatus = Status.Data.Error;
        console.error(error);
        return null;
      }
    },
    navigateToHistory() {
      this.$router.push(
        `/journal/dispatchers?search-station=${this.station?.name || this.onlineScenery?.name}`
      );
    }
  }
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
../../store/storeTypes
