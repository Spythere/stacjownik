<template>
  <div class="scenery-dispatchers-history">
    <div class="history-wrapper">
      <Loading v-if="dataStatus != DataStatus.Loaded && historyList.length == 0" />

      <div v-else-if="historyList.length == 0" class="no-history">
        {{ $t('scenery.history-list-empty') }}
      </div>

      <div v-else class="journal-list">
        <div v-for="historyItem in historyList" class="journal-list-item" :key="historyItem.id">
          <span>
            <span class="text--grayed">#{{ historyItem.stationHash }}</span>

            <span>&nbsp;</span>

            <LevelBadge
              v-if="historyItem.dispatcherLevel !== null"
              badge-type="dispatcher"
              :level="historyItem.dispatcherLevel"
              :is-supporter="historyItem.dispatcherIsSupporter"
            />

            <span>&nbsp;</span>

            <router-link
              :to="`/journal/dispatchers?search-dispatcher=${historyItem.dispatcherName}`"
            >
              {{ historyItem.dispatcherName }}
            </router-link>

            <div>
              <span>
                {{ $t('scenery.dispatcher-rate') }}
                <b class="text--primary"> {{ historyItem.dispatcherRate }}</b>
              </span>
              |
              <span>
                {{ $t('scenery.dispatcher-status-changes') }}
                <b class="text--primary">{{ historyItem.statusHistory.length }}</b>
              </span>
            </div>
          </span>

          <span>
            <span v-if="historyItem.timestampTo">
              <b>{{ $d(historyItem.timestampFrom) }}</b>

              {{ timestampToString(historyItem.timestampFrom) }}
              - {{ timestampToString(historyItem.timestampTo) }} ({{
                calculateDuration(historyItem.currentDuration)
              }})
            </span>

            <span class="dispatcher-online" v-else>
              {{ $t('journal.online-since') }}
              <b>{{ timestampToString(historyItem.timestampFrom) }}</b>
              ({{ calculateDuration(historyItem.currentDuration) }})
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="bottom-info">
      <button class="btn btn--option" v-if="historyList.length > 0" @click="navigateToHistory">
        {{ $t('scenery.bottom-info') }}
      </button>
    </div>
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
import LevelBadge from '../Global/LevelBadge.vue';

export default defineComponent({
  name: 'SceneryDispatchersHistory',
  mixins: [dateMixin, styleMixin],
  components: { Loading, LevelBadge },
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
      lastStationName: '',
      dataStatus: Status.Data.Loading,
      DataStatus: Status.Data,
      apiStore: useApiStore()
    };
  },

  async activated() {
    this.historyList.length = 0;

    const fetchedHistory = await this.fetchAPIData();
    if (fetchedHistory) this.historyList = fetchedHistory;
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

        const historyAPIData: API.DispatcherHistory.Response =
          await this.apiStore.client.get(requestString);

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
@use '../../styles/responsive';
@use '../../styles/scenery-history-table';
@use '../../styles/badge';

.scenery-dispatchers-history {
  height: 100%;
  overflow: auto;

  display: grid;
  gap: 0.5em;
  grid-template-rows: auto 40px;
}

.history-wrapper {
  position: relative;
  overflow: auto;
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  text-align: left;
}

.journal-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.5em;
  padding: 0.5em;
  background-color: #2b2b2b;
  line-height: 1.75em;

  a {
    font-weight: bold;
  }
}

.dispatcher-online {
  color: springgreen;
}

@include responsive.smallScreen {
  .journal-list-item {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
}
</style>
