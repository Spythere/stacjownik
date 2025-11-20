<template>
  <section class="player-profile">
    <h2 class="profile-header">
      Profil użytkownika <b class="text--primary">{{ playerName }}</b>
    </h2>

    <div class="player-stats">
      <h3 class="stats-header">{{ t('player-profile.stats.dispatcher-header') }}</h3>

      <div class="info-stats" v-if="dispatcherStats?.services">
        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.dispatcher-count') }}</span>
          <span>{{ dispatcherStats.services.count }}</span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.dispatcher-max') }}</span>
          <span>{{ calculateDuration(dispatcherStats.services.durationMax) }}</span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.dispatcher-avg') }}</span>
          <span>{{ calculateDuration(dispatcherStats.services.durationAvg) }}</span>
        </span>
      </div>

      <h3 class="stats-header">DYŻURNY RUCHU - WYSTAWIONE ROZKŁADY JAZDY</h3>

      <div class="info-stats" v-if="dispatcherStats?.issuedTimetables">
        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.issued-timetables-count') }}</span>
          <span>{{ dispatcherStats.issuedTimetables.count }}</span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.issued-timetables-sum') }}</span>
          <span>{{ dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km</span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.issued-timetables-max') }}</span>
          <span>{{ dispatcherStats.issuedTimetables.distanceMax.toFixed(2) }}km</span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.issued-timetables-avg') }}</span>
          <span>{{ dispatcherStats.issuedTimetables.distanceAvg.toFixed(2) }}km</span>
        </span>
      </div>

      <h3 class="stats-header">{{ t('player-profile.stats.timetables-header') }}</h3>

      <div class="info-stats" v-if="driverStats">
        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-count-all') }}</span>
          <span>
            {{ driverStats._count._all }}
          </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-count-fulfilled') }}</span>
          <span>
            {{ driverStats._count.fulfilled }}

            <template v-if="driverStats._count._all > 0">
              ({{ ((driverStats._count.fulfilled / driverStats._count._all) * 100).toFixed(2) }}%)
            </template>
          </span>
        </span>
      </div>

      <div class="info-stats" v-if="driverStats">
        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-distance-max') }}</span>
          <span> {{ driverStats._max.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-distance-avg') }}</span>
          <span> {{ driverStats._avg.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-distance-all') }}</span>
          <span> {{ driverStats._sum.routeDistance.toFixed(2) }}km </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-distance-current') }}</span>
          <span>
            {{ driverStats._sum.currentDistance.toFixed(2) }}km

            <template v-if="driverStats._sum.routeDistance > 0">
              ({{
                ((driverStats._sum.currentDistance / driverStats._sum.routeDistance) * 100).toFixed(
                  2
                )
              }}%)
            </template>
          </span>
        </span>

        <span class="badge stat-badge">
          <span>{{ t('player-profile.stats.timetables-stations') }}</span>
          <span>
            {{ driverStats._sum.confirmedStopsCount }} /
            {{ driverStats._sum.allStopsCount }}

            <template v-if="driverStats._sum.allStopsCount > 0">
              ({{
                (
                  (driverStats._sum.confirmedStopsCount / driverStats._sum.allStopsCount) *
                  100
                ).toFixed(2)
              }}%)
            </template>
          </span>
        </span>
      </div>
    </div>

    <h3 class="journal-header">{{ t('player-profile.journal-title') }}</h3>

    <ul v-if="playerJournalComputed.length" class="journal-list">
      <li v-for="item in playerJournalComputed" class="journal-item">
        <!-- Timetable type -->
        <div v-if="'beginDate' in item" class="item-wrapper">
          <div class="type-indicator train">
            <img src="/images/icon-train.svg" alt="icon train" />
          </div>

          <div>
            {{ new Date(item.scheduledBeginDate).toLocaleString('pl-PL') }} -
            {{ new Date(item.scheduledEndDate).toLocaleString('pl-PL') }} timetable
            {{ item.route }}
            {{ item.driverName }}
          </div>
        </div>

        <!-- Dispatcher type -->
        <div v-else class="item-wrapper">
          <div class="type-indicator dispatcher">
            <img src="/images/icon-user.svg" alt="icon user" />
          </div>

          <div>
            {{ new Date(item.timestampFrom).toLocaleString('pl-PL') }}
            {{ item.timestampTo ? ' - ' + new Date(item.timestampTo).toLocaleString('pl-PL') : '' }}
            dispatcher {{ item.stationName }}
          </div>
        </div>
      </li>
    </ul>
    <!-- 
    <div class="modes-options">
      <button
        class="btn btn--option"
        :data-checked="currentJournalMode == 'timetables'"
        @click="toggleJournalMode('timetables')"
      >
        ROZKŁADY JAZDY
      </button>
      <button
        class="btn btn--option"
        :data-checked="currentJournalMode == 'issuedTimetables'"
        @click="toggleJournalMode('issuedTimetables')"
      >
        STWORZONE RJ
      </button>
      <button
        class="btn btn--option"
        :data-checked="currentJournalMode == 'duties'"
        @click="toggleJournalMode('duties')"
      >
        DYŻURY
      </button>
    </div> -->
  </section>
</template>

<script setup lang="ts">
import { computed, onActivated, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';
import { Status } from '../typings/common';
import { useI18n } from 'vue-i18n';

// type JournalModeType = 'duties' | 'timetables' | 'issuedTimetables';

const apiStore = useApiStore();
const route = useRoute();
const { t } = useI18n();

// Variables
const dataStatus = ref<Status.Data>(Status.Data.Initialized);
const playerJournal = ref<API.PlayerJournal.Response | null>(null);
const dispatcherStats = ref<API.DispatcherStats.Response | null>(null);
const driverStats = ref<API.DriverStats.Response | null>(null);

// const currentJournalMode = ref<JournalModeType>('timetables');

// const journalModes = reactive<Record<JournalModeType, boolean>>({
//   duties: true,
//   issuedTimetables: true,
//   timetables: true
// });

const playerId = computed(() => route.params.id);

const playerName = computed(() => {
  if (!playerJournal.value) return null;

  return (
    playerJournal.value.timetables[0]?.driverName ??
    playerJournal.value.duties[0]?.dispatcherName ??
    null
  );
});

const playerJournalComputed = computed(() => {
  if (!playerJournal.value) return [];

  const journalItems = [];

  journalItems.push(...playerJournal.value.duties);
  journalItems.push(...playerJournal.value.timetables);
  journalItems.push(...playerJournal.value.issuedTimetables);
  // switch (currentJournalMode.value) {
  //   case 'duties':

  //     break;

  //   case 'timetables':

  //     break;

  //   case 'issuedTimetables':

  //     break;

  //   default:
  //     break;
  // }

  return journalItems.sort((v1, v2) => {
    return (
      ('beginDate' in v2 ? new Date(v2.beginDate).getTime() : v2.timestampFrom) -
      ('beginDate' in v1 ? new Date(v1.beginDate).getTime() : v1.timestampFrom)
    );
  });
});

// Lifecycle hooks
onActivated(() => {
  fetchPlayerData();
});

// Methods
function calculateDuration(timestampMs: number, showSeconds = false) {
  const secondsTotal = Math.floor(timestampMs / 1000);
  const minsTotal = Math.round(timestampMs / 60000);
  const hoursTotal = Math.floor(minsTotal / 60);
  const minsInHour = minsTotal % 60;

  return minsTotal >= 60
    ? `${t('journal.hours', { value: hoursTotal }, hoursTotal)} ${t(
        'journal.minutes',
        { value: minsInHour },
        minsInHour
      )}`
    : showSeconds && secondsTotal <= 60
      ? t('journal.seconds', { value: secondsTotal }, secondsTotal)
      : t('journal.minutes', { value: minsTotal }, minsTotal);
}

async function fetchPlayerData() {
  if (!apiStore.client) return;

  try {
    dataStatus.value = Status.Data.Loading;

    const [playerJournalResponse, driverInfoResponse, dispatcherInfoResponse] = await Promise.all([
      apiStore.client.get<API.PlayerJournal.Response>('/api/getPlayerJournal', {
        params: { playerId: playerId.value, countLimit: 30 }
      }),
      apiStore.client.get<API.DriverStats.Response>('/api/getDriverStats', {
        params: { playerId: playerId.value }
      }),
      apiStore.client.get<API.DispatcherStats.Response>('/api/getDispatcherStats', {
        params: { playerId: playerId.value }
      })
    ]);

    playerJournal.value = playerJournalResponse.data;
    driverStats.value = driverInfoResponse.data;
    dispatcherStats.value = dispatcherInfoResponse.data;

    dataStatus.value = Status.Data.Loaded;
  } catch (error) {
    console.error('Error when fetching data:', error);

    playerJournal.value = null;
    driverStats.value = null;
    dispatcherStats.value = null;

    dataStatus.value = Status.Data.Error;
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/badge';
@use '../styles/responsive';

.player-profile {
  padding: 1em;

  max-width: var(--max-container-width);
  background-color: var(--clr-view-bg);
  margin: 1em auto;

  min-height: 700px;
  height: calc(100vh - 8.5em);

  display: grid;
  grid-template-rows: auto auto auto 1fr;
}

.info-stats {
  display: flex;
  flex-wrap: wrap;

  gap: 0.5em;
  margin-bottom: 0.5em;
}

.stats-header,
.journal-header {
  padding: 0.5em 0;
}

.journal-list {
  overflow: auto;
  min-height: 100%;
}

.journal-item {
  padding: 0.5em 0;
  padding-right: 0.5em;

  &:last-child .type-indicator::after {
    background-color: transparent;
  }
}

.item-wrapper {
  display: grid;
  grid-template-columns: 2em 1fr;
  align-items: center;
  gap: 0.5em;
}

.type-indicator {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  z-index: 10;

  width: 1.5rem;
  height: 1.5rem;
  padding: 1rem;
  border-radius: 50%;

  font-weight: bold;

  img {
    width: 20px;
  }

  &.train {
    background-color: var(--clr-bg);
  }

  &.dispatcher {
    background-color: var(--clr-bg);
  }

  &::after {
    content: '';

    position: absolute;
    z-index: -10;
    top: 100%;

    width: 5px;
    height: 100%;
    background-color: var(--clr-bg);
  }
}

@include responsive.smallScreen {
  h2,
  h3 {
    text-align: center;
  }

  .stats-header {
    text-align: center;
  }

  .info-stats {
    justify-content: center;
  }
}
</style>
