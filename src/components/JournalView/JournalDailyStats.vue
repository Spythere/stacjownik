<template>
  <section class="daily-stats">
    <span :data-active="apiStore.dataStatuses.dailyStatsData">
      <h3>
        {{ $t('journal.daily-stats.title') }}
        <b class="text--primary">{{ new Date().toLocaleDateString($i18n.locale) }}</b>
      </h3>

      <hr class="header-separator" />

      <b v-if="apiStore.dataStatuses.dailyStatsData == Status.Data.Loading">
        {{ $t('app.loading') }}
      </b>

      <b class="text--error" v-else-if="apiStore.dataStatuses.dailyStatsData == Status.Data.Error">
        {{ $t('journal.stats-error') }}
      </b>

      <b v-else-if="topDispatchers.length == 0">
        {{ $t('journal.daily-stats.info') }}
      </b>

      <div v-else-if="apiStore.dailyStatsData">
        <ul class="stats-list">
          <li v-if="apiStore.dailyStatsData.totalTimetables">
            <i18n-t keypath="journal.daily-stats.total">
              <template #count>
                <b class="text--primary">
                  {{ apiStore.dailyStatsData.totalTimetables }}
                  {{ $t('journal.daily-stats.count', apiStore.dailyStatsData.totalTimetables) }}
                </b>
              </template>

              <template #distance>
                <b class="text--primary">
                  {{ apiStore.dailyStatsData.distanceSum?.toFixed(2) }} km</b
                >
              </template>
            </i18n-t>
          </li>

          <li v-if="apiStore.dailyStatsData.maxTimetable">
            <i18n-t keypath="journal.daily-stats.longest">
              <template #id>
                <router-link
                  :to="`/journal/timetables?search-train=%23${apiStore.dailyStatsData.maxTimetable.id}`"
                >
                  <b>{{ apiStore.dailyStatsData.maxTimetable.id }}</b>
                </router-link>
              </template>
              <template #author>
                <router-link
                  :to="`/journal/timetables?search-dispatcher=${apiStore.dailyStatsData.maxTimetable.authorName}`"
                >
                  <b>{{ apiStore.dailyStatsData.maxTimetable.authorName }}</b>
                </router-link>
              </template>
              <template #driver>
                <b class="text--primary">{{ apiStore.dailyStatsData.maxTimetable.driverName }}</b>
              </template>
              <template #distance>
                <b class="text--primary"
                  >{{ apiStore.dailyStatsData.maxTimetable.routeDistance }} km</b
                >
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

          <li v-if="apiStore.dailyStatsData.longestDuties.length > 0">
            <i18n-t keypath="journal.daily-stats.longest-duties">
              <template #dispatcher>
                <router-link
                  :to="`/journal/dispatchers?search-dispatcher=${apiStore.dailyStatsData.longestDuties[0].name}`"
                >
                  <b>{{ apiStore.dailyStatsData.longestDuties[0].name }}</b>
                </router-link>
              </template>

              <template #station>{{ apiStore.dailyStatsData.longestDuties[0].station }}</template>

              <template #duration>
                {{ humanizeDuration(apiStore.dailyStatsData.longestDuties[0].duration) }}
              </template>
            </i18n-t>
          </li>

          <li v-if="apiStore.dailyStatsData.mostActiveDrivers.length > 0">
            <i18n-t keypath="journal.daily-stats.most-active-driver">
              <template #driver>
                <router-link
                  :to="`/journal/timetables?search-driver=${apiStore.dailyStatsData.mostActiveDrivers[0].name}`"
                >
                  <b>{{ apiStore.dailyStatsData.mostActiveDrivers[0].name }}</b>
                </router-link>
              </template>
              <template #distance>
                <b class="text--primary"
                  >{{ apiStore.dailyStatsData.mostActiveDrivers[0].distance.toFixed(2) }} km</b
                >
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
              {{
                Object.entries(apiStore.dailyStatsData.globalDiff).find(
                  ([k, v]) => k == key
                )?.[1] || '--'
              }}
            </span>
          </span>
        </div>
      </div>
    </span>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useApiStore } from '../../store/apiStore';
import { Status } from '../../typings/common';
import { humanizeDuration } from '../../composables/time';

onMounted(() => {
  apiStore.fetchDailyStats();
});

const apiStore = useApiStore();

const topDispatchers = computed(() => {
  if (!apiStore.dailyStatsData || apiStore.dailyStatsData.mostActiveDispatchers.length == 0)
    return [];

  const maxCount = apiStore.dailyStatsData.mostActiveDispatchers[0].count;

  return apiStore.dailyStatsData.mostActiveDispatchers.filter((disp) => disp.count === maxCount);
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

@include responsive.smallScreen {
  h3 {
    text-align: center;
  }
}
</style>
