<template>
  <!-- WIP -->
  <!-- <div class="top-filters">
    <button class="btn btn--option">ROZPOCZYNA BIEG</button>

    <button class="btn btn--option">PRZEZ</button>

    <button class="btn btn--option">KOŃCZY BIEG</button>
  </div> -->

  <section class="scenery-table-section">
    <Loading v-if="dataStatus != DataStatus.Loaded" />

    <div class="no-history" v-else-if="historyList.length == 0">
      {{ $t('scenery.history-list-empty') }}
    </div>

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
        <tr v-for="historyItem in historyList" :key="historyItem.id">
          <td>
            <router-link :to="`/journal/timetables?search-train=%23${historyItem.id}`">
              #{{ historyItem.id }}
            </router-link>
          </td>
          <td>
            <b class="text--primary">{{ historyItem.trainCategoryCode }}</b> <br />
            {{ historyItem.trainNo }}
          </td>
          <td>{{ historyItem.route.replace('|', ' -> ') }}</td>
          <td>
            <router-link :to="`/journal/timetables?search-driver=${historyItem.driverName}`">
              {{ historyItem.driverName }}
            </router-link>
          </td>

          <td>
            <router-link
              v-if="historyItem.authorName"
              :to="`/journal/timetables?search-dispatcher=${historyItem.authorName}`"
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
import { defineComponent, PropType } from 'vue';
import dateMixin from '../../mixins/dateMixin';

import Loading from '../Global/Loading.vue';
import listObserverMixin from '../../mixins/listObserverMixin';
import { API } from '../../typings/api';
import { ActiveScenery, Station, Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  name: 'SceneryTimetablesHistory',
  mixins: [dateMixin, listObserverMixin],
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
      historyList: [] as API.TimetableHistory.Response,
      apiStore: useApiStore(),
      dataStatus: Status.Data.Loading,
      DataStatus: Status.Data
    };
  },

  async activated() {
    this.fetchAPIData();
  },

  methods: {
    async fetchAPIData() {
      if (!this.station && !this.onlineScenery) {
        this.dataStatus = Status.Data.Loaded;
        return;
      }

      try {
        const response: API.TimetableHistory.Response = await (
          await this.apiStore.client!.get('api/getTimetables', {
            params: {
              issuedFrom: this.station?.name || this.onlineScenery?.name
            }
          })
        ).data;

        this.historyList = response;

        this.dataStatus = Status.Data.Loaded;
      } catch (error) {
        console.error(error);
      }
    },

    navigateToHistory() {
      this.$router.push({
        path: '/journal/timetables',
        query: {
          'search-issuedFrom': this.station?.name || this.onlineScenery?.name
        }
      });
    }
  },
  components: { Loading }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/sceneryViewTables.scss';

.top-filters {
  display: flex;
  justify-content: center;
  gap: 0.5em;

  button {
    padding: 0.5em;
  }
}
</style>
