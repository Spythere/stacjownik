<template>
  <section class="daily-stats">
    <i18n-t keypath="journal.timetable-stats-total" tag="p">
      <template #count>
        <b class="text--primary">
          {{ data.stats.totalTimetables }}
          {{ $t('journal.timetable-count', data.stats.dispatcherTimetablesCount) }}
        </b>
      </template>

      <template #distance>
        <b class="text--primary"> {{ data.stats.distanceSum }} km </b>
      </template>
    </i18n-t>

    <i18n-t keypath="journal.timetable-stats-longest" tag="p">
      <template #id>
        <b>{{ data.stats.timetableId }}</b>
      </template>
      <template #author>
        <b>{{ data.stats.timetableAuthor }}</b>
      </template>
      <template #driver>
        <b>{{ data.stats.timetableDriver }}</b>
      </template>
      <template #distance>
        <b class="text--primary">{{ data.stats.timetableRouteDistance }} km</b>
      </template>
    </i18n-t>

    <i18n-t keypath="journal.timetable-stats-most-active" tag="p">
      <template #dispatcher>
        <b>{{ data.stats.dispatcherName }}</b>
      </template>
      <template #count>
        <b class="text--primary">
          {{ data.stats.dispatcherTimetablesCount }}
          {{ $t('journal.timetable-count', data.stats.dispatcherTimetablesCount) }}
        </b>
      </template>
    </i18n-t>
  </section>
</template>

<script setup lang="ts">
import axios from 'axios';
import { reactive, ref } from 'vue';
import { ITimetablesDailyStats, ITimetablesDailyStatsResponse } from '../../scripts/interfaces/api/StatsAPIData';
import { URLs } from '../../scripts/utils/apiURLs';

const intervalId = ref(-1);

const data = reactive({
  stats: {
    totalTimetables: 0,
    distanceSum: 0,
    distanceAvg: 0,
    timetableAuthor: '',
    timetableDriver: '',
    timetableId: 0,
    timetableRouteDistance: 0,
    dispatcherName: '',
    dispatcherTimetablesCount: 0,
  } as ITimetablesDailyStats,
});

async function fetchDailyTimetableStats() {
  try {
    const {
      distanceAvg,
      distanceSum,
      maxTimetable,
      totalTimetables,
      mostActiveDispatcher,
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
      dispatcherName: mostActiveDispatcher?.name || '',
      dispatcherTimetablesCount: mostActiveDispatcher?.count || 0,
    };
  } catch (error) {
    console.error('Ups! Wystąpił błąd podczas pobierania statystyk rozkładów jazdy...');
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

<style lang="scss" scoped></style>

