<template>
  <section class="daily-stats">
    <span :data-active="statsStatus">
      <b v-if="statsStatus == DataStatus.Loading">
        {{ $t('app.loading') }}
      </b>

      <b v-else-if="stats.distanceSum == null">
        {{ $t('journal.daily-stats-info') }}
      </b>

      <span class="stats-list" v-else>
        <h3>
          {{ $t('journal.daily-stats-title') }}
          <b class="text--primary">{{ new Date().toLocaleDateString($i18n.locale) }}</b>
        </h3>
        <hr style="margin-bottom: 0.5em" />

        <div v-if="stats.totalTimetables">
          &bull;
          <i18n-t keypath="journal.timetable-stats-total">
            <template #count>
              <b class="text--primary">
                {{ stats.totalTimetables }}
                {{ $t('journal.timetable-count', stats.totalTimetables) }}
              </b>
            </template>

            <template #distance>
              <b class="text--primary"> {{ stats.distanceSum?.toFixed(2) }} km</b>
            </template>
          </i18n-t>
        </div>

        <div v-if="stats.timetableId">
          &bull;
          <i18n-t keypath="journal.timetable-stats-longest">
            <template #id>
              <router-link :to="`/journal/timetables?timetableId=${stats.timetableId}`">
                <b>{{ stats.timetableId }}</b>
              </router-link>
            </template>
            <template #author>
              <router-link :to="`/journal/dispatchers?dispatcherName=${stats.timetableAuthor}`">
                <b>{{ stats.timetableAuthor }}</b>
              </router-link>
            </template>
            <template #driver>
              <b class="text--primary">{{ stats.timetableDriver }}</b>
            </template>
            <template #distance>
              <b class="text--primary">{{ stats.timetableRouteDistance }} km</b>
            </template>
          </i18n-t>
        </div>

        <div v-if="topDispatchers.length == 1">
          &bull;
          <i18n-t keypath="journal.timetable-stats-most-active-dr">
            <template #dispatcher>
              <router-link :to="`/journal/dispatchers?dispatcherName=${topDispatchers[0].name}`">
                <b>{{ topDispatchers[0].name }}</b>
              </router-link>
            </template>
            <template #count>
              <b class="text--primary">
                {{ topDispatchers[0].count }}
                {{ $t('journal.timetable-count', topDispatchers[0].count) }}
              </b>
            </template>
          </i18n-t>
        </div>

        <div v-if="topDispatchers.length > 1">
          &bull;
          <i18n-t keypath="journal.timetable-stats-most-active-dr-many">
            <template #dispatchers>
              <span v-for="(disp, i) in topDispatchers" :key="i">
                <span v-if="i == topDispatchers.length - 1"> {{ $t('general.and') }} </span>

                <router-link :to="`/journal/dispatchers?dispatcherName=${disp.name}`">
                  <b>{{ disp.name }}</b>
                </router-link>

                <span v-if="i < topDispatchers.length - 2">, </span>
              </span>
            </template>

            <template #count>
              <b class="text--primary">
                {{ topDispatchers[0].count }}
                {{ $t('journal.timetable-count', topDispatchers[0].count) }}
              </b>
            </template>
          </i18n-t>
        </div>

        <div v-if="stats.longestDuties.length > 0">
          &bull;
          <i18n-t keypath="journal.timetable-stats-longest-duties">
            <template #dispatcher>
              <router-link
                :to="`/journal/dispatchers?dispatcherName=${stats.longestDuties[0].name}`"
              >
                <b>{{ stats.longestDuties[0].name }}</b>
              </router-link>
            </template>

            <template #station>{{ stats.longestDuties[0].station }}</template>

            <template #duration>
              {{ calculateDuration(stats.longestDuties[0].duration) }}
            </template>
          </i18n-t>
        </div>

        <div v-if="stats.mostActiveDrivers.length > 0">
          &bull;
          <i18n-t keypath="journal.timetable-stats-most-active-driver">
            <template #driver>
              <b class="text--primary">{{ stats.mostActiveDrivers[0].name }}</b>
            </template>
            <template #distance>
              <b class="text--primary">{{ stats.mostActiveDrivers[0].distance.toFixed(2) }} km</b>
            </template>
          </i18n-t>
        </div>
      </span>
    </span>
  </section>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import {
  ITimetablesDailyStats,
  ITimetablesDailyStatsResponse
} from '../../scripts/interfaces/api/StatsAPIData';
import { URLs } from '../../scripts/utils/apiURLs';

export default defineComponent({
  mixins: [dateMixin],
  emits: ['toggleStatsOpen'],

  data() {
    return {
      DataStatus,
      statsStatus: DataStatus.Loading,
      intervalId: -1,

      stats: {
        totalTimetables: 0,
        distanceSum: 0,
        distanceAvg: 0,
        timetableAuthor: '',
        timetableDriver: '',
        timetableId: 0,
        timetableRouteDistance: 0,
        longestDuties: [],
        mostActiveDrivers: [],
        mostActiveDispatchers: []
      } as ITimetablesDailyStats
    };
  },

  activated() {
    this.startFetchingDailyStats();
    this.$emit('toggleStatsOpen', true);
  },

  deactivated() {
    this.stopFetchingDailyStats();
  },

  computed: {
    topDispatchers() {
      if (this.stats.mostActiveDispatchers.length == 0) return [];
      const maxCount = this.stats.mostActiveDispatchers[0].count;

      return this.stats.mostActiveDispatchers.filter((disp) => disp.count === maxCount);
    }
  },

  methods: {
    async fetchDailyTimetableStats() {
      try {
        const res: ITimetablesDailyStatsResponse = await (
          await axios.get(`${URLs.stacjownikAPI}/api/getDailyTimetableStats`)
        ).data;

        this.stats = {
          totalTimetables: res.totalTimetables,
          distanceSum: res.distanceSum,
          distanceAvg: res.distanceAvg,
          timetableAuthor: res.maxTimetable?.authorName || '',
          timetableDriver: res.maxTimetable?.driverName || '',
          timetableId: res.maxTimetable?.id || 0,
          timetableRouteDistance: res.maxTimetable?.routeDistance || 0,

          mostActiveDispatchers: res.mostActiveDispatchers,
          mostActiveDrivers: res.mostActiveDrivers,
          longestDuties: res.longestDuties
        };

        this.statsStatus = DataStatus.Loaded;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
        this.statsStatus = DataStatus.Error;
      }
    },

    startFetchingDailyStats() {
      this.fetchDailyTimetableStats();

      if (this.intervalId != -1) return;

      this.intervalId = setInterval(this.fetchDailyTimetableStats, 60000);
    },

    stopFetchingDailyStats() {
      clearInterval(this.intervalId);
      this.intervalId = -1;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.daily-stats {
  text-align: left;
}
.daily-stats > span[data-active='0'] {
  opacity: 0.75;
}

.stats-list a {
  text-decoration: underline;
}

@include smallScreen {
  h3 {
    text-align: center;
  }
}
</style>
