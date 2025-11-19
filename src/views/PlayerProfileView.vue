<template>
  <section class="player-profile">
    <h2 class="header">
      Profil użytkownika <b class="text--primary">{{ playerName }}</b>
    </h2>
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

    <h3 class="journal-header">Historia ostatniej aktywności</h3>

    <ul v-if="playerJournalComputed.length" class="journal-list">
      <li v-for="item in playerJournalComputed" class="journal-item">
        <!-- Timetable type -->
        <div v-if="'beginDate' in item" class="item-wrapper">
          <div class="type-indicator train">
            <img src="/images/icon-train.svg" alt="icon train" />
          </div>

          <div>
            {{ new Date(item.scheduledBeginDate).toLocaleString('pl-PL') }} -
            {{ new Date(item.scheduledEndDate).toLocaleString('pl-PL') }} timetable {{ item.route }}
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
  </section>
</template>

<script setup lang="ts">
import { computed, onActivated, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useApiStore } from '../store/apiStore';
import { API } from '../typings/api';
import { Status } from '../typings/common';

type JournalModeType = 'duties' | 'timetables' | 'issuedTimetables';

const apiStore = useApiStore();
const route = useRoute();

// Variables
const dataStatus = ref<Status.Data>(Status.Data.Initialized);
const playerJournal = ref<API.PlayerJournal.Response | null>(null);
const dispatcherStats = ref<API.DispatcherStats.Response | null>(null);
const driverStats = ref<API.DriverStats.Response | null>(null);

const currentJournalMode = ref<JournalModeType>('timetables');

const journalModes = reactive<Record<JournalModeType, boolean>>({
  duties: true,
  issuedTimetables: true,
  timetables: true
});

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
function toggleJournalMode(mode: JournalModeType) {
  // let stateAfter = !journalModes[mode];

  // if (
  //   stateAfter == false &&
  //   Object.values(journalModes).filter((v) => v == false).length >=
  //     Object.values(journalModes).length - 1
  // )
  //   return;

  // journalModes[mode] = stateAfter;

  currentJournalMode.value = mode;
}

async function fetchPlayerData() {
  if (!apiStore.client) return;

  try {
    dataStatus.value = Status.Data.Loading;

    const [playerJournalResponse, driverInfoResponse, dispatcherInfoResponse] = await Promise.all([
      apiStore.client.get<API.PlayerJournal.Response>('/api/getPlayerJournal', {
        params: { playerId: playerId.value, countLimit: 30 }
      }),
      apiStore.client.get<API.DriverStats.Response>('/api/getDriverInfo', {
        params: { playerId: playerId.value }
      }),
      apiStore.client.get<API.DispatcherStats.Response>('/api/getDispatcherInfo', {
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
.player-profile {
  padding: 1em;

  max-width: var(--max-container-width);
  background-color: var(--clr-view-bg);
  margin: 1em auto;

  height: calc(100vh - 8.5em);

  display: grid;
  grid-template-rows: auto auto 1fr;
}

.modes-options {
  display: flex;
  gap: 0.5em;
  margin: 1em 0;

  button {
    font-weight: bold;

    &[data-checked='true'] {
      color: var(--clr-primary);
    }
  }
}

.journal-header {
  margin: 0.5em 0;
}

.journal-list {
  overflow: auto;
  min-height: 100%;
  padding: 0.5em 0;
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
</style>
