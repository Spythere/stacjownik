<template>
  <section class="daily-stats">
    <span :data-active="statsStatus">
      <b v-if="statsStatus == Status.Data.Loading">
        {{ $t('app.loading') }}
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

        <div v-if="stats.maxTimetable">
          &bull;
          <i18n-t keypath="journal.timetable-stats-longest">
            <template #id>
              <router-link :to="`/journal/timetables?timetableId=${stats.maxTimetable.id}`">
                <b>{{ stats.maxTimetable.id }}</b>
              </router-link>
            </template>
            <template #author>
              <router-link
                :to="`/journal/dispatchers?dispatcherName=${stats.maxTimetable.authorName}`"
              >
                <b>{{ stats.maxTimetable.authorName }}</b>
              </router-link>
            </template>
            <template #driver>
              <b class="text--primary">{{ stats.maxTimetable.driverName }}</b>
            </template>
            <template #distance>
              <b class="text--primary">{{ stats.maxTimetable.routeDistance }} km</b>
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
import { defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';

import { API } from '../../typings/api';
import { Status } from '../../typings/common';
import http from '../../http';

export default defineComponent({
  name: 'journal-daily-stats',

  mixins: [dateMixin],
  // emits: ['toggleStatsOpen'],

  data() {
    return {
      Status,
      statsStatus: Status.Data.Loading,
      intervalId: -1,

      stats: {} as API.DailyStats.Response
    };
  },

  activated() {
    this.startFetchingDailyStats();
    // this.$emit('toggleStatsOpen', true);
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
        const res: API.DailyStats.Response = await (await http.get('api/getDailyStats')).data;

        this.stats = res;

        this.statsStatus = Status.Data.Loaded;
      } catch (error) {
        console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
        this.statsStatus = Status.Data.Error;
      }
    },

    startFetchingDailyStats() {
      this.fetchDailyTimetableStats();

      if (this.intervalId != -1) return;

      this.intervalId = window.setInterval(this.fetchDailyTimetableStats, 60000);
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
