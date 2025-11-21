<template>
  <section class="player-profile">
    <h2 class="profile-header">
      Profil użytkownika <b class="text--primary">{{ playerName }}</b>
    </h2>

    <div class="player-stats">
      <h3 class="stats-header">STATYSTYKI MASZYNISTY</h3>

      <div class="driver-stats" v-if="driverStats">
        <div class="stat-item">
          <div>{{ driverStats._count._all }}</div>
          <div class="separator"></div>
          <div>ROZKŁADY JAZDY</div>
        </div>

        <div class="stat-item">
          <div>
            {{ driverStats._count.fulfilled }}
            ({{ ((driverStats._count.fulfilled / driverStats._count._all) * 100).toFixed(2) }}%)
          </div>
          <div class="separator"></div>
          <div>WYPEŁNIONE ROZKŁADY</div>
        </div>

        <div class="stat-item">
          <div>{{ driverStats._sum.routeDistance.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>DYSTANS ROZKŁADÓW</div>
        </div>

        <div class="stat-item">
          <div>
            {{ driverStats._sum.currentDistance.toFixed(2) }}km ({{
              ((driverStats._sum.currentDistance / driverStats._sum.routeDistance) * 100).toFixed(
                2
              )
            }}%)
          </div>
          <div class="separator"></div>
          <div>PRZEBYTY DYSTANS</div>
        </div>

        <div class="stat-item">
          <div>{{ driverStats._max.routeDistance.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>NAJDŁUŻSZY ROZKŁAD</div>
        </div>

        <div class="stat-item">
          <div>{{ driverStats._avg.routeDistance.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>ŚREDNIA DŁUGOŚĆ</div>
        </div>

        <div class="stat-item">
          <div>
            {{ driverStats._sum.confirmedStopsCount }} / {{ driverStats._sum.allStopsCount }} ({{
              (
                (driverStats._sum.confirmedStopsCount / driverStats._sum.allStopsCount) *
                100
              ).toFixed(2)
            }}%)
          </div>
          <div class="separator"></div>
          <div>LICZBA STACJI</div>
        </div>

        <!-- <div class="stat-circle">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle" fill="white">
              {{ percent }}%
            </text>

            <circle cx="50" cy="50" r="45" fill="none" stroke="#aaa" stroke-width="10" />

            <circle
              class="percent fifty"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="gold"
              stroke-width="10"
              :stroke-dasharray="`${percent} ${100 - percent}`"
              stroke-dashoffset="-75"
              pathLength="100"
            />
          </svg>

          <div>
            145 / 160 <br />
            UKOŃCZONYCH RJ
          </div>
        </div> -->
      </div>

      <h3 class="stats-header">STATYSTYKI DYŻURNEGO</h3>

      <div class="dispatcher-stats" v-if="dispatcherStats">
        <div class="stat-item" v-if="dispatcherStats.services">
          <div>{{ dispatcherStats.services.count }}</div>
          <div class="separator"></div>
          <div>SŁUŻBY DYŻURNEGO</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.services">
          <div>{{ calculateDuration(dispatcherStats.services.durationMax) }}</div>
          <div class="separator"></div>
          <div>NAJDŁUŻSZY CZAS SŁUŻBY</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.services">
          <div>{{ calculateDuration(dispatcherStats.services.durationAvg) }}</div>
          <div class="separator"></div>
          <div>ŚREDNI CZAS SŁUŻBY</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.issuedTimetables">
          <div>{{ dispatcherStats.issuedTimetables.count }}</div>
          <div class="separator"></div>
          <div>WYSTAWIONE ROZKŁADY</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.issuedTimetables">
          <div>{{ dispatcherStats.issuedTimetables.distanceMax.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>NADJŁUŻSZY ROZKŁAD</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.issuedTimetables">
          <div>{{ dispatcherStats.issuedTimetables.distanceSum.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>SUMA ROZKŁADÓW</div>
        </div>

        <div class="stat-item" v-if="dispatcherStats.issuedTimetables">
          <div>{{ dispatcherStats.issuedTimetables.distanceAvg.toFixed(2) }}km</div>
          <div class="separator"></div>
          <div>ŚREDNIA ROZKŁADÓW</div>
        </div>
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
import { computed, onActivated, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';
import { Status } from '../typings/common';
import { useI18n } from 'vue-i18n';

// type JournalModeType = 'duties' | 'timetables' | 'issuedTimetables';

const apiStore = useApiStore();
const route = useRoute();
const { t } = useI18n();

const percent = ref(25);

// onMounted(() => {
//   setInterval(() => {
//     percent.value++;

//     if (percent.value >= 100) percent.value = 0;
//   }, 100);
// });

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
  // height: calc(100vh - 8.5em);

  display: grid;
  grid-template-rows: auto auto auto auto;
}

.driver-stats,
.dispatcher-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5em;
  width: 100%;
  overflow: auto;
}

.stat-item {
  padding: 0.5em;
  background-color: #333;
  text-align: center;
  font-weight: bold;
  border-radius: 0.5em;
}

.stat-item > div:first-child {
  color: var(--clr-primary);
}

.stat-item > .separator {
  width: 100%;
  height: 2px;
  background-color: #fff;
  margin: 0.25em 0;
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

.circular-progress {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(hotpink 75%, pink 0);
}

.inner-circle {
  position: absolute;
  top: 15px;
  left: 15px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;
  color: hotpink;
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
