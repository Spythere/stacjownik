<template>
  <section class="daily-stats">
    <span :data-active="data.statsStatus">
      <b v-if="data.statsStatus == DataStatus.Loading">
        Ładowanie...
      </b>

      <b v-else-if="data.stats.distanceSum == null">
        {{ $t('journal.daily-stats-info') }}
      </b>

      <span>
        <div v-if="data.stats.totalTimetables">
          &bull;
          <i18n-t keypath="journal.timetable-stats-total">
            <template #count>
              <b class="text--primary">
                {{ data.stats.totalTimetables }}
                {{ $t('journal.timetable-count', data.stats.totalTimetables) }}
              </b>
            </template>

            <template #distance>
              <b class="text--primary"> {{ data.stats.distanceSum }} km </b>
            </template>
          </i18n-t>
        </div>

        <div v-if="data.stats.timetableId">
          &bull;
          <i18n-t keypath="journal.timetable-stats-longest">
            <template #id>
              <router-link :to="`/journal/timetables?timetableId=${data.stats.timetableId}`">
                <b>{{ data.stats.timetableId }}</b>
              </router-link>
            </template>
            <template #author>
              <router-link :to="`/journal/dispatchers?dispatcherName=${data.stats.timetableAuthor}`">
                <b>{{ data.stats.timetableAuthor }}</b>
              </router-link>
            </template>
            <template #driver>
              <b>{{ data.stats.timetableDriver }}</b>
            </template>
            <template #distance>
              <b class="text--primary">{{ data.stats.timetableRouteDistance }} km</b>
            </template>
          </i18n-t>
        </div>

        <div v-if="firstPlaceDispatchers.length == 1">
          &bull;
          <i18n-t keypath="journal.timetable-stats-most-active">
            <template #dispatcher>
              <router-link :to="`/journal/dispatchers?dispatcherName=${firstPlaceDispatchers[0].name}`">
                <b>{{ firstPlaceDispatchers[0].name }}</b>
              </router-link>
            </template>
            <template #count>
              <b class="text--primary">
                {{ firstPlaceDispatchers[0].count }}
                {{ $t('journal.timetable-count', firstPlaceDispatchers[0].count) }}
              </b>
            </template>
          </i18n-t>
        </div>

        <div v-if="firstPlaceDispatchers.length > 1">
          &bull;
          <i18n-t keypath="journal.timetable-stats-most-active-many">
            <template #dispatchers>
              <span v-for="(disp, i) in firstPlaceDispatchers">
                <span v-if="i == firstPlaceDispatchers.length - 1"> {{ $t('general.and') }} </span>

                <router-link :to="`/journal/dispatchers?dispatcherName=${disp.name}`">
                  <b>{{ disp.name }}</b>
                </router-link>

                <span v-if="i < firstPlaceDispatchers.length - 2">, </span>
              </span>
            </template>

            <template #count>
              <b class="text--primary">
                {{ firstPlaceDispatchers[0].count }}
                {{ $t('journal.timetable-count', firstPlaceDispatchers[0].count) }}
              </b>
            </template>
          </i18n-t>
        </div>
      </span>
    </span>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, reactive, ref } from 'vue';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { ITimetablesDailyStats, ITimetablesDailyStatsResponse } from '../../scripts/interfaces/api/StatsAPIData';
import { URLs } from '../../scripts/utils/apiURLs';

const intervalId = ref(-1);

const data = reactive({
  statsStatus: DataStatus.Loading,

  stats: {
    totalTimetables: 0,
    distanceSum: 0,
    distanceAvg: 0,
    timetableAuthor: '',
    timetableDriver: '',
    timetableId: 0,
    timetableRouteDistance: 0,

    mostActiveDispatchers: [],
  } as ITimetablesDailyStats,
});

const firstPlaceDispatchers = computed(() => {
  if (data.stats.mostActiveDispatchers.length == 0) return [];
  const maxCount = data.stats.mostActiveDispatchers[0].count;

  return data.stats.mostActiveDispatchers.filter((disp) => disp.count === maxCount);
});

async function fetchDailyTimetableStats() {
  try {
    const {
      distanceAvg,
      distanceSum,
      maxTimetable,
      totalTimetables,
      mostActiveDispatchers,
    }: ITimetablesDailyStatsResponse = await (
      await axios.get(`${URLs.stacjownikAPI}/api/getDailyTimetableStats`)
    ).data;

    data.stats = {
      totalTimetables,
      distanceSum,
      distanceAvg,
      timetableAuthor: maxTimetable?.authorName || '',
      timetableDriver: maxTimetable?.driverName || '',
      timetableId: maxTimetable?.timetableId || 0,
      timetableRouteDistance: maxTimetable?.routeDistance || 0,

      mostActiveDispatchers,
    };

    data.statsStatus = DataStatus.Loaded;
  } catch (error) {
    console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
    data.statsStatus = DataStatus.Error;
  }
}

function startFetchingDailyStats() {
  fetchDailyTimetableStats();
  intervalId.value = setInterval(fetchDailyTimetableStats, 60000);
}

function stopFetchingDailyStats() {
  clearInterval(intervalId.value);
}

defineExpose({
  startFetchingDailyStats,
  stopFetchingDailyStats,
});
</script>

<style lang="scss" scoped>
.daily-stats {
  text-align: left;
}
.daily-stats > span[data-active='0'] {
  opacity: 0.75;
}
</style>

