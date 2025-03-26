<template>
  <section class="daily-stats">
    <span :data-active="statsStatus">
      <h3>
        {{ $t('journal.daily-stats.title') }}
        <b class="text--primary">{{ new Date().toLocaleDateString($i18n.locale) }}</b>
      </h3>

      <hr class="header-separator" />

      <b v-if="statsStatus == Status.Data.Loading">
        {{ $t('app.loading') }}
      </b>

      <b class="text--error" v-else-if="statsStatus == Status.Data.Error">
        {{ $t('journal.stats-error') }}
      </b>

      <b v-else-if="topDispatchers.length == 0">
        {{ $t('journal.daily-stats.info') }}
      </b>

      <div v-else>
        <ul class="stats-list">
          <li v-if="stats.totalTimetables">
            <i18n-t keypath="journal.daily-stats.total">
              <template #count>
                <b class="text--primary">
                  {{ stats.totalTimetables }}
                  {{ $t('journal.daily-stats.count', stats.totalTimetables) }}
                </b>
              </template>

              <template #distance>
                <b class="text--primary"> {{ stats.distanceSum?.toFixed(2) }} km</b>
              </template>
            </i18n-t>
          </li>

          <li v-if="stats.maxTimetable">
            <i18n-t keypath="journal.daily-stats.longest">
              <template #id>
                <router-link :to="`/journal/timetables?search-train=%23${stats.maxTimetable.id}`">
                  <b>{{ stats.maxTimetable.id }}</b>
                </router-link>
              </template>
              <template #author>
                <router-link
                  :to="`/journal/timetables?search-dispatcher=${stats.maxTimetable.authorName}`"
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
          </li>

          <li v-if="topDispatchers.length == 1">
            <i18n-t keypath="journal.daily-stats.most-active-dr">
              <template #dispatcher>
                <router-link
                  :to="`/journal/dispatchers?search-dispatcher=${topDispatchers[0].name}`"
                >
                  <b>{{ topDispatchers[0].name }}</b>
                </router-link>
              </template>
              <template #count>
                <b class="text--primary">
                  {{ topDispatchers[0].count }}
                  {{ $t('journal.daily-stats.count', topDispatchers[0].count) }}
                </b>
              </template>
            </i18n-t>
          </li>

          <li v-if="topDispatchers.length > 1">
            <i18n-t keypath="journal.daily-stats.most-active-dr-many">
              <template #dispatchers>
                <span v-for="(disp, i) in topDispatchers" :key="i">
                  <span v-if="i == topDispatchers.length - 1"> {{ $t('general.and') }} </span>

                  <router-link :to="`/journal/dispatchers?search-dispatcher=${disp.name}`">
                    <b>{{ disp.name }}</b>
                  </router-link>

                  <span v-if="i < topDispatchers.length - 2">, </span>
                </span>
              </template>

              <template #count>
                <b class="text--primary">
                  {{ topDispatchers[0].count }}
                  {{ $t('journal.daily-stats.count', topDispatchers[0].count) }}
                </b>
              </template>
            </i18n-t>
          </li>

          <li v-if="stats.longestDuties.length > 0">
            <i18n-t keypath="journal.daily-stats.longest-duties">
              <template #dispatcher>
                <router-link
                  :to="`/journal/dispatchers?search-dispatcher=${stats.longestDuties[0].name}`"
                >
                  <b>{{ stats.longestDuties[0].name }}</b>
                </router-link>
              </template>

              <template #station>{{ stats.longestDuties[0].station }}</template>

              <template #duration>
                {{ calculateDuration(stats.longestDuties[0].duration) }}
              </template>
            </i18n-t>
          </li>

          <li v-if="stats.mostActiveDrivers.length > 0">
            <i18n-t keypath="journal.daily-stats.most-active-driver">
              <template #driver>
                <router-link
                  :to="`/journal/timetables?search-driver=${stats.mostActiveDrivers[0].name}`"
                >
                  <b>{{ stats.mostActiveDrivers[0].name }}</b>
                </router-link>
              </template>
              <template #distance>
                <b class="text--primary">{{ stats.mostActiveDrivers[0].distance.toFixed(2) }} km</b>
              </template>
            </i18n-t>
          </li>
        </ul>

        <hr class="section-separator" />

        <div class="stats-badges">
          <span
            class="badge stat-badge"
            v-for="key in [
              'rippedSwitches',
              'derailments',
              'skippedStopSignals',
              'radioStops',
              'kills'
            ]"
            :key="key"
          >
            <span>{{ $t(`journal.daily-stats.${key}`) }}</span>
            <span>
              {{ Object.entries(stats.globalDiff).find(([k, v]) => k == key)?.[1] || '--' }}
            </span>
          </span>
        </div>
      </div>
    </span>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';

import { API } from '../../typings/api';
import { Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  name: 'journal-daily-stats',

  mixins: [dateMixin],

  data() {
    return {
      Status,
      statsStatus: Status.Data.Loading,
      intervalId: -1,

      stats: {} as API.DailyStats.Response,
      apiStore: useApiStore()
    };
  },

  activated() {
    this.startFetchingDailyStats();
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
        const res: API.DailyStats.Response = await (
          await this.apiStore.client!.get('api/getDailyStats')
        ).data;

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
@use '../../styles/animations';
@use '../../styles/journal-stats';
@use '../../styles/responsive';

.daily-stats {
  text-align: left;
}

.daily-stats > span[data-active='0'] {
  opacity: 0.75;
}

ul.stats-list {
  list-style: disc;
  padding: 0 1em;
}

.stats-list a {
  text-decoration: underline;
}

.stats-list > li {
  margin: 0.25em 0;
}

.stats-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

@include responsive.smallScreen{
  h3 {
    text-align: center;
  }
}
</style>
